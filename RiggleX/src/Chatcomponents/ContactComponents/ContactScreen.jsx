import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  fonts,
  mainOrange50,
  mainOrange80,
  mainOrangeColor,
  DarkColor,
  DarkColor50,
  DarkColor20,
  DarkColor80,
  mainWhiteColor,
} from '../../utils/style/fonts';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import SearchSvg from '../../assets/svg/SearchSvg';
import ContactPersonSvgIcon from '../../assets/svg/ContactsPersonSvgIcon';
import CameraSvg from '../../assets/svg/CameraSvg';
import LinearGradient from 'react-native-linear-gradient';
import { GetUserListingApi } from '../../Api/config/HomeApi';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { PatchGroupIconapi } from '../../Api/config/HomeApi';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Toast from '../../Api/context/Toast';
// import NullCommonComponent from '../../components/NullCommonComponents/NullCommonComponents';
import EmptyListComponents from '../../components/EmptyListComponents';
import { RfH, RfW } from '../../utils/helper';
import { useNavigation } from '@react-navigation/native';
const windowWidth = Dimensions.get('window').width;

const ContactScreen = () => {
  const PlusIconImage = require('../../assets/LoginAssets/png/ArrowLogo.png');
  const [userData, setuserData] = useState([]);
  const toastRef = useRef(null);
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [searchText, setSearchText] = useState('');
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [groupImage, setGroupImage] = useState(null);
  const [Loader, setLoader] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const menuItems = ['Camera', 'Gallery', 'Cancel'];

  const handleMenuItemPress = async item => {
    setMenuVisible(false);

    if (item === 'Cancel') return;

    try {
      // 🔹 Android permission check
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

      // 🔹 iOS permission check
      if (Platform.OS === 'ios') {
        if (item === 'Camera') {
          const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
          if (cameraResult !== RESULTS.GRANTED) {
            Alert.alert(
              'Permission required',
              'Camera permission is required to take photos',
            );
            return;
          }
        } else if (item === 'Gallery') {
          const photoResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          if (photoResult !== RESULTS.GRANTED) {
            Alert.alert(
              'Permission required',
              'Photo library access is required to select photos',
            );
            return;
          }
        }
      }
      // 🔹 Open camera or gallery
      const options = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      };

      let response;
      if (item === 'Camera') {
        response = await launchCamera(options);
      } else if (item === 'Gallery') {
        // maybe typo, should be 'Gallery'
        response = await launchImageLibrary(options);
      }

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Error picking image. Please try again.');
      } else if (response.assets && response.assets[0].uri) {
        setGroupImage(response.assets[0]);
      }
    } catch (error) {
      console.log('Error:', error);
      Alert.alert('Error', 'An error occurred while selecting an image');
    }
  };

  useEffect(() => {
    const FetchData = async () => {
      try {
        const resData = await AsyncStorage1.getItem('userLoginResponse');
        // console.log(
        //   'resData user list Contact screen --=-==--->',
        //   JSON.stringify(resData),
        // );
        const res = await GetUserListingApi({});

        const AddeduserList = res?.results.map(item => ({
          ...item,
          isSelected: false,
        }));
        // console.log('res user list Contact screen --=-==--->', AddeduserList);
        setuserData(AddeduserList);
      } catch (err) {
        console.log('err user list Contact screen --=-==--->', err);
      }
    };

    FetchData();
  }, []);

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

  const buttonRef = React.useRef(null);
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



  const handleGroupProfileIcon = async (
    uri,
    id,
    conversation,
    name,
    group_id,
  ) => {
    setLoader(true);
    if (!uri) {
      navigation.navigate('ChatWindows', {
        conversationId: conversation,
        isGroup: true,
        GroupId: group_id,
        name: name,
        type: 'old',
      });
      return;
    }

    const formData = new FormData();

    const fileExt = uri.uri.split('.').pop();
    const fileName = `group_icon_${Date.now()}.${fileExt}`;

    const file = {
      uri: uri.uri,
      type: `image/${fileExt}`,
      name: fileName,
    };

    formData.append('profile_picture', file);

    // console.log(
    //   'Uploading group icon...',
    //   JSON.stringify(formData),
    //   '\n',
    //   '\n',
    // );

    try {
      const response = await PatchGroupIconapi(group_id, formData);
      // console.log('Upload successful:', response);

      setLoader(false);
      navigation.navigate('ChatWindows', {
        conversationId: conversation,
        isGroup: true,
        GroupId: group_id,
        name: name,
        type: 'old',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      // setLoader(false);
      toastRef.current.show({
        type: 'error',
        message: error.message,
      });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (lastMessage?.message === 'Group created successfully') {
      if (groupImage) {
        handleGroupProfileIcon(
          groupImage,
          lastMessage?.data?.group_id,
          lastMessage?.data?.conversation,
          lastMessage?.data?.name,
          lastMessage?.data?.group_id,
        );
      } else {
        setuserData(prevUsers =>
          prevUsers.map(user => ({
            ...user,
            isSelected: false,
          })),
        );

        // setLoader(false);

        setSelectedMembers([]);
        setGroupName('');
        setGroupImage(null);
        setSearchText('');
        navigation.navigate('ChatWindows', {
          conversationId: lastMessage?.data?.conversation,
          isGroup: true,
          GroupId: lastMessage?.data?.group_id,
          name: lastMessage?.data?.name,
          type: 'old',
          navigatetype: 'groupnavigate',
        });
      }
    }
  }, [lastMessage]);

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

  const SelectedGroupMemberImage = require('../../assets/Png/SelectedGroupMemberImage.png');

  let filteredUsers = useMemo(() => {
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

  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => handleSelectMember(item.id)}
        activeOpacity={0.7}>
        <Image
          source={
            item.profile_picture
              ? { uri: item.profile_picture }
              : require('../../assets/Png/ProfileIcon.png')
          }
          style={styles.avatar}
        />
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

  const gradientColors = ['#FC8C4D33', '#ffffff', '#F5D3BF', '#F4E3D9'];

  const handleGroupCreate = () => {
    if (isDisabled) return; // safety guard

    setIsDisabled(true);
    setLoader(true);

    console.log('groupName ====>', groupName);

    if (groupName === '' || groupName.trim() === '') {
      toastRef.current.show({
        type: 'error',
        message: 'Please enter group name.',
      });
      setLoader(false);
      setTimeout(() => setIsDisabled(false), 3000);
      return;
    }

    const selectedUserIds = userData
      .filter(user => user.isSelected)
      .map(user => user.id);

    if (selectedUserIds.length === 0) {
      toastRef.current.show({
        type: 'error',
        message: 'Please select at least one member.',
      });
      setLoader(false);
      setTimeout(() => setIsDisabled(false), 3000);
      return;
    }

    const Payload = {
      action: 'create_group',
      name: groupName,
      member_ids: selectedUserIds,
    };

    sendMessage(Payload);

    setLoader(false);
    navigation.navigate('ScreenChat');
    // ⏱ Enable again after 3 seconds
    setTimeout(() => {
      setIsDisabled(false);
    }, 3000);
  };


  console.log('\n');

  console.log(
    'lastmessage contact filteredUsers',
    Loader,
    '\n',
    '\n',
    '\n',
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor={mainOrange50} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientContainer}
          useAngle={true}
          angle={145}
          angleCenter={{ x: 0.5, y: 0.5 }}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <BackArrowSvg />
            </TouchableOpacity>

            <View style={styles.groupIconContainer}>
              <View style={styles.groupIconPlaceholder}>
                {groupImage ? (
                  <Image
                    source={groupImage}
                    style={{ width: '100%', height: '100%', borderRadius: 40 }}
                    resizeMode="cover"
                  />
                ) : (
                  <ContactPersonSvgIcon width={35} height={35} />
                )}
                <TouchableOpacity
                  style={styles.cameraButton}
                  ref={buttonRef}
                  onLayout={measureButton}
                  onPress={() => {
                    measureButton();
                    setMenuVisible(true);
                  }}>
                  <CameraSvg width="15" height="15" />
                </TouchableOpacity>
              </View>
              {/* <Text style={styles.groupIconLabel}>Add group icon</Text> */}
            </View>

            <Text style={styles.groupNameLabel}>Add group name*</Text>
            <Text style={styles.groupNameHint}>(Maximum 50 characters)</Text>
            <View style={{ width: '60%', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: RfH(4), }}>
              <TextInput
                style={styles.groupNameInput}
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
                placeholderTextColor={DarkColor50}
              />
            </View>

            <Text style={styles.memberCount}>
              Currently {selectedMembers.length} members added
            </Text>
          </View>
        </LinearGradient>

        {/* Bottom Section */}
        <View style={styles.bottomContainer}>
          <Text style={styles.addMembersTitle}>Add Members</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Contact"
              placeholderTextColor={mainOrangeColor}
              value={searchText}
              onChangeText={setSearchText}
            />
            <SearchSvg width="16" height="16" color={mainOrangeColor} />
          </View>

          {/* *** MODIFICATION START *** */}
          <FlatList
            data={filteredUsers}
            renderItem={renderContactItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyListComponents
                type={1}
                text="No Members in your hubs"
                marginData={5}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          {/* *** MODIFICATION END *** */}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, (isDisabled || Loader) && { opacity: 0.6 }]}
        onPress={handleGroupCreate}
        disabled={isDisabled || Loader}
      >
        <Image source={PlusIconImage} style={styles.fabIcon} />
      </TouchableOpacity>


      <Toast ref={toastRef} />

      {renderFilterMenu(buttonPosition)}
    </SafeAreaView>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  gradientContainer: {
    height: 300,
  },
  // --- Top Section Styles ---
  topContainer: {
    // backgroundColor: mainOrange50,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
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
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
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
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor,
    marginBottom: 5,
    textAlign: 'center',
  },
  groupNameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: DarkColor80,
    paddingHorizontal: 15,
    // height: RfH(40),
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? RfH(10) : RfH(4),
  },
  groupNameHint: {
    fontFamily: fonts.PoppinsLight,
    fontSize: 8,
    color: DarkColor50,
    marginTop: 2,
    alignSelf: 'center',
  },
  memberCount: {
    fontFamily: fonts.PoppinsLight,
    fontSize: 14,
    color: DarkColor80,
    textAlign: 'center',
    marginTop: 10,
  },
  // --- Bottom Section Styles ---
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginTop: RfH(-25),
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 25,
    borderColor: mainOrangeColor,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
    bottom: RfH(120),
    right: RfW(15),
    width: RfW(50),
    height: RfH(50),
    borderRadius: 30,
    backgroundColor: mainWhiteColor,
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
});
