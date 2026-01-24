import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  DarkColor,
  DarkColor80,
  mainWhiteColor,
  fonts,
  mainOrangeColor,
  DarkColor20,
  mainOrange50,
  mainGrayColor,
} from '../../utils/style/fonts';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import PhoneSvgIcon from '../../assets/svg/ic_round_phone';
import MediaSection from './ViewDetailsDocuments/MediaSection';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { useIsFocused } from '@react-navigation/native';
import ContactPersonSvgIcon from '../../assets/svg/ContactsPersonSvgIcon';
import CameraSvg from '../../assets/svg/CameraSvg';
import PencilSvg from '../../assets/svg/EditProfileIconSvg'; // Use your actual pencil icon if available
import { PatchGroupIconapi, PatchPrivateUserIconapi } from '../../Api/config/HomeApi';
import { SafeAreaView } from 'react-native-safe-area-context';
const windowWidth = Dimensions.get('window').width;

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';
import AudioCallSvgicon from '../../assets/svg/audioCallSvgicon';
import VideoCallingSvgIcon from '../../assets/svg/videoCallingSvgIcon';
import { useWebRTC } from '../../Api/context/WebRTCProvider';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
// import { useWebSocket } from '../../context/WebSocketServices';
import Toast from '../../Api/context/Toast';
import { RfW } from '../../utils/helper';

