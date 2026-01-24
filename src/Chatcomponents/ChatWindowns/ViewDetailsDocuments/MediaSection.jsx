import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import Toast from '../../../Api/context/Toast';
import LeaveGroupSvg from '../../../assets/svg/LeaveGroupSvg';
import SearchSvg from '../../../assets/svg/SearchSvg';

const ViewProfileIcon = ({ style }) => (
  <Image
    style={style}
    source={require('../../../assets/ChatAssets/png/ViewProfileImage.png')}
  />
);

const RemoveAdminIcon = ({ style }) => (
  <Image
    style={style}
    source={require('../../../assets/ChatAssets/png/RemoveAsAdmin.png')}
  />
);

const MakeAdminIcon = ({ style }) => (
  <Image
    style={style}
    source={require('../../../assets/ChatAssets/png/MakeAdminImage.png')}
  />
);

const RemoveUserIcon = ({ style }) => (
  <Image
    style={style}
    source={require('../../../assets/ChatAssets/png/RemoveAsAdmin.png')}
  />
);

const CrownIcon = ({ width, height }) => (
  <Image
    style={{ width, height }}
    source={require('../../../assets/ChatAssets/png/CrownIcon.png')}
  />
);

import {
  DarkColor,
  mainWhiteColor,
  fonts,
  mainOrangeColor,
  DarkColor20,
  DarkColor60,
  DarkColor80,
  DarkColor50,
} from '../../../utils/style/fonts';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import PrivateScreenViewDetails from './PrivateScreenViewDetails';
import EmptyListComponents from '../../../components/EmptyListComponents';

