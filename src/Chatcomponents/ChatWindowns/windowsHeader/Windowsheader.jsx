import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import {
  fonts,
  DarkColor50,
  DarkCOlor30,
  mainWhiteColor,
  mainOrange80,
  mainOrange25,
  mainOrangeColor,
  DarkColor,
  DarkColor80,
  DarkColor60,
} from '../../../utils/style/fonts';
import BackArrowSvg from '../../../assets/svg/BackArrowSvg';
import ThreeVerticalDots from '../../../assets/svg/threeDots';
import SqureMessage from '../../../assets/svg/lucide_message_square_reply';
import DeleteSvg from '../../../assets/svg/DeleteSvg';
import ShareIcon from '../../../assets/svg/solar_forward_bold';
import ModalsComponents from '../Modals/ModalsComponents';
import { MessageStatusModal } from '../ThreadComponents/MessageStatusModal';
import Avatar from '../../../components/AvatarComponents/Avatar';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import StarSvgIcon from '../../../assets/svg/StarSvg';
import AudioCallSvgicon from '../../../assets/svg/audioCallSvgicon';
import VideoCallingSvgIcon from '../../../assets/svg/videoCallingSvgIcon';
import { useWebRTC } from '../../../Api/context/WebRTCProvider';
import PinSvg from '../../../assets/svg/PinSvg';
import UnStarSvg from '../../../assets/svg/Unstar_off_outline';
import { RfH } from '../../../utils/helper';
import CustomBottomSheet from '../../../components/CustomBottomSheet/CustomBottomSheet';
import CustomText from '../../../utils/CustomText';