const ViewDetails = ({ navigation, route }) => {
  console.log(
    'route params -=-=-=-=-=-=------>',
    route?.params,
    '\n',
    '\n',
    '\n',
  );

  const ProfileIcon2 = require('../../assets/Png/ProfileIcon2.png');
  const [groupImage, setGroupImage] = useState(null);
  console.log(groupImage, "Group Image in View Details");

  const [UserData, setUserData] = useState(null);

  // --- Group name edit modal state ---
  const [editGroupNameModalVisible, setEditGroupNameModalVisible] = useState(false);
  const [editGroupNameValue, setEditGroupNameValue] = useState('');

  const toastRef = useRef(null);

  const gradientColors = ['#F5D3BF', '#FFFFFF', '#F3DED3'];
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [profileData, setProfileData] = useState(null);

  const [Admin, setAdmin] = useState([]);
  console.log(Admin, "admin ======>");

  const IsFocused = useIsFocused();
  const buttonRef = React.useRef(null);

  useEffect(() => {
    const FetchDataUserData = () => {
      try {
        AsyncStorage1.getItem('userLoginResponse').then(userData => {
          setUserData(userData?.data?.user);
          setGroupImage(userData?.data?.user?.profile_picture);
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    FetchDataUserData();
  }, []);

  const [buttonPosition, setButtonPosition] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonPosition({ x, y, width, height });
      });
    }
  };

  const { initiateCall } = useWebRTC();

  const [isMenuVisible, setMenuVisible] = useState(false);

  const menuItems = ['Camera', 'Gallary', 'Cancel'];

  const handleMenuItemPress = async item => {
    setMenuVisible(false);

    if (item === 'Cancel') return;

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission required',
            'Camera permission is required to take photos',
          );
          return;
        }
      }
      const options = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      };
      let response;
      if (item === 'Camera') {
        response = await launchCamera(options);
      } else if (item === 'Gallary') {
        response = await launchImageLibrary(options);
      }

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Error picking image. Please try again.');
      } else if (response.assets && response.assets[0].uri) {
        setGroupImage(response.assets[0]);

        const formData = new FormData();

        const fileExt = response.assets[0].uri.split('.').pop();
        const fileName = `group_icon_${Date.now()}.${fileExt}`;

        const file = {
          uri: response.assets[0].uri,
          type: `image/${fileExt}`,
          name: fileName,
        };

        formData.append('profile_picture', file);

        try {
          if (route.params.isGroup) {
            const response = await PatchGroupIconapi(
              route.params.GroupId,
              formData,
            );
            console.log('Upload successful:', response);
          } else {
            const response = await PatchPrivateUserIconapi(
              route.params.GroupId,
              formData,
            );
            console.log('Upload successful:', response);
          }
        } catch (err) {
          console.log('Upload failed: ', err);
        }
      }
    } catch (error) {
      console.log('Error:', error);
      Alert.alert('Error', 'An error occurred while selecting an image');
    }
  };

  const renderFilterMenu = position => (
    <Modal
      transparent={true}
      visible={isMenuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
      statusBarTranslucent={true}>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}>
        <View
          style={[
            styles.menuContainer,
            {
              position: 'absolute',
              top: position.y + (position?.height + 32),
              right:
                position.x > 0
                  ? windowWidth - position.x - (position?.width || 0) - 10
                  : 10,
            },
          ]}>
          <View style={styles.triangle} />
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

  const loadMessages = useCallback(() => {
    if (!isConnected || !route?.params?.GroupId || groupImage) return;

    const payload = {
      action: 'get_chat_profile',
      profile_id: route.params.GroupId,
      is_group: route.params.isGroup || false,
    };
    sendMessage(payload);
  }, [
    isConnected,
    sendMessage,
    route?.params?.GroupId,
    route?.params?.isGroup,
  ]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages, IsFocused]);

  useEffect(() => {
    if (
      lastMessage?.data &&
      lastMessage?.message === 'Group profile retrieved'
    ) {
      console.log('get_chat_profile response (Group):', JSON.stringify(lastMessage));
      const admin = lastMessage?.data?.members?.items?.find(
        item => String(item.id) === String(UserData?.id),
      );
      setAdmin(admin);
      setProfileData(lastMessage);
    }

    if (
      lastMessage?.data &&
      lastMessage?.message === 'User profile retrieved'
    ) {
      console.log('get_chat_profile response (User):', lastMessage);
      setProfileData(lastMessage);
    }

    if (lastMessage?.data?.blocked === true) {
      console.log('[DEBUG] Blocked state detected:', {
        blocked: lastMessage?.data?.blocked,
        system_message: lastMessage?.data?.system_message,
        lastMessage,
      });
    }
  }, [lastMessage]);

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

  // console.log(
  //   'last Messag -=-=-=-=-=-=----->',
  //   JSON.stringify(lastMessage),
  //   '\n',
  //   '\n',
  // );

  const handleaudioCall = async () => {
    const hasPermissions = await requestCallPermissions(false);
    if (hasPermissions) {
      console.log('Initiating audio call to:', route.params.GroupId, '\n');
      initiateCall(route.params.GroupId, false);
      navigation.navigate('CallScreen', { type: 'audio' });
    }
  };

  const handleVideoCall = async () => {
    const hasPermissions = await requestCallPermissions(true);
    if (hasPermissions) {
      console.log('Initiating video call to:', route.params.GroupId);
      initiateCall(route.params.GroupId, true);
      navigation.navigate('CallScreen', { type: 'video' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5D3BF" />
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientContainer}
        useAngle={true}
        angle={145}
        angleCenter={{ x: 0.5, y: 0.5 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}>
            <BackArrowSvg width={20} height={20} color={DarkColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.groupIconEditWrapper}>
            <TouchableOpacity style={styles.groupIconPlaceholder}>
              {profileData?.data?.media_files?.items?.group_image ? (
                <Image
                  source={{ uri: profileData.data.media_files[0].group_image }}
                  style={{ width: '100%', height: '100%', borderRadius: 40 }}
                  resizeMode="cover"
                />
              )
                : (
                  <ContactPersonSvgIcon width={35} height={35} />
                )}
            </TouchableOpacity>

          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', left: RfW(6) }}>
            {route?.params?.name.trim() !== '' && (
              <Text style={styles.nameText} numberOfLines={1}>
                {(
                  (profileData?.name || route?.params?.name) || ''
                ).length > 20
                  ? (profileData?.name || route?.params?.name).slice(0, 20) + '...'
                  : (profileData?.name || route?.params?.name)
                }
              </Text>

            )}
            {route?.params?.isGroup && Admin?.is_admin == true && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => {
                  setEditGroupNameModalVisible(true);
                  setEditGroupNameValue(profileData?.name || route?.params?.name);
                }}
              >
                {typeof PencilSvg !== 'undefined' ? (
                  <PencilSvg width={14} height={14} color={mainOrangeColor} />
                ) : (
                  <CameraSvg width={14} height={14} color={mainOrangeColor} />
                )}
              </TouchableOpacity>
            )}
          </View>



          {!route?.params?.isGroup && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: fonts.PoppinsMedium,
                  fontSize: 12,
                  color: DarkColor,
                }}>
                {route?.params?.email}
              </Text>
            </View>
          )}
          {route?.params?.isGroup && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: fonts.PoppinsMedium,
                  fontSize: 12,
                  color: DarkColor,
                }}>
                Group: {profileData?.data?.members?.items?.length} Members
              </Text>
            </View>
          )}
          {!route?.params?.isGroup && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              <TouchableOpacity
                onPress={handleaudioCall}
                style={{ marginRight: 20 }}>
                {/* <Text style={{color: DarkColor, marginRight: 10}}>
                  Audio Call
                </Text> */}
                <AudioCallSvgicon />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVideoCall}>
                <VideoCallingSvgIcon />
              </TouchableOpacity>
            </View>
          )}

          {!route?.params?.isGroup && (
            <>
              {profileData?.designation && (
                <Text style={styles.designationText}>
                  {profileData.designation}
                </Text>
              )}
              {profileData?.phone_number && (
                <View style={styles.phoneContainer}>
                  <PhoneSvgIcon width={18} height={18} color={DarkColor} />
                  <Text style={styles.phoneText}>
                    Phone:{' '}
                    <Text
                      style={{
                        color: DarkColor80,
                        fontFamily: fonts.PoppinsRegular,
                      }}>
                      {profileData.phone_number}
                    </Text>
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </LinearGradient>

      {/* {console.log('profileData media files ====>',profileData)} */}

      <View style={styles.bodyContent}>
        {/* <WebSocketProvider> */}
        {/* {route?.params?.isGroup ? ( */}
        {/* {console.log(
          'ViewDetails navigation prop:',
          profileData?.data?.common_groups,
          '\n',
          '\n',
        )} */}
        <MediaSection
          navigation={navigation}
          isGroup={route?.params?.isGroup}
          MembersList={profileData?.data?.members?.items}
          MediaFile={profileData?.data?.media_files}
          GroupId={route?.params?.GroupId}
          CommonGroup={profileData?.data?.common_groups}
          onMemberUpdate={loadMessages}
          LoginUser={Admin}
        />
        {/* ):} */}
        {/* </WebSocketProvider> */}
      </View>

      {/* Edit Group Name Modal */}
      <Modal
        visible={editGroupNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditGroupNameModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <Text style={styles.editModalTitle}>Edit Group Name</Text>
            <Text style={styles.editModalLabel}>Enter new group name:</Text>
            <TextInput
              value={editGroupNameValue}
              onChangeText={setEditGroupNameValue}
              style={styles.editModalInput}
              autoFocus
              maxLength={50}
            />
            <Text style={styles.groupNameHint}>(Maximum 50 characters)</Text>
            <View style={styles.editModalButtonRow}>
              <TouchableOpacity onPress={() => setEditGroupNameModalVisible(false)} style={styles.editModalCancelButton}>
                <Text style={styles.editModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!editGroupNameValue.trim()) return;
                  const payload = {
                    action: 'update_group',
                    name: editGroupNameValue,
                    group_id: route.params.GroupId,
                    description: '',
                  };
                  sendMessage(payload);
                  setEditGroupNameModalVisible(false);
                  navigation.navigate("Home")
                }}
              >
                <Text style={styles.editModalOkText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderFilterMenu(buttonPosition)}

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
};

export default ViewDetails;

const styles = StyleSheet.create({
  editModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  editModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 300,
  },
  editModalTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: DarkColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  editModalLabel: {
    fontSize: 12,
    marginBottom: 10,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 14,
    fontSize: 15,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
  },
  editModalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editModalCancelButton: {
    marginRight: 15,
  },
  editModalCancelText: {
    color: mainOrangeColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    right: RfW(10)
  },
  editModalOkText: {
    color: DarkColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
  groupNameHint: {
    fontFamily: fonts.PoppinsLight,
    fontSize: 8,
    color: 'red',
    bottom: 6,
    // marginTop: 2,
    // alignSelf: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5D3BF',
  },
  gradientContainer: {
    height: 280,
  },
  header: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -10,
  },
  profileImage: {
    width: 93,
    height: 93,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: DarkColor20,
    marginBottom: 12,
    padding: 1,
  },
  nameText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 4,
  },
  designationText: {
    fontSize: 12,
    color: DarkColor80,
    marginBottom: 12,
    fontFamily: fonts.PoppinsLight,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  bodyContent: {
    flex: 1,
    backgroundColor: mainWhiteColor,
    borderColor: mainOrangeColor,
    borderTopWidth: 1.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -28,
  },
  groupIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mainOrange50,
    position: 'relative',
    marginBottom: 10,
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
  triangle: {
    position: 'absolute',
    top: -7,
    right: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,

    padding: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
  },
  menuItemSelected: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  groupIconEditWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconButton: {
    // position: 'absolute',
    // top: 0,
    left: 10,
    bottom: 4,
    backgroundColor: mainWhiteColor,
    borderRadius: 16,
    padding: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
});
