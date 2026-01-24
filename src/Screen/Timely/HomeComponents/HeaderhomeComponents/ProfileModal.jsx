import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  TextInput,
  SectionList,
  Share,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { BlurView } from '@react-native-community/blur';
import DropDownSvgIcon from '../../../../assets/svg/DropDownSvg';
import DropUpSvg from '../../../../assets/svg/DropUpSvg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  DarkColor,
  DarkColor80,
  fonts,
  mainOrangeColor,
  mainOrange50,
  DarkColor50,
  DarkColor60,
  DarkCOlor30,
} from '../../../../utils/style/fonts';
import EditProfileIconSvg from '../../../../assets/svg/EditProfileIconSvg';
import AsyncStorage1 from '../../../../Api/config/AsyncStorage';
import {
  GetCreateWorkSpaceApi,
  PatchUserIDListingApi,
} from '../../../../Api/config/HomeApi';
import DateTimePicker from '@react-native-community/datetimepicker';
// import {apiGet} from '../../context/ApiServices';
// import {CreateWorkSpaceApi} from '../../config/apiUrls';
import { GetWorkSpaceCode, GetUserIdListingApi } from '../../../../Api/config/HomeApi';
import Toast from '../../../../Api/context/Toast';
import { useWebSocket } from '../../../../Api/context/WebSocketServices';
import SettingSvg from '../../../../assets/svg/material_symbols_settings_outline_rounded';
const mainWhiteColor = '#FFFFFF';
const primaryColor = '#FF6B6B';
const textColor = DarkColor;
const placeholderColor = '#A9A9A9';
const backgroundColor = '#F7F8FC';
const borderColor = '#E0E0E0';
import { SafeAreaView } from 'react-native-safe-area-context';
import CreateHubSvg from '../../../../assets/svg/CreateHubSvgIcon';
import JoinHubSvg from '../../../../assets/svg/JoinHubSvg';
import ShareHubCodeIconSvg from '../../../../assets/svg/ShareIconSvg';
import CloseSvg from '../../../../assets/svg/CloseSvg';
import { useSettings } from '../../../../Api/context/SettingsContext';
import {
  FormatYYYYMMDD,
  FormatDDMMYYYY,
  FormatYYYYMMDDHHMM,
} from '../../../../utils/CommonUtils';
import CameraSvg from '../../../../assets/svg/CameraSvg';
// import TriangleMenu from '../../../../components/TriangleMenu/TriangleMenu';
import RNRestart from 'react-native-restart';
const { width } = Dimensions.get('window');

const EditableField = React.memo(
  ({
    label,
    placeholder,
    value,
    isDropdown = false,
    isDateField = false,
    keytype = 'default',
    maxLength = 100,
    onChangeText,
    onPress,
    date_type = false,
  }) => (
    <View style={styles.fieldContainer}>
      <Text allowFontScaling={false} style={styles.fieldLabel}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={date_type ? true : !isDateField}
        activeOpacity={isDateField ? 0.7 : 1}>
        <View
          style={[
            styles.inputContainer,
            (isDropdown || isDateField) && styles.dropdownContainer,
          ]}>
          <TextInput
            allowFontScaling={false}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            style={[styles.textInput, isDateField && styles.dateInput]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keytype}
            maxLength={maxLength}
            editable={date_type ? false : !isDateField}
            pointerEvents={isDateField ? 'none' : 'auto'}
          />
          {/* {isDropdown && (
            <DropDownSvgIcon width={16} height={16} color={DarkColor80} />
          )} */}
        </View>
      </TouchableOpacity>
    </View>
  ),
);

