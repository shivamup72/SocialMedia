import {
  StyleSheet,
  Text,
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
  const [selectedMoreFilter, setSelectedMoreFilter] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isDeleteMeetingModalVisible, setDeleteMeetingModalVisible] =
    useState(false);
  const { initiateCall } = useWebRTC();
  const { sendMessage, lastMessage } = useWebSocket();
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const menuItems = [
    'Mute',
    'Block',
    'Delete Chat',
    // 'Star list',
    'View Details',
    // 'Pin',
    'Recent Thread',
  ];
  const MoreItems = ['Copy'];

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
    if (item === 'Star list') {
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
              <Text allowFontScaling={false} style={styles.menuItem}>
                {item}
              </Text>
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
              <Text allowFontScaling={false} style={styles.menuItem}>
                {item}
              </Text>
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

  const handleDeleteConfirmedModal = () => {
    console.log('Delete button pressed, showing confirmation modal');
    setDeleteMeetingModalVisible(true);
    handleDeleteMessage();
  };

  const handleDeletemodal = () => {
    setDeleteMeetingModalVisible(false);
    handleDeleteMessage();
  };

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
              <BackArrowSvg color={'#ffffff'} />
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

            {/* <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={handleStartmessage}>
              {selectedMessage?.starred ? (
                <UnStarSvg width="20" height="20" color={mainWhiteColor} />
              ) : (
                <StarSvgIcon width="20" height="20" color={mainWhiteColor} />
              )}
            </TouchableOpacity> */}

            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={handlePinmessage}>
              <PinSvg width="20" height="20" color={mainWhiteColor} />
            </TouchableOpacity>

            {selectedMessage?.isSender && (
              <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={handleDeleteConfirmedModal}>
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
                <Text
                  style={{ color: DarkColor, fontFamily: fonts.PoppinsMedium }}>
                  Cancel
                </Text>
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
              <Text style={{ color: DarkColor, fontFamily: fonts.PoppinsMedium }}>
                {selectedMessages.length} Selected
              </Text>
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
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: DarkColor,
                      fontSize: 12,
                      fontFamily: fonts.PoppinsMedium,
                    }}>
                    {(typeof name === 'string' && name.trim() === '') ? data?.email : name}
                  </Text>
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

      {/* <ConfirmationModal
        isVisible={isDeleteMeetingModalVisible}
        title="Delete Message"
        modalMessage="Are you sure you want to delete this messeage?"
        onClose={() => setDeleteMeetingModalVisible(false)}
        onConfirm={handleDeletemodal}
      /> */}

      <MessageStatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        statusList={selectedMessageStatus}
      />
    </View>
  );
};

export default Windowsheader;

const styles = StyleSheet.create({
  // ... existing styles
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
