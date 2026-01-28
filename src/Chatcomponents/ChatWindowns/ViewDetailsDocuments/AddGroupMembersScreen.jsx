import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GetUserListingApi } from '../../../Api/config/HomeApi';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import {
  fonts,
  mainOrangeColor,
  DarkColor,
  mainWhiteColor,
  DarkColor50,
} from '../../../utils/style/fonts';
import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import SearchSvg from '../../../assets/svg/SearchSvg';
import Toast from '../../../Api/context/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddGroupMembersScreen = ({ navigation, route }) => {
  const ArrowIcon = require('../../../assets/LoginAssets/png/ArrowLogo.png');
  const SelectedGroupMemberImage = require('../../../assets/Png/SelectedGroupMemberImage.png');
  const [userData, setuserData] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchText, setSearchText] = useState('');
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const toastRef = useRef(null);

  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const FetchData = async () => {
      try {
        // const resData = await AsyncStorage1.getItem('userLoginResponse');
        // console.log('resData add screen --=-==--->',JSON.stringify(resData))
        const res = await GetUserListingApi({ page: 1, page_size: 50 });

        const AddeduserList = res?.results.map(item => ({
          ...item,
          isSelected: false,
        }));
        // console.log('res Add group screen --=-==--->',AddeduserList)
        setuserData(AddeduserList);
      } catch (err) {
        console.log('err user list Contact screen --=-==--->', err);
      }
    };
    FetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) {
      return userData;
    }
    const lowercasedFilter = searchText.toLowerCase();
    return userData.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''
        }`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      return (
        fullName.includes(lowercasedFilter) || email.includes(lowercasedFilter)
      );
    });
  }, [userData, searchText]);

  const handleSelectMember = id => {
    setuserData(prevData =>
      prevData.map(user =>
        user.id === id ? { ...user, isSelected: !user.isSelected } : user,
      ),
    );

    if (selectedMembers.includes(id)) {
      setSelectedMembers(prev => prev.filter(memberId => memberId !== id));
    } else {
      setSelectedMembers(prev => [...prev, id]);
    }
  };

  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => handleSelectMember(item.id)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.profile_picture
                ? { uri: item.profile_picture }
                : require('../../../assets/Png/ProfileIcon.png')
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.contactName}>
          {item.first_name?.trim() === '' && item.last_name?.trim() === ''
            ? item.email
            : `${item.first_name} ${item.last_name}`}
        </Text>
        {item?.isSelected && (
          <Image source={SelectedGroupMemberImage} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // console.log('last Message ------->', JSON.stringify(lastMessage), '\n', '\n');

  const handleGroupCreate = () => {
    const selectedUserIds = userData
      .filter(user => user.isSelected)
      .map(user => user.id);

    if (selectedUserIds.length === 0) {
      Alert.alert('Please select at least one member');
      return;
    }

    const Payload = {
      action: 'update_members',
      update_type: 'add_member',
      group_id: route.params.GroupId,
      member_ids: selectedUserIds,
    };
    console.log('Selected User IDs/:', Payload);
    sendMessage(Payload);
  };

  useEffect(() => {
    if (lastMessage?.type === 'success' && lastMessage?.data?.updated_members) {
      // console.log('lastMessage--==-==--->', JSON.stringify(lastMessage));
      navigation.goBack();
    }

    if (lastMessage?.type === 'error') {
      toastRef.current.show({
        type: 'error',
        message: lastMessage?.message,
      });
    }
  }, [lastMessage]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <HeaderComponents navigation={navigation} Type={'Add Group Members'} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Members"
          placeholderTextColor={DarkColor50}
          value={searchText}
          onChangeText={setSearchText}
        />
        <SearchSvg width="20" height="20" color={mainOrangeColor} />
      </View>

      {filteredUsers.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
          <Text style={{
            color: mainOrangeColor,
            fontSize: 16,
            fontFamily: fonts.PoppinsSemiBold,
          }}>No data found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleGroupCreate}>
        <Image source={ArrowIcon} style={styles.fabIcon} />
      </TouchableOpacity>

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
};

export default AddGroupMembersScreen;

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  avatarContainer: {
    width: 51,
    height: 51,
    borderRadius: 25,
    marginRight: 15,
    borderColor: mainOrangeColor,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderColor: mainOrangeColor,
    borderWidth: 1,
  },
  contactName: {
    flex: 1,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 16,
    color: DarkColor,
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
  // --- FAB Styles ---
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 30,
    // backgroundColor: mainOrangeColor,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  fabIcon: {
    width: 50,
    height: 50,
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F6F6',

    // marginLeft: 5,
  },

  checkIconContainer: {
    borderWidth: 1,
    borderColor: DarkColor,
    borderRadius: 12,
    // padding:2,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: mainOrangeColor,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 10,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    // fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor,
  },
  searchIconSvg: {
    marginLeft: 10,
  },
});