const ProfileHeader = React.memo(
  ({
    isEditMode,
    setEditMode,
    DataList,
    formData,
    handleInputChange,
    handleSaveButton,
    GetData,
    cameraIconRef,
    openImagePickerMenu,
    profileImage,
    // profile_percentage,
  }) => {
    const ProfileImage1 = require('../../../../assets/Png/ProfileIcon.png');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentDateField, setCurrentDateField] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [DropDownState, setDropDownState] = useState(false);

    const handleDateChange = (event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const formattedDate = `${String(selectedDate.getDate()).padStart(
          2,
          '0',
        )}/${String(selectedDate.getMonth() + 1).padStart(
          2,
          '0',
        )}/${selectedDate.getFullYear()}`;
        handleInputChange(currentDateField, formattedDate);
      }
    };

    if (DropDownState) {
      return (
        <>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profileImage === null
                    ? ProfileImage1
                    : { uri: profileImage.uri }
                }
                style={styles.profileImage}
              />
              {isEditMode ? (
                <TouchableOpacity
                  style={styles.editIconContainer}
                  ref={cameraIconRef}
                  onPress={openImagePickerMenu}>
                  <CameraSvg />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={() => setEditMode(true)}>
                  <EditProfileIconSvg />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.nameContainer}
              onPress={() => {
                setDropDownState(false);
                setEditMode(false);
              }}>
              <Text allowFontScaling={false} style={styles.userName}>{`${formData.first_name || 'Unkown'
                } ${formData.last_name || 'Riggler!'}`}</Text>
              <DropUpSvg width={16} height={16} color={DarkColor80} />
            </TouchableOpacity>
          </View>
          <View style={styles.mainContent}>
            {/* {console.log(
              'form data -=-=----->',
              formData?.first_name,
              formData?.last_name,
            )} */}
            <EditableField
              label="First Name"
              value={formData.first_name}
              onChangeText={text => handleInputChange('first_name', text)}
              isDateField={!isEditMode}
            />
            <EditableField
              label="Last Name"
              value={formData.last_name}
              onChangeText={text => handleInputChange('last_name', text)}
              isDateField={!isEditMode}
            />
            <EditableField
              label="Phone Number"
              value={formData.phone}
              onChangeText={text => handleInputChange('phone', text)}
              keytype="numeric"
              maxLength={10}
              isDateField={!isEditMode}
            />
            <EditableField
              label="Email ID"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keytype="email-address"
              isDateField={true}
            />

            <EditableField
              label="Birth Date"
              value={formData.birth_date}
              onPress={() => {
                setCurrentDateField('birth_date');
                setShowDatePicker(true);
              }}
              placeholder="DD-MM-YY"
              isDateField={isEditMode}
              date_type={isEditMode ? false : true}
            />

            <EditableField
              label="Date of Joining"
              value={formData.date_of_joining}
              onPress={() => {
                setCurrentDateField('date_of_joining');
                setShowDatePicker(true);
              }}
              placeholder="DD-MM-YY"
              isDateField={isEditMode}
              date_type={isEditMode ? false : true}
            />

            <EditableField
              label="Emergency Contact"
              value={formData.emergency_contact}
              onChangeText={text =>
                handleInputChange('emergency_contact', text)
              }
              keytype="numeric"
              maxLength={10}
              isDateField={!isEditMode}
            />

            <EditableField
              label="Line Manager"
              value={formData.line_manager}
              onChangeText={text => handleInputChange('line_manager', text)}
              isDropdown={true}
              // maxLength={10}
              isDateField={!isEditMode}
            />
          </View>

          <View style={styles.buttonContainer}>
            {isEditMode && (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditMode(false);
                    setDropDownState(false);
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveButton}
                  disabled={!isEditMode}>
                  <Text allowFontScaling={false} style={styles.saveButtonText}>
                    Save
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.profileHeader}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${formData?.profile_percentage || 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formData?.profile_percentage}% profile completed
          </Text>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileImage === null ? ProfileImage1 : { uri: profileImage.uri }
              }
              style={styles.profileImage}
            />

            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => {
                setEditMode(true);
                setDropDownState(true);
              }}>
              <EditProfileIconSvg />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.nameContainer}
            onPress={() => {
              // console.log('DropDownState --=--=>', DropDownState);
              setDropDownState(!DropDownState);
            }}>
            <Text allowFontScaling={false} style={styles.userName}>{`${formData?.first_name || ''
              } ${formData?.last_name || 'Unknown Riggler!'}`}</Text>
            <DropDownSvgIcon width={16} height={16} color={DarkColor80} />
          </TouchableOpacity>
        </View>
        <View style={styles.mainContent} />
      </>
    );
  },
);