const Windowsheader = ({
  navigation,
  Condition,
  name,
  setReplyCheck,
  isGroup,
  GroupId,
  selectedMessageStatus,
  setSelectedMessage,
  handleDeleteMessage,
  setReactionPickerState,
  data,
  selectedMessage,
  handleCopyMessage,
  conversationId,
  setEditmessagestatus,
  loadMessages,
  handleAllDeleteMessage,
  handleStarMessagecheck,
  handleMuteOptions,
  isMultiSelectMode,
  selectedMessages,
  cancelMultiSelectMode,
  handlePinCreateion,
}) => {
  const ProfileImage = require('../../../assets/Png/ProfileIcon.png');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [MoreMenuVisible, setMoreMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showUnmuteSheet, setShowUnmuteSheet] = useState(false);
  const [localMuted, setLocalMuted] = useState(data?.muted);
  const [selectedMoreFilter, setSelectedMoreFilter] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isDeleteMeetingModalVisible, setDeleteMeetingModalVisible] =
    useState(false);
  const { initiateCall } = useWebRTC();
  const { sendMessage, lastMessage } = useWebSocket();
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const menuItems = [
    (typeof localMuted !== 'undefined' ? localMuted : data?.muted) ? 'Unmute' : 'Mute',
    'Block',
    'Delete Chat',
    'Star list',
    'View Details',
    // 'Pin',
    'Recent Thread',
  ];
  const MoreItems = ['Copy'];
  // console.log(data, "header msg data");

  const requestCallPermissions = async (isVideoCall = false) => {
    if (Platform.OS === 'android') {
      try {
        const permissionsToRequest = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
        if (isVideoCall) {
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }

        const granted = await PermissionsAndroid.requestMultiple(
          permissionsToRequest,
        );

        const audioGranted =
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const cameraGranted = isVideoCall
          ? granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED
          : true;

        if (audioGranted && cameraGranted) {
          console.log('[Permissions] Audio and Camera permissions granted');
          return true;
        } else {
          console.log('[Permissions] One or more permissions denied');
          Alert.alert(
            'Permissions Required',
            'Camera and Microphone access is required to make calls. Please grant permissions in your device settings.',
          );
          return false;
        }
      } catch (err) {
        console.warn('[Permissions] Error requesting permissions:', err);
        return false;
      }
    }
    // For iOS, the check happens at the native level. If you've configured
    // Info.plist correctly, this will work.
    return true;
  };

  const getMoreItems = () => {
    const items = [...MoreItems];
    if (selectedMessage?.isSender) {
      // items.splice(1, 0, 'Delete');
      items.splice(1, 0, 'Edit');
      items.splice(2, 0, 'Info');
    }
    return items;
  };

  const handleMenuItemPress = item => {
    if (item === 'Unmute') {
      setShowUnmuteSheet(true);
      setMenuVisible(false);
      return;
    } else if (item === 'Star list') {
      // console.log(
      //   'item -=-=-=-=-=-=-=------>',
      //   item,
      //   conversationId,
      //   '\n',
      //   '\n',
      // );
      navigation.navigate('StartComponents', {
        data: data,
        conversationId: conversationId,
      });
      setMenuVisible(false);
      return;
    } else if (item === 'Recent Thread') {
      // console.log('pin check -=-=');
      navigation.navigate('ThreadListingComponents', {
        data: data,
        conversationId: conversationId
      });
      setMenuVisible(false);
      return;
    } else if (item === 'Pin') {
      console.log('pin check -=-=');
      navigation.navigate('PinListingComponents', {
        data: data,
        conversationId: conversationId,
      });
      setMenuVisible(false);
      return;
      // setMenuVisible(false);
    } else if (item !== 'View Details') {
      setModalVisible(true);
    } else {
      navigation.navigate('ChatViewDetails', {
        isGroup: isGroup,
        GroupId: GroupId,
        conversationId: conversationId,
        name: name,
      });
    }
    setModalType(
      item === 'Mute' ? 'mute' : item === 'Block' ? 'block' : 'delete',
    );
    setSelectedFilter(item);
    setMenuVisible(false);

    // console.log('Selected:', item);
  };

  const handleMoreMenuItemPress = item => {
    if (item === 'Info') {
      // console.log(
      //   'selectedMessageStatus -=----->',
      //   JSON.stringify(selectedMessageStatus),
      // );
      if (isGroup) {
        setStatusModalVisible(true);
        setMoreMenuVisible(false);
        setSelectedMessage(null);
      } else {
        // console.log('selectedMessage -=----->');
        setMoreMenuVisible(false);
        setSelectedMessage(null);
      }
    } else if (item === 'Copy') {
      console.log('selectedMessage copy -=----->');
      handleCopyMessage();
      setReactionPickerState({
        visible: false,
        message: null,
        positionY: 0,

      });
      setMoreMenuVisible(false);
      setSelectedMessage(null);
      setSelectedMessage(null);
    } else if (item === 'Delete') {
      setSelectedMoreFilter(item);
      setMoreMenuVisible(false);
      if (handleDeleteMessage) {
        handleDeleteMessage();
      }
    } else if (item === 'Edit') {
      console.log('selectedMessage Edit -=----->');
      setMoreMenuVisible(false);
      // setSelectedMessage(null);
      setEditmessagestatus(true);
    } else {
      setSelectedMoreFilter(item);
      setMoreMenuVisible(false);

      // console.log('Selected:', item);
    }
  };

  const renderFilterMenu = () => (
    <Modal
      transparent={true}
      visible={isMenuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable key={index} onPress={() => handleMenuItemPress(item)}>
              <CustomText allowFontScaling={false} style={styles.menuItem}>
                {item}
              </CustomText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const renderMoreMenu = () => (
    <Modal
      transparent={true}
      visible={MoreMenuVisible}
      animationType="fade"
      onRequestClose={() => setMoreMenuVisible(true)}>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMoreMenuVisible(false)}>
        <View style={styles.menuContainer}>
          {getMoreItems().map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleMoreMenuItemPress(item)}>
              <CustomText allowFontScaling={false} style={styles.menuItem}>
                {item}
              </CustomText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const handleConfirm = data1 => {
    if (data1 === 'delete') {
      handleAllDeleteMessage();
      setModalVisible(false);
    } else if (
      data1 === '1 hour' ||
      data1 === '8 hours' ||
      data1 === '1 week' ||
      data1 === 'Always'
    ) {
      console.log('selectedMessage -=----->', data1);
      handleMuteOptions();
      setModalVisible(false);
    }
    // console.log('selectedMessage -=----->', data1);
    // setMenuVisible(false);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleStartmessage = () => {
    // console.log('selectedMessage -=----->', data1);
    setModalVisible(false);
    setSelectedMessage(null);
    setReactionPickerState({
      visible: false,
      message: null,
      positionY: 0,
    });
    handleStarMessagecheck();
  };

  const handleViewDetailsNavigations = () => {
    // console.log('data -=-=-=------>', data, '\n', '\n');
    navigation.navigate('ChatViewDetails', {
      isGroup: isGroup,
      GroupId: GroupId,
      name: name,
      email: data?.email,
    });
  };

  // console.log('data -=-=-=------>', data, '\n', '\n');

  const handleaudioCall = async () => {
    // const hasPermissions = await requestCallPermissions(false);
    // if (hasPermissions) {
    //   console.log('[Call] Initiating audio call to:', GroupId);
    //   initiateCall(GroupId, false);
    //   navigation.navigate('CallScreen', { type: 'audio', conversationId: GroupId });
    // } else {
    //   console.log('[Call] Audio call permissions denied.');
    // }
    console.log('audio call feature is not implemented yet');
  };

  const handlevideoCall = async () => {
    // const hasPermissions = await requestCallPermissions(true);
    // if (hasPermissions) {
    //   console.log('[Call] Initiating video call to:', GroupId);
    //   initiateCall(GroupId, true);
    //   navigation.navigate('CallScreen', { type: 'video', conversationId: GroupId });
    // } else {
    //   console.log('[Call] Video call permissions denied.');
    // }
    console.log('video call feature is not implemented yet');

  };

  const handlePinmessage = () => {
    setModalVisible(false);
    setReactionPickerState({
      visible: false,
      message: null,
      positionY: 0,
    });
    handlePinCreateion();
  };

  // Show modal with two options: Delete for me, Delete for everyone
  const handleDeleteConfirmedModal = (deleteType) => {
    // Only call handleDeleteMessage if a message is selected
    if (!selectedMessage) {
      setDeleteMeetingModalVisible(false);
      Alert.alert('Error', 'No message selected to delete.');
      return;
    }
    handleDeleteMessage(deleteType);
  };

  // const handleDeletemodal = () => {
  //   setDeleteMeetingModalVisible(false);
  //   handleDeleteMessage();
  // };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Condition ? DarkCOlor30 : mainWhiteColor,
          paddingHorizontal: 20,
          paddingRight: 10,
          height: RfH(60),
          paddingBottom: 5,
          alignItems: 'center',
          alignContent: 'center'
        },
      ]}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      {Condition ? (
        <>
          <View>
            <TouchableOpacity
              onPress={() => {
                // navigation.goBack();
                setSelectedMessage(null);
                // setReplyCheck(true);
                setReactionPickerState({
                  visible: false,
                  message: null,
                  positionY: 0,
                });
              }}>
              {/* <BackArrowSvg color={'#ffffff'} /> */}
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => {
                setReplyCheck(true);
                setReactionPickerState({
                  visible: false,
                  message: null,
                  positionY: 0,
                });
                // setSelectedMessage(null);
              }}>
              <SqureMessage width="28" height="28" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={handleStartmessage}>
              {selectedMessage?.starred ? (
                <UnStarSvg width="20" height="20" color={mainWhiteColor} />
              ) : (
                <StarSvgIcon width="20" height="20" color={mainWhiteColor} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={handlePinmessage}>
              <PinSvg width="20" height="20" color={mainWhiteColor} />
            </TouchableOpacity>

            {selectedMessage?.isSender && (
              <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => setDeleteMeetingModalVisible(true)}>
                <DeleteSvg width="20" height="20" color={mainWhiteColor} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={{ paddingHorizontal: 10 }}>
              <ShareIcon height="28" width="28" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 5,
                paddingVertical: 3,
              }}
              onPress={() => {
                setMoreMenuVisible(true);
                setReactionPickerState({
                  visible: false,
                  message: null,
                  positionY: 0,
                });
              }}>
              <ThreeVerticalDots width="5" height="18" color={'#ffffff'} />
            </TouchableOpacity>
          </View>

          {renderMoreMenu()}
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isMultiSelectMode ? (
              <TouchableOpacity
                onPress={cancelMultiSelectMode}
                style={{
                  paddingRight: 10,
                  paddingVertical: 5,
                }}>
                <CustomText
                  style={{ color: DarkColor, fontFamily: fonts.PoppinsMedium }}>
                  Cancel
                </CustomText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (
                    data?.navigatetype === 'privatenavigate' ||
                    data?.navigatetype === 'groupnavigate'
                  ) {
                    navigation.navigate('Home', {
                      screen: 'Chat',
                      params: { screen: 'ChatMain' },
                    });
                  } else {
                    navigation.goBack();
                  }
                }}
                style={{
                  paddingRight: 10,
                  paddingVertical: 5,
                }}>
                <BackArrowSvg width="16" height="16" />
              </TouchableOpacity>
            )}
            {isMultiSelectMode ? (
              <CustomText style={{ color: DarkColor, fontFamily: fonts.PoppinsMedium }}>
                {selectedMessages.length} Selected
              </CustomText>
            ) : (
              <>
                <View style={styles.profileContainer}>
                  <Avatar
                    avatarUri={data?.avatar}
                    size={40}
                    borderRadius={30}
                    fontSize={16}
                    name={
                      data?.chat_name?.trim() === '' ? data?.email : data?.name
                    }
                    email={data?.email}
                  />
                </View>
                <Pressable
                  style={styles.ProfileDetails}
                  onPress={handleViewDetailsNavigations}>
                  <CustomText
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      color: DarkColor,
                      fontSize: 12,
                      fontFamily: fonts.PoppinsMedium,
                    }}
                  >
                    {(
                      ((typeof name === 'string' && name.trim() === '') ? data?.email : name) || ''
                    ).length > 20
                      ? (
                        ((typeof name === 'string' && name.trim() === '') ? data?.email : name)
                      ).slice(0, 20) + '...'
                      : ((typeof name === 'string' && name.trim() === '') ? data?.email : name)
                    }
                  </CustomText>

                </Pressable>
              </>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <>
              <TouchableOpacity
                style={{ paddingTop: 5, paddingRight: 8 }}
                onPress={handleaudioCall}>
                <AudioCallSvgicon width="18" height="18" color={DarkColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingTop: 1, paddingRight: 8 }}
                onPress={handlevideoCall}>
                <VideoCallingSvgIcon width="26" height="26" color={DarkColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(true);
                }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}>
                <ThreeVerticalDots width="5" height="19" />
              </TouchableOpacity>
            </>
          </View>

          {renderFilterMenu()}
        </>
      )}

      <ModalsComponents
        visible={isModalVisible}
        type={modalType}
        onClose={handleClose}
        onConfirm={handleConfirm}
        contactName={data?.name}
      />

      {/* Confirmation Modal for Delete Message */}
      <Modal
        visible={isDeleteMeetingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteMeetingModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <CustomText style={styles.deleteModalTitle}>Delete Message ?</CustomText>
            <View style={styles.deleteModalButtonRow}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => {
                  setDeleteMeetingModalVisible(false);
                  handleDeleteConfirmedModal('for_everyone');
                }}
              >
                <CustomText style={styles.deleteModalCancelText}>Delete for everyone</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalDeleteButton, { paddingVertical: RfH(24) }]}
                onPress={() => {
                  setDeleteMeetingModalVisible(false);
                  handleDeleteConfirmedModal('for_me');
                }}
              >
                <CustomText style={styles.deleteModalDeleteText}>Delete for me</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={() => {
                  setDeleteMeetingModalVisible(false);
                }}
              >
                <CustomText style={styles.deleteModalDeleteText}>Cancel</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MessageStatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        statusList={selectedMessageStatus}
      />
      <CustomBottomSheet visible={showUnmuteSheet} onClose={() => setShowUnmuteSheet(false)}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <CustomText style={{ fontSize: 16, fontFamily: fonts.PoppinsMedium, color: DarkColor, marginBottom: 16 }}>
            Are you sure you want to unmute?
          </CustomText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 200 }}>
            <TouchableOpacity
              style={{ flex: 1, marginRight: 8, paddingVertical: 10, borderRadius: 6, backgroundColor: mainOrange25, alignItems: 'center' }}
              onPress={() => setShowUnmuteSheet(false)}
            >
              <CustomText style={{ color: mainOrangeColor, fontFamily: fonts.PoppinsMedium }}>No</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 8, paddingVertical: 10, borderRadius: 6, backgroundColor: mainOrangeColor, alignItems: 'center' }}
              onPress={() => {
                setShowUnmuteSheet(false);
                setLocalMuted(false); // Immediately update UI to show as unmuted
                handleMuteOptions && handleMuteOptions({
                  GroupId: data?.GroupId || data?.groupId || data?.GroupID || data?.groupID || data?.id || data?.group_id || data?.groupID || null,
                  avatar: data?.avatar || null,
                  conversationId: data?.conversationId || conversationId,
                  email: data?.email,
                  isGroup: data?.isGroup || false,
                  muted: data?.muted,
                  name: data?.name,
                  navigatetype: data?.navigatetype,
                  type: data?.type,
                });
              }}
            >
              <CustomText style={{ color: '#fff', fontFamily: fonts.PoppinsMedium }}>Yes</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
    </View>
  );
};

