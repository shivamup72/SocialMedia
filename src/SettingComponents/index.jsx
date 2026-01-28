import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  BackHandler,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor60,
} from '../utils/style/fonts';
import HeaderComponents from '../components/HeaderComponents/HeaderComponents';
import EditLinePencilIcon from '../assets/svg/ri_edit_line';
import CameraSvg from '../assets/svg/CameraSvg';
// import TriangleMenu from '../components/TriangleMenu/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import HRMSControls from './HRMSControls/index';
import AdminControls from './AdminControls/index';
import { PatchCreateWorkSpaceApiId } from '../Api/config/HomeApi';
import AsyncStorage1 from '@react-native-async-storage/async-storage';
import CloseSvg from '../assets/svg/CloseSvg';
import { useSettings } from '../Api/context/SettingsContext';
import ChatPermissions from './ChatPermissions';
import { onSendError } from '@react-native-firebase/messaging';

const RenderListHeader = React.memo(
  ({
    profileImage,
    EditStatus,
    setEditStatus,
    profileImageData,
    hubName,
    cameraIconRef,
    openImagePickerMenu,
    setHubName,
    handleHUbChanges,
    idHub,
  }) => {
    const ArrowLogo = require('../assets/LoginAssets/png/ArrowLogo.png');
    return (
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profileImage === null
                ? profileImageData
                : profileImage?.uri
                  ? { uri: profileImage?.uri }
                  : { uri: profileImage }
            }
            style={styles.profileImage}
          />
          {EditStatus && (
            <View style={styles.cameraIconContainer}>
              <TouchableOpacity
                ref={cameraIconRef}
                onPress={openImagePickerMenu}
                style={styles.cameraIconTouchable}>
                <CameraSvg width="15" height="15" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.hubNameSection}>
          {EditStatus ? (
            <View
              style={{
                alignItems: 'center',
                // marginHorizontal: 10,
                width: '95%',
              }}>
              <TextInput
                style={styles.hubNameInput}
                value={hubName}
                onChangeText={setHubName}
                placeholder="Enter Hub Name"
                placeholderTextColor={DarkColor60}
                textAlign="center"
                maxLength={100}
                scrollEnabled={true}
              />
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  fontFamily: fonts.PoppinsMedium,
                  marginTop: 5,
                }}>
                {' '}
                {100 - hubName?.length}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.hubNameText} numberOfLines={1}>
                {hubName.length > 30 ? `${hubName.slice(0, 30)}...` : hubName}
              </Text>
            </View>
          )}

          <View style={styles.editIconContainer}>
            {EditStatus ? (
              <View style={{ flexDirection: 'column' }}>
                <TouchableOpacity
                  style={{ marginLeft: 5, marginBottom: 10 }}
                  onPress={() => setEditStatus(false)}>
                  <CloseSvg width="20" height="20" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleHUbChanges}>
                  <Image source={ArrowLogo} style={styles.saveArrowIcon} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditStatus(true);
                }}>
                <EditLinePencilIcon />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

const SettingComponents = ({ navigation, route }) => {
  console.log(route?.params, '---route.params----');

  const profileImageData = require('../assets/Png/ProfileIcon2.png');
  const [profileImage, setProfileImage] = useState(route?.params?.logo);

  const [EditStatus, setEditStatus] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [hubName, setHubName] = useState(route?.params?.hubName);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const cameraIconRef = useRef(null);

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const openImagePickerMenu = () => {
    cameraIconRef.current.measure((fx, fy, width, height, px, py) => {
      setMenuPosition({ x: px, y: py, width, height });
      setIsMenuVisible(true);
    });
  };

  // console.log('Settings -=-=---->', HubSettings);

  const handleResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'An error occurred while picking the image.');
    } else {
      // const source = {uri: response.assets[0]};
      setProfileImage(response.assets[0]);
    }
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', saveToPhotos: true }, handleResponse);
  };

  const chooseFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleResponse);
  };

  const imagePickerMenuItems = [
    { text: 'Camera', onPress: takePhoto },
    { text: 'Gallery', onPress: chooseFromGallery },
    { text: 'Cancel', onPress: () => { }, color: '#E53935' },
  ];

  const sections = [
    {
      key: 'hrmsControls',
      component: <HRMSControls />,
    },
    {
      key: 'chatPermissions',
      component: <ChatPermissions />,
    },

  ];

  const handleHUbChanges = async () => {
    const formData = new FormData();
    formData.append('name', hubName);

    if (profileImage && profileImage.uri !== undefined) {
      formData.append('logo', {
        uri: profileImage.uri,
        type: 'image/jpeg',
        name: 'logo.jpg',
      });
    }

    try {
      console.log('Edit Hub Name API Call:', {
        id: route?.params?.id,
        name: hubName,
        logo: profileImage && profileImage.uri !== undefined ? profileImage.uri : null
      });
      const response = await PatchCreateWorkSpaceApiId(route?.params?.id, formData);
      console.log('Edit Hub Name API Success Response:', response);
      setEditStatus(false);
      await AsyncStorage1.setItem('HubName', JSON.stringify(hubName));
      navigation.goBack();
    } catch (error) {
      console.log('error  -=-=-=-=------->', error);
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default exit behavior
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={mainOrangeColor} barStyle={'dark-content'} />
      <HeaderComponents navigation={navigation} Type={'Hub Admin Settings'} />

      <FlatList
        data={sections}
        keyExtractor={item => item.key}
        renderItem={({ item }) => <View>{item.component}</View>}
        ListHeaderComponent={
          <RenderListHeader
            profileImage={profileImage}
            EditStatus={EditStatus}
            setEditStatus={setEditStatus}
            profileImageData={profileImageData}
            hubName={hubName}
            cameraIconRef={cameraIconRef}
            openImagePickerMenu={openImagePickerMenu}
            setHubName={setHubName}
            handleHUbChanges={handleHUbChanges}
            idHub={route?.params?.id}
          />
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* <TriangleMenu
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
        menuItems={imagePickerMenuItems}
        menuPosition={menuPosition}
      /> */}
    </View>
  );
};

export default SettingComponents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  // Use contentContainerStyle in FlatList for padding/margin
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: mainOrangeColor,
    borderRadius: 35,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  cameraIconTouchable: {
    backgroundColor: mainOrangeColor,
    padding: 5,
    borderRadius: 15,
  },
  hubNameSection: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Add some space before the next component
  },
  hubNameInput: {
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    borderBottomWidth: 0.5,
    borderColor: DarkColor60,
    padding: 5,
    width: '80%',
    textAlign: 'center',
  },
  hubNameText: {
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  saveArrowIcon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
});