const GroupInfoSection = ({
  navigation,
  isGroup,
  MembersList,
  GroupId,
  onMemberUpdate,
  MediaFile,
  CommonGroup,
  LoginUser,
}) => {
  const pLusIcon = require('../../../assets/Png/PlusIcon.png');
  console.log(CommonGroup, 'CommonGroup in group info section');


  // console.log('MembersList group InfoSection ====>', LoginUser);
  // const hasAdmin = MembersList?.some(m => m.is_admin);
  // console.log('Has admin:', hasAdmin);

  if (!isGroup) {
    return (
      <PrivateScreenViewDetails
        navigation={navigation}
        MembersList={MediaFile}
        GroupId={GroupId}
        CommonGroup={CommonGroup?.items}
      />
    );
  }
  const toastRef = useRef(null);

  const [activeTab, setActiveTab] = useState('admin');
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [ConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);


  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredMembers(sortedMembersList);
    } else {
      const filtered = sortedMembersList.filter(member => {
        const memberName = member.name?.toLowerCase().trim() || '';
        const memberEmail = member.email?.toLowerCase().trim() || '';
        const searchLower = searchText.toLowerCase().trim();
        return (
          memberName.includes(searchLower) || memberEmail.includes(searchLower)
        );
      });
      setFilteredMembers(filtered);
    }
  }, [searchText, MembersList]);

  const [modal, setModal] = useState({
    visible: false,
    user: null,
    position: { top: 0, left: 0 },
  });

  const userItemRefs = useRef({});

  useEffect(() => {
    if (lastMessage?.type === 'error') {
      console.log('lastMessage check on group info section ====>', lastMessage);
      // toastRef.current.show({
      //   type: 'error',
      //   message: lastMessage?.message,
      // });
    }
  }, [lastMessage]);

  const handleUserPress = user => {
    // Log true on every user item click
    console.log(user, "user clicked");

    const itemRef = userItemRefs.current[user.id];

    if (itemRef) {
      itemRef.measure((x, y, width, height, pageX, pageY) => {
        const { width: screenWidth, height: screenHeight } =
          Dimensions.get('window');

        let modalTop = pageY + height + 5;
        let modalLeft = pageX - 15;

        const modalHeight = 150;
        if (modalTop + modalHeight > screenHeight) {
          modalTop = pageY - modalHeight + 30;
        }

        const modalWidth = 180;
        if (modalLeft + modalWidth > screenWidth) {
          modalLeft = screenWidth - modalWidth - 10;
        }

        setModal({
          visible: true,
          user,
          position: { top: modalTop, left: modalLeft },
        });
      });
    }
  };

  const sortedMembersList = (MembersList || [])
    .slice()
    .sort((a, b) => b.is_admin - a.is_admin);

  const closeModal = () => {
    setModal({ ...modal, visible: false });
  };

  const handleContactListNavigation = () => {
    navigation.navigate('AddGroupMembersScreen', { GroupId: GroupId });
  };

  const handleRemoveMember = (GroupId1, member_ids) => {
    const payload = {
      action: 'update_members',
      update_type: 'remove_member',
      group_id: GroupId1,
      member_ids: [member_ids],
    };

    sendMessage(payload);

    setTimeout(() => {
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    }, 1000);
    closeModal();
  };

  const handleMakeAdmin = (GroupId1, member_ids) => {
    const payload = {
      action: 'update_members',
      update_type: 'make_admin',
      group_id: GroupId1,
      member_ids: [member_ids],
    };
    sendMessage(payload);
    setTimeout(() => {
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    }, 1000);
    closeModal();
  };

  const handleRemoveAdmin = (GroupId1, member_ids) => {
    const payload = {
      action: 'update_members',
      update_type: 'remove_admin',
      group_id: GroupId1,
      member_ids: [member_ids],
    };
    // console.log('payload remove admin ====>', payload);
    sendMessage(payload);
    setTimeout(() => {
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    }, 1000);
    closeModal();
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItemWrapper}>
      <TouchableOpacity
        ref={ref => (userItemRefs.current[item.id] = ref)}
        style={styles.userItemContainer}
        onPress={() => handleUserPress(item)}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../assets/Png/ProfileIcon.png')}
            style={styles.avatar}
          />
          {item.is_admin && (
            <View style={styles.crownContainer}>
              <CrownIcon width={20} height={20} />
            </View>
          )}
        </View>
        <Text
          allowFontScaling={false}
          style={styles.userName}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.name === '' ? item.email : item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // navigation.navigate('ChatViewDetails', {
  //   isGroup: isGroup,
  //   GroupId: GroupId,
  //   name: name,
  //   email: data?.email,
  // });

  const handleViewProfile = user => {
    closeModal();
    navigation.navigate('ChatViewDetails', {
      conversationId: user?.user?.conversation_id,
      isGroup: user?.user?.is_group,
      GroupId: user?.user?.id,
      name: user?.user?.name || user?.user?.email,
      avatar: user?.user?.avatar,
      email: user?.user?.email,
      type: user?.user?.conversation_id ? 'old' : 'new',
    });
  };

  const renderModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modal.visible}
      onRequestClose={closeModal}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeModal}>
        <View
          onStartShouldSetResponder={() => true}
          style={[
            styles.modalContent,
            { top: modal.position.top - 20, left: modal.position.left },
          ]}>
          {modal.user && (
            <>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleViewProfile(modal)}>
                <ViewProfileIcon style={styles.modalIcon} />
                <Text allowFontScaling={false} style={styles.modalOptionText}>
                  View Profile
                </Text>
              </TouchableOpacity>

              {modal?.user?.is_admin && LoginUser?.is_admin && (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleRemoveAdmin(GroupId, modal.user.id)}>
                  <RemoveAdminIcon style={styles.modalIcon} />
                  <Text allowFontScaling={false} style={styles.modalOptionText}>
                    Remove as admin
                  </Text>
                </TouchableOpacity>
              )}

              {!modal?.user?.is_admin == true && (
                <>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => handleMakeAdmin(GroupId, modal.user.id)}>
                    <MakeAdminIcon style={styles.modalIcon} />
                    <Text
                      allowFontScaling={false}
                      style={styles.modalOptionText}>
                      Make admin
                    </Text>
                  </TouchableOpacity>
                  {!modal?.user?.is_admin && LoginUser?.is_admin && (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() =>
                        handleRemoveMember(GroupId, modal.user.id)
                      }>
                      <RemoveUserIcon style={styles.modalIcon} />
                      <Text
                        allowFontScaling={false}
                        style={styles.modalOptionText}>
                        Remove User
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleOpenConfirmationModal = () => {
    setConfirmationModalVisible(true);
  };

  const handleGroupLeave = () => {
    const payload = {
      action: 'leave_group',
      group_id: GroupId,
    };
    console.log('payload ====>', payload);
    sendMessage(payload);
    setTimeout(() => {
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    }, 1000);
    setConfirmationModalVisible(false);
    navigation.navigate('Home', {
      screen: 'Chat',
      params: { screen: 'ChatMain' },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.membersSection}>
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

        <FlatList
          data={searchText ? filteredMembers : sortedMembersList}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.userListContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyListComponents
              type={1}
              text={'No Members Found'}
              marginData={5}
            />
          }
          ListFooterComponent={
            <TouchableOpacity onPress={handleOpenConfirmationModal}>
              <View style={styles.addMemberContainer}>
                <LeaveGroupSvg />
                <Text allowFontScaling={false} style={styles.addMemberText}>
                  Leave Group
                </Text>
              </View>
            </TouchableOpacity>
          }
        // ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      </View>

      {LoginUser?.is_admin && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: '#ffffff',
            bottom: 10,
            right: 10,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={handleContactListNavigation}>
            <Image source={pLusIcon} style={{ width: 45, height: 45 }} />
          </TouchableOpacity>
        </View>
      )}

      {renderModal()}
      {/* ConfirmationModal for Leave Group */}
      <Modal
        visible={ConfirmationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmationModalVisible(false)}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationTitle}>Leave Group</Text>

            <Text style={styles.confirmationMessage}>
              Are you sure you want to leave this group?
            </Text>

            <View style={styles.confirmationButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmationModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleGroupLeave}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast ref={toastRef} />
    </View>
  );
};

