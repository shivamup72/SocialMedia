import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import HeaderComponents from '../Header/HeaderComponents';
import {
  fonts,
  DarkColor,
  mainOrange80,
  mainOrange50,
  mainOrangeColor,
} from '../../utils/style/fonts';
import Avatar from '../../components/AvatarComponents/Avatar';
import { apiGet } from '../../Api/config/apiFunctions';
import { userListing } from '../../Api/config/apiUrls';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyListComponents from '../../components/EmptyListComponents';
import ScreenView from '../../utils/ScreenView';
import { RfH } from '../../utils/helper';

const PrivateChatScreen = ({ navigation }) => {
  const [UserData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [SearchValue, setSearchValue] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const result = await apiGet(userListing, { page: 1, page_size: 60 });
        setUserData(result?.results);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    if (SearchValue?.trim() === '') {
      setFilteredData(UserData);
    } else {
      const seachTrim = SearchValue?.trim();
      const lowercasedValue = seachTrim?.toLowerCase();
      const filtered = UserData?.filter(item => {
        const firstName = (item?.first_name || '').toLowerCase();
        const lastName = (item?.last_name || '').toLowerCase();
        const email = (item?.email || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;

        return (
          fullName.includes(lowercasedValue) || email.includes(lowercasedValue)
        );
      });
      setFilteredData(filtered);
    }
  }, [SearchValue, UserData]);

  const handlePrivateChatNavigation = item => {
    const name = item.first_name + ' ' + item.last_name;
    // console.log('item -=-=-=-=-=-=-=------>', item, '\n', '\n');
    navigation.navigate('ChatWindows', {
      conversationId: item?.conversation_id,
      isGroup: false,
      GroupId: item.id,
      name: name,
      email: item?.email,
      avatar: item?.profile_picture,
      type: item?.conversation_id ? 'old' : 'new',
      navigatetype: 'privatenavigate',
    });
  };

  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => handlePrivateChatNavigation(item)}>
        <View style={styles.avatarContainer}>
          <Avatar
            avatarUri={item.profile_picture}
            name={item.first_name + ' ' + item.last_name}
            email={item.email}
            size={50}
            borderRadius={30}
            fontSize={16}
          />
        </View>
        <Text style={styles.contactName}>
          {item.first_name?.trim() === '' && item.last_name?.trim() === ''
            ? item.email
            : `${item.first_name} ${item.last_name}`}
        </Text>
      </TouchableOpacity>
    );
  };

  // console.log('filteredData', filteredData);

  return (
    <ScreenView>
      <HeaderComponents
        setSearchValue={setSearchValue}
        SearchValue={SearchValue}
        navigation={navigation}
        full="check"
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={mainOrangeColor} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              console.log('Retry logic needs to be implemented');
            }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredData?.length > 0 ? (
        <View style={{ paddingBottom: RfH(220) }}>
          <FlatList
            data={filteredData}
            renderItem={renderContactItem}
            keyExtractor={item => item?.id?.toString()}
            scrollEnabled={true}
            // ListEmptyComponent={
            //   <>
            //     <EmptyListComponents text="No data" type={1} />
            //   </>
            // }
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
          />
        </View>

      ) : (
        <View style={styles.emptyContainer}>
          <EmptyListComponents text="No data" type={1} />
        </View>
      )}
    </ScreenView>
  );
};

export default PrivateChatScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: mainOrangeColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: fonts.PoppinsMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the FAB
  },

  gradientContainer: {
    height: 280,
  },
  // --- Top Section Styles ---
  topContainer: {
    backgroundColor: mainOrange50,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  groupIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIconPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mainOrange50,
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  groupIconLabel: {
    marginTop: 5,
    fontFamily: fonts.PoppinsLight,
    fontSize: 12,
    color: DarkColor,
  },
  groupNameLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    color: DarkColor,
    marginBottom: 5,
    textAlign: 'center',
  },
  groupNameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: mainOrange80,
    paddingHorizontal: 15,
    height: 45,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
  },
  groupNameHint: {
    fontFamily: fonts.PoppinsLight,
    fontSize: 10,
    color: '#828282',
    marginTop: 2,
    alignSelf: 'center',
  },
  memberCount: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    color: DarkColor,
    textAlign: 'center',
    marginTop: 10,
  },
  // --- Bottom Section Styles ---
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginTop: -25, // To create the overlap effect
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  addMembersTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 18,
    color: DarkColor,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: mainOrangeColor,
    paddingHorizontal: 15,
    marginBottom: 20,
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
  // --- Contact List Styles ---
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderColor: mainOrangeColor,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    // borderRadius: 25,
    // marginRight: 15,
    // borderColor: mainOrangeColor,
    // borderWidth: 1,
    // borderColor: mainOrangeColor,
    // borderWidth: 1,
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
});