const SettingsModal = ({
  navigation,
  visible,
  onClose,
  onCloseprofile,
  hubName,
  SelectedHub,
  userData,
}) => {
  if (!visible) {
    return null;
  }

  // console.log('SelectedHub --=--->', userData?.id, SelectedHub, '\n');
  const {
    settings: currentGlobalSettings,
    updateSettings,
    SelectedMembers,
  } = useSettings();

  const handleAdminSettingsNavigation = async () => {
    const newSettings = {};

    // This part remains the same, populating the newSettings object from your hub data.
    if (SelectedHub.hrms_settings && SelectedHub.hrms_settings.length > 0) {
      const hubSettings = SelectedHub.hrms_settings[0];
      // A more concise way to merge the hubSettings object
      Object.assign(newSettings, hubSettings);
    }

    updateSettings(newSettings);

    await AsyncStorage1.setItem(
      'selectedMembers',
      JSON.stringify(SelectedHub.members[0]),
    );
    onClose();
    onCloseprofile();
    navigation.navigate('SettingComponents', {
      hubName: hubName,
      id: SelectedHub?.id,
      logo: SelectedHub?.logo,
    });
  };

  const handleGeneralSettingsNavigation = () => {
    onClose();
    onCloseprofile();
    navigation.navigate('GeneralSettings', {
      hubName: hubName,
      data: SelectedHub,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.settingsOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <CloseSvg width={24} height={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.settingsModalContent}>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingOption}
              onPress={handleGeneralSettingsNavigation}>
              <SettingSvg width="24" height="24" color={textColor} />
              <Text allowFontScaling={false} style={styles.settingText}>
                General Settings
              </Text>
            </TouchableOpacity>

            {SelectedHub &&
              SelectedHub.members &&
              SelectedHub.members.length > 0 &&
              (SelectedHub.members[0].role === 'admin' ||
                SelectedHub.members[0].role === 'owner') && (
                <TouchableOpacity
                  style={styles.settingOption}
                  onPress={handleAdminSettingsNavigation}>
                  <SettingSvg width="24" height="24" color={textColor} />
                  <Text allowFontScaling={false} style={styles.settingText}>
                    Hub Admin Settings
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ProfileModal = ({ navigation, visible, onClose, setRefresh }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.85)).current;
  const [isEditMode, setEditMode] = useState(false);
  const [isWorkExpanded, setWorkExpanded] = useState(false);
  const [isPersonalExpanded, setPersonalExpanded] = useState(false);
  const [workHubs, setWorkHubs] = useState([]);
  const [personalHubs, setPersonalHubs] = useState([]);
  const [DataList, setDataList] = useState(null);
  const [hudId, setHudId] = useState(null);
  const [GetData, setGetData] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedHub, setSelectedHub] = useState(null);

  const { connect, disconnect } = useWebSocket();
  const { settings, SelectedMembers, updateSettings } = useSettings();

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

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    birth_date: '',
    date_of_joining: '',
    emergency_contact: '',
    id: '',
    profile_percentage: '',
    line_manager: '',
  });

  const toastRef = useRef(null);

  // const PerosnImage = require('../../assets/LoginAssets/png/PersonalImage.png');
  const WorkImage = require('../../../../assets/LoginAssets/png/WorkImage.png');
  const handleResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'An error occurred while picking the image.');
    } else {
      console.log(
        'response.assets[0] -==----->',
        response.assets[0],
        '\n',
        '\n',
      );
      setProfileImage(response.assets[0]);
    }
  };

  const takePhoto = async () => {
    try {
      // Check camera permission status
      const cameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      // If permission not granted, request it
      if (!cameraPermission) {
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
            'Permission Denied',
            'Camera permission is required to take photos',
          );
          return;
        }
      }

      launchCamera(
        {
          mediaType: 'photo',
          saveToPhotos: true,
          includeBase64: false,
          quality: 0.8,
        },
        handleResponse,
      );
    } catch (err) {
      console.warn('Camera Error:', err);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const chooseFromGallery = () => {
    // console.log('chooseFromGallery');
    launchImageLibrary({ mediaType: 'photo' }, handleResponse);
  };

  const imagePickerMenuItems = [
    { text: 'Camera', onPress: takePhoto },
    { text: 'Gallery', onPress: chooseFromGallery },
    { text: 'Cancel', onPress: () => { }, color: '#E53935' },
  ];

  useEffect(() => {
    const FetchData = async () => {
      try {
        const userData = await AsyncStorage1.getItem('userLoginResponse');
        setDataList(userData);
        if (userData?.data?.user) {
          setFormData({
            first_name: userData?.data?.user?.first_name || '',
            last_name: userData?.data?.user?.last_name || '',
            phone: userData?.data?.user?.phone || '',
            email: userData?.data?.user?.email || '',
            birth_date: userData?.data?.user?.birth_date || '',
            date_of_joining: userData?.data?.user?.date_of_joining || '',
            line_manager: userData?.data?.user?.line_manager || '',
            id: userData?.data?.user?.id || '',
            emergency_contact: userData?.data?.user?.emergency_contact || '',
          });
        }

        const hudIdcheck = await AsyncStorage1.getItem('HubId');

        setHudId(hudIdcheck);
      } catch (error) {
        console.log('ProfileModal FetchData Error', error);
      }
    };
    if (visible) {
      FetchData();
    }
  }, [visible]);

  const handleInputChange = useCallback((field, value) => {
    // console.log('ssddd', field, value);
    const date = FormatDDMMYYYY(value);

    const formattedValue = setFormData(prev => ({
      ...prev,
      [field]:
        field === 'birth_date' || field === 'date_of_joining' ? date : value,
    }));
  }, []);

  const FetchGetData = async () => {
    try {
      const res = await GetUserIdListingApi(formData?.id, {});
      // console.log('res get all -==----->', res?.data, '\n', '\n');
      if (res?.success && res?.data) {
        const formatDateSafely = dateString => {
          try {
            return dateString ? FormatYYYYMMDDHHMM(dateString) : '';
          } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return '';
          }
        };

        setFormData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone: res.data.mobile || '',
          email: res.data.email || '',
          birth_date: formatDateSafely(res.data.dob),
          date_of_joining: formatDateSafely(res.data.doj),
          line_manager: res.data.line_manager || '',
          id: res.data.id || '',
          emergency_contact: res.data.emergency_contact || '',
          profile_percentage: res.data.profile_percentage || '',
        });
        setProfileImage({ uri: res?.data?.profile_picture });
        setGetData(res?.data);
      }
    } catch (error) {
      console.log('error user information get -==----->', error);
    }
  };

  useEffect(() => {
    if (visible && formData?.id) {
      FetchGetData();
    }
  }, [visible, formData?.id]);

  // console.log(
  //   'profile image -=-=-=-=-=-=------>',
  //   profileImage,
  //   '\n',
  //   '\n',
  //   '\n',
  // );

  const handleSaveButton = useCallback(async () => {
    const id = DataList?.data?.user?.id;
    const postData = new FormData();

    postData.append('email', formData.email);

    if (
      formData.first_name === '' ||
      formData.last_name === '' ||
      formData.first_name.trim() === '' ||
      formData.last_name.trim() === ''
    ) {
      Alert.alert(
        'Error',
        'Please enter both first name and last name.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
      return;
    }

    if (formData?.phone?.length < 10 && formData?.phone?.length > 1) {
      Alert.alert(
        'Error',
        'Please enter valid phone number.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }

    if (
      formData?.emergency_contact?.length < 10 &&
      formData?.emergency_contact?.length > 1
    ) {
      Alert.alert(
        'Error',
        'Please enter valid emergency contact number.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }

    postData.append('first_name', formData.first_name);
    postData.append('last_name', formData.last_name);
    postData.append('mobile', formData.phone);

    if (formData.birth_date !== '') {
      postData.append('dob', FormatYYYYMMDDHHMM(formData.birth_date));
    }

    if (formData.date_of_joining !== '') {
      postData.append('doj', FormatYYYYMMDDHHMM(formData.date_of_joining));
    }
    postData.append('emergency_contact', formData.emergency_contact);

    // console.log(
    //   'handle save button profile image -==----->',
    //   profileImage,
    //   '\n',
    //   '\n',
    // );

    if (profileImage?.uri && profileImage?.type) {
      console.log('index -==----->', profileImage?.index, '\n', '\n');
      postData.append('profile_picture', {
        uri: profileImage.uri,
        type: profileImage.type,
        name: profileImage.fileName,
      });
    }

    // if (formData?.line_manager !== '') {
    postData.append('line_manager', 67);
    // }

    // console.log('formData -==----->', JSON.stringify(postData), '\n', '\n');

    try {
      const response = await PatchUserIDListingApi(id, postData);
      console.log('response  patch data 3 -==----->', response, '\n', '\n');

      if (response?.success) {
        // console.log('User Listing Updated Successfully', response);
        setFormData({
          first_name: response?.data.first_name || '',
          last_name: response?.data?.last_name || '',
          phone: response?.data?.mobile || '',
          email: response?.data?.email || '',
          birth_date: response?.data?.dob || '',
          date_of_joining: response?.data?.doj || '',
          line_manager: response?.data?.line_manager || '',
          id: response?.data?.id || '',
        });
        setEditMode(false);
        onClose();
        setRefresh(true);
        // toastRef.current?.show('User Listing Updated Successfully');
      }
    } catch (error) {
      // console.log('User Listing Updated Error', error);
      toastRef.current.show({
        type: 'error',
        message: error?.message,
      });
    }
  }, [formData, DataList, profileImage]);

  const HandleJoinHubNavigation = () => {
    onClose();
    navigation.navigate('JoinHubScreen');
    // navigation.navigate('CreateHubScreensWithAcccount');
  };

  useEffect(() => {
    const FetchHubs = async () => {
      try {
        const res = await GetCreateWorkSpaceApi({ page: 1, page_size: 60 });
        console.log('GetCreateWorkSpaceApi -==----->', '\n', '\n');
        if (res?.results) {
          setWorkHubs(res.results);
          setPersonalHubs(res.results.filter(hub => hub.type === 'personal'));
        } else {
          setWorkHubs([]);
          setPersonalHubs([]);
        }
      } catch (error) {
        console.log('error Hub Listing', error);
      }
    };

    if (visible) {
      FetchHubs();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.85,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setEditMode(false));
    }
  }, [visible, slideAnim]);

  // console.log('Selectec members --=--->', SelectedMembers, '\n', '\n');

  const handleHubId = async hubId => {
    // console.log('hubId --=--->', hubId, '\n', '\n');
    let newSettingsData = {};
    if (hubId.hrms_settings && hubId.hrms_settings.length > 0) {
      newSettingsData = hubId.hrms_settings[0];
    }

    let newSelectedMembersData = [];
    if (hubId.members && hubId.members.length > 0) {
      newSelectedMembersData = hubId.members[0];
    }

    updateSettings({
      newSettings: newSettingsData,
      newSelectedMembers: newSelectedMembersData,
      newHubId: hubId?.id,
    });

    await AsyncStorage1.setItem('HubName', JSON.stringify(hubId?.name));
    RNRestart.Restart();
    connect();
    setRefresh(true);

    onClose();
  };

  const HandleCreateHubNavigation = () => {
    onClose();
    navigation.navigate('CreateHubScreensWithAcccount');
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.85,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const openSettingsModal = hub => {
    setSelectedHub(hub);
    setSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
    setSelectedHub(null);
  };

  const HubItem = ({ item, icon, name, selected }) => {
    const isCurrentHub = hudId && item?.id && JSON.parse(hudId) === item.id;
    const [isExpanded, setIsExpanded] = useState(false);

    const activeCount = item?.live_users_count || 0;
    const inactiveCount = item?.offline_users_count || 0;

    const toggleExpand = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    return (
      <View style={styles.hubItemContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.hubItem,
            (selected || isCurrentHub) && [
              styles.hubItemSelected,
              { backgroundColor: mainOrange50 },
            ],
          ]}
          onPress={() => {
            if (isCurrentHub) {
              toggleExpand();
            } else {
              handleHubId(item);
            }
          }}>
          <View style={styles.hubContent}>
            <Image
              source={item?.logo ? { uri: item?.logo } : icon}
              style={styles.hubIcon}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.hubText,
                (selected || isCurrentHub) && [
                  styles.hubTextSelected,
                  { color: DarkColor },
                ],
              ]}
              numberOfLines={1}>
              {name} ({item?.members_count})
            </Text>
            <View style={styles.countContainer}>
              {/* <View style={[styles.countBadge, styles.activeBadge]}>
                <Text style={styles.countText}>{activeCount}</Text>
              </View>
              <View style={[styles.countBadge, styles.inactiveBadge]}>
                <Text style={styles.countText}>{inactiveCount}</Text>
              </View> */}

              <TouchableOpacity
                style={styles.arrowContainer}
                onPress={() => {
                  setIsExpanded(!isExpanded);
                }}>
                {isExpanded ? (
                  <DropUpSvg width={16} height={16} color={DarkColor80} />
                ) : (
                  <DropDownSvgIcon width={16} height={16} color={DarkColor80} />
                )}
              </TouchableOpacity>
            </View>
            {isCurrentHub && (
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  if (item?.members[0]?.role === 'member') {
                    onClose();
                    navigation.navigate('GeneralSettings', {
                      hubName: item?.name,
                      data: item,
                    });
                  } else {
                    openSettingsModal(item);
                  }
                }}
                style={styles.settingsButton}>
                <SettingSvg width="20" height="20" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.dropdownContent}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Live:</Text>
                <Text style={styles.statusTextCount}>{activeCount}</Text>
              </View>
              <View style={[styles.statusRow, { marginLeft: 10 }]}>
                <Text style={styles.statusText}>Offline:</Text>
                <Text style={styles.statusTextCount}>{inactiveCount}</Text>
              </View>
            </View>

            <View>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  navigation.navigate('MembersStatusListing');
                }}>
                <Image
                  source={require('../../../../assets/Png/Google_Maps_Old.png')}
                  style={styles.hubIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const profileSections = useMemo(
    () => [
      {
        title: 'Hub Details',
        icon: WorkImage,
        data: isWorkExpanded ? workHubs : [],
        isExpanded: isWorkExpanded,
      },
    ],
    [isWorkExpanded, workHubs, isPersonalExpanded, personalHubs],
  );

  const handleShareCode = async () => {
    const code = await AsyncStorage1.getItem('HubId');

    const formData = new FormData();
    formData.append('workspace_id', code);

    try {
      const response = await GetWorkSpaceCode(formData);
      // console.log('\n', 'response --=----->', response, '\n');

      if (response?.success && response?.data?.share_template) {
        const shareMessage = response.data.code;

        const result = await Share.share({
          message: shareMessage,
          title: 'Join my Riggle Hub',
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log(`Shared via ${result.activityType}`);
          } else {
            console.log('Content shared successfully');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dialog was dismissed');
        }
      } else {
        Alert.alert(
          'Error',
          'Could not retrieve a shareable code. Please try again.',
        );
      }
    } catch (error) {
      console.log('error --=------>', error);
    }
  };

  // console.log(
  //   'SelectedHub -==---->',
  //   JSON.stringify(SelectedMembers),
  //   '\n',
  //   '\n',
  // );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}>
          <BlurView style={styles.absolute} blurType="dark" blurAmount={5} />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}>
          <SectionList
            sections={profileSections}
            keyExtractor={item => item.id.toString()}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <ProfileHeader
                isEditMode={isEditMode}
                setEditMode={setEditMode}
                DataList={DataList}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSaveButton={handleSaveButton}
                GetData={GetData}
                setIsMenuVisible={setIsMenuVisible}
                cameraIconRef={cameraIconRef}
                openImagePickerMenu={openImagePickerMenu}
                profileImage={profileImage}
              />
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.accordionContainer}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => {
                    if (section.title === 'Hub Details')
                      setWorkExpanded(!isWorkExpanded);
                  }}>
                  <View style={styles.accordionHeaderLeft}>
                    {/* <Image source={section.icon} style={styles.accordionIcon} /> */}
                    <Text
                      allowFontScaling={false}
                      style={styles.accordionTitle}>
                      {section.title}
                    </Text>
                  </View>
                  {section.isExpanded ? (
                    <DropUpSvg width={16} height={16} color={DarkColor80} />
                  ) : (
                    <DropDownSvgIcon
                      width={16}
                      height={16}
                      color={DarkColor80}
                    />
                  )}
                </TouchableOpacity>
              </View>
            )}
            renderItem={({ item, section }) => (
              <View style={styles.accordionContent}>
                <HubItem
                  item={item}
                  icon={section.icon}
                  name={item.name}
                  selected={false}
                />
              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    {
                      borderTopWidth: 0.4,
                      borderColor: DarkColor60,
                    },
                  ]}
                  onPress={HandleCreateHubNavigation}>
                  <CreateHubSvg
                    width="30"
                    height="30"
                    widthplus="16"
                    heightplus="13"
                  />
                  <Text
                    allowFontScaling={false}
                    style={styles.footerButtonText}>
                    Create a new hub
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={HandleJoinHubNavigation}>
                  <JoinHubSvg width="30" height="30" />
                  <Text
                    allowFontScaling={false}
                    style={styles.footerButtonText}>
                    Join Hub
                  </Text>
                </TouchableOpacity>
                {/* {(SelectedMembers?.role === 'admin' ||
                  SelectedMembers?.role === 'owner' ||
                  SelectedMembers?.role === 'member') && ( */}
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={handleShareCode}>
                  <ShareHubCodeIconSvg width="30" height="30" />
                  <Text
                    allowFontScaling={false}
                    style={styles.footerButtonText}>
                    Share/Copy Riggle Hub code
                  </Text>
                </TouchableOpacity>
                {/* )} */}
              </View>
            )}
            contentContainerStyle={styles.scrollContainer}
          />
        </Animated.View>
        <Toast ref={toastRef} />

        <SettingsModal
          visible={isSettingsModalVisible}
          onClose={closeSettingsModal}
          onCloseprofile={onClose}
          hubName={selectedHub?.name}
          navigation={navigation}
          SelectedHub={selectedHub}
          userData={formData}
        />

        {/* <TriangleMenu
          isVisible={isMenuVisible}
          onClose={handleMenuClose}
          menuItems={imagePickerMenuItems}
          menuPosition={menuPosition}
        /> */}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: backgroundColor,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: StatusBar.currentHeight || 20,
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: borderColor,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    width: '50%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: placeholderColor,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'grey',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // borderWidth: 1,
    // borderColor: 'gray',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: mainOrangeColor,
    width: 30,
    height: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: mainWhiteColor,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.PoppinsSemiBold,
    color: textColor,
    marginRight: 8,
  },
  userTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: placeholderColor,
    textAlign: 'center',
  },
  mainContent: {
    // This can now be an empty container or used for spacing
  },
  accordionContainer: {
    marginBottom: 0,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: textColor,
  },
  accordionContent: {
    paddingTop: 5,
  },
  hubItemContainer: {
    width: '100%',
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 3,
    marginBottom: 5,
    // backgroundColor: mainWhiteColor,
    borderColor: DarkCOlor30,
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    justifyContent: 'space-between',
  },
  hubContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  hubItemSelected: {
    backgroundColor: '#FC8C4D1A',
    paddingVertical: 8,
    borderWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  dropdownContent: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    // flexDirection: 'row',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 13,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
  },
  statusTextCount: {
    color: mainOrangeColor,
    fontSize: 13,
    fontFamily: fonts.PoppinsSemiBold,
    marginTop: 2,
    marginLeft: 5,
  },
  countContainer: {
    flexDirection: 'row',
    marginRight: 8,
    alignItems: 'center',
  },
  arrowContainer: {
    marginLeft: 4,
    padding: 2,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#F5F5F5',
  },
  countText: {
    fontSize: 11,
    fontWeight: '500',
  },
  hubIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: DarkColor50,
    borderRadius: 20,
  },
  hubText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    flex: 1,
  },
  hubTextSelected: {
    color: primaryColor,
    fontFamily: fonts.PoppinsMedium,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: placeholderColor,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColor,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    height: 45,
    fontSize: 15,
    fontFamily: fonts.PoppinsRegular,
    color: textColor,
  },
  footer: {
    paddingTop: 60,
    backgroundColor: backgroundColor,
    flex: 1,
    justifyContent: 'flex-end',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0.4,
    borderColor: DarkColor60,
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: textColor,
    marginLeft: 15,
  },
  mockSvgIcon: {
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: mainOrangeColor,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dateInput: {
    color: '#000000',
  },
  // START: Styles for the new Settings Modal
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  settingsModalContent: {
    width: '100%',
    backgroundColor: mainWhiteColor,
    // borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  closeButton: {
    // position: 'absolute',
    // top: -15,
    // right: -10,
    backgroundColor: mainWhiteColor,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 25,
  },
  settingsContainer: {
    width: '100%',
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsRegular,
    color: textColor,
    marginLeft: 15,
    marginTop: 5,
  },
  // END: Styles for the new Settings Moda
});

export default ProfileModal;