export default GroupInfoSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: mainWhiteColor,
    flex: 1,
    marginTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: DarkColor80,
    marginRight: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: DarkColor20,
    marginHorizontal: 16,
  },
  membersSection: {
    marginTop: 10,
    paddingHorizontal: 16,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: DarkColor20,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
  },
  activeTabText: {
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  activeTabIndicator: {
    height: 3,
    width: '115%',
    backgroundColor: mainOrangeColor,
    position: 'absolute',
    bottom: -1,
    borderRadius: 2,
  },
  userListContainer: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  userItemWrapper: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: DarkColor20,
    borderBottomWidth: 1,
    marginVertical: 5,
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    left: -5,
    transform: [{ rotate: '-5deg' }],
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    flexShrink: 1, // allow text to wrap
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    position: 'absolute',
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minWidth: 150,
    zIndex: 1000, // Ensure modal stays above other elements
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  modalIcon: {
    marginRight: 8,
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: DarkColor,
  },
  modalOptionText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  addMemberContainer: {
    paddingVertical: 14,
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    // paddingVertical: 16,
  },

  addMemberText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: '#EC360E',
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    padding: 8,
    paddingRight: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: DarkColor50,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    marginTop: 10,
  },
  searchIconSvg: {
    marginLeft: 10,
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
  confirmationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  confirmationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 300,
  },

  confirmationTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsMedium,
    marginBottom: 12,
    color: DarkColor,
  },

  confirmationMessage: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    marginBottom: 24,
    textAlign: 'center',
  },

  confirmationButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: DarkColor20,
    marginRight: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },

  leaveButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EC360E',
    marginLeft: 8,
    alignItems: 'center',
  },

  leaveButtonText: {
    fontFamily: fonts.PoppinsMedium,
    color: '#fff',
  },
});
