import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  GetUserListingApi,
  PatchSelectedMembersApi,
  GetSelectedMembersApi,
} from '../../Api/config/HomeApi';
import {
  fonts,
  DarkColor80,
  DarkColor,
  DarkColor60,
  mainWhiteColor,
  mainOrangeColor,
} from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const UserListingComponents = ({ visible, onClose, idCheck }) => {
  const [UserListingData, setUserListingData] = useState([]);

  useEffect(() => {
    const FetchData = async () => {
      try {
        const res2 = await GetUserListingApi({ page: 1, page_size: 100 });
        const userList = res2?.results || [];
        setUserListingData(userList);
      } catch (error) {
        console.log('error', error);
      }
    };

    FetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = UserListingData?.filter(user => {
    const searchLower = searchQuery?.toLowerCase();
    return (
      user.first_name?.toLowerCase()?.includes(searchLower) ||
      user.last_name?.toLowerCase()?.includes(searchLower) ||
      user.email?.toLowerCase()?.includes(searchLower)
    );
  });

  const handleAssigneeSelect = async assignees => {
    console.log('assignees -=-=-=-=----->', assignees, '\n', idCheck);
    // try {
    //   // const formData = new FormData();
    //   // formData.append('workspace_manager', assignees?.id);
    //   // const respatch = PatchSelectedMembersApi(idCheck, formData);
    //   // console.log('respatch -=-=-=-=---> ', respatch);

    //   // const res = await GetSelectedMembersApi(idCheck);
    //   // console.log('res -=-=-=-=---> ', res);
    //   // onClose();
    // } catch (error) {
    //   console.log('error', error);
    // }
    // onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={[styles.modalContent, { width: '80%', maxHeight: '70%' }]}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={DarkColor60}
              autoFocus={true}
              allowFontScaling={false}
            />
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <CustomText style={styles.noResultsText}>No users found</CustomText>
            }
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleAssigneeSelect(item)}>
                  <Image
                    source={
                      item.profile_picture
                        ? { uri: item.profile_picture }
                        : require('../../assets/Png/ProfileIcon.png')
                    }
                    style={styles.avatar}
                  />
                  <CustomText allowFontScaling={false} style={styles.modalOptionText}>
                    {item.first_name || item.last_name
                      ? `${item.first_name || ''} ${item.last_name || ''
                        }`.trim()
                      : item.email || 'No Name'}
                  </CustomText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default UserListingComponents;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    marginLeft: 12,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DarkColor60,
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: mainOrangeColor,
    borderColor: mainOrangeColor,
  },
  checkbox: {
    width: 13,
    height: 13,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: DarkColor60,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 15,
  },
  checkboxSelected: {
    backgroundColor: mainOrangeColor,
    borderColor: mainOrangeColor,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  searchContainer: {
    padding: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    // fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  noResultsText: {
    textAlign: 'center',
    padding: 20,
    color: DarkColor60,
    fontFamily: fonts.PoppinsRegular,
  },
});