export default Windowsheader;

const styles = StyleSheet.create({
  // ... existing styles
  deleteModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: RfH(20),
    width: 280,
    // alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: RfH(14),
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: RfH(14),
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteModalButtonRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // width: '100%',
  },
  deleteModalCancelButton: {
    // flex: 1,
    // marginRight: 8,
    // paddingVertical: 10,
    // borderRadius: 6,
    // backgroundColor: mainOrange25,
    // alignItems: 'center',
    // alignSelf: 'flex-end'
  },
  deleteModalCancelText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsMedium,
    alignSelf: 'flex-end',
    fontSize: RfH(14)

  },
  deleteModalDeleteButton: {
    // flex: 1,
    marginLeft: 8,
    // paddingVertical: 10,
    // paddingTop: RfH(16)
    // borderRadius: 6,
    // backgroundColor: mainOrangeColor,
    // alignItems: 'center',
  },
  deleteModalDeleteText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsMedium,
    alignSelf: 'flex-end',
    fontSize: RfH(14)
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  selectionCount: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 16,
  },
  cancelText: {
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    // paddingBottom: 15,
    borderBottomColor: mainOrange25,
    borderBottomWidth: 1.3,
  },
  profileContainer: {
    // borderWidth: 1,
    // borderColor: '#0000001A',
    borderRadius: 50,
    padding: 0,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 25,
  },
  ProfileDetails: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 10,
    paddingVertical: 10,
  },

  // MOdal css
  modalOverlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  menuItem: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
  },
  menuItemSelected: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
});
