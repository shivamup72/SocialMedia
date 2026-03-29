import {
  Image,
  StyleSheet,
  View,
  StatusBar,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import FilterSvg from '../../assets/svg/FilterSvg';
import SearchSvg from '../../assets/svg/SearchSvg';
import {
  fonts,
  mainOrange50,
  mainOrange80,
  mainOrangeColor,
  DarkColor,
  mainOrange92,
  DarkColor50,
  mainWhiteColor,
  DarkColor80,
} from '../../utils/style/fonts';
// import ProfileModal from '../../HomeComponents/HeaderhomeComponents/ProfileModal';
import Toast from '../../Api/context/Toast';
import { normalize, RfH, RfW } from '../../utils/helper';
import { GetUserIdListingApi } from '../../Api/config/HomeApi';
import EventEmitter from '../../utils/EventEmitter';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import CustomText from '../../utils/CustomText';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ProfileModal from '../../Screen/Timely/HomeComponents/HeaderhomeComponents/ProfileModal';

const HeaderComponents = ({

  navigation,
  FilterValue,
  setFilterValue,
  setSearchValue,
  SearchValue,
  full = 'not',
  searchIcon,
  searchIconStyle,
  setHideTabBar,
  hideTabBar
}) => {
  const { isConnected } = useWebSocket();
  const IsFocused = useIsFocused();
  const [HubName, setHubName] = useState('');
  const [UserData, setUserData] = useState([]);
  const [GetData, setGetData] = useState([]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);


  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };
  useFocusEffect(
    useCallback(() => {
      setProfileModalVisible(false);
    }, [])
  );

  // Hide Tab bar only when input is focused
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (typeof setHideTabBar === 'function') {
      setHideTabBar(inputFocused);
    }
  }, [inputFocused, setHideTabBar]);
  // Blur input when keyboard is dismissed (e.g. mobile back button)
  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    });
    return () => keyboardHideListener.remove();
  }, []);

  useEffect(() => {
    if (GetData && GetData.length !== 0) {
      console.log(GetData, "<<--GetData--->>");
    }
  }, [GetData]);
  const ProfileImage = require('../../assets/Png/ProfileIcon.png');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [SearchVisible, setSearchVisible] = useState(false);
  // Ensure Tab bar is shown when search is closed
  useEffect(() => {
    if (!SearchVisible && typeof setHideTabBar === 'function') {
      setHideTabBar(false);
    }
  }, [SearchVisible, setHideTabBar]);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const Bellimage = require('../../assets/Png/bellIconImage.png');

  const FetchData = async () => {
    try {
      const userData = await AsyncStorage1.getItem('userLoginResponse');
      setUserData(userData);
      const userId = userData?.data?.user?.id;
      const response = await GetUserIdListingApi(userId, {});
      if (response?.success) {
        setGetData(response?.data);
      }
      const hubname = await AsyncStorage1.getItem('HubName');
      setHubName(hubname);
    } catch (error) {
      console.log('User Details Error ==-=-==--->', error);
    } finally {
      setRefresh(false);
    }
  };
  useEffect(() => {
    FetchData();
  }, [IsFocused]);

  // Listen for profile update event to refresh data
  useEffect(() => {
    const onProfileUpdated = () => {
      FetchData();
    };
    EventEmitter.on('profileUpdated', onProfileUpdated);
    return () => {
      EventEmitter.off('profileUpdated', onProfileUpdated);
    };
  }, []);

  const handleHubNameLength = () => {
    if (HubName?.length > 18) {
      return HubName?.slice(0, 10) + '...';
    }
    return HubName;
  };

  useEffect(() => {
    if (full === 'check') {
      console.log('Full -=-=-==--->', full);
      setSearchVisible(true);
    }
  }, []);
  const closeProfileModal = () => {
    setIsProfileModalVisible(false);
  };

  const menuItems = ['All', 'Unread', 'Private', 'Groups', 'Call'];

  const handleMenuItemPress = item => {
    setSelectedFilter(item);
    setMenuVisible(false);
    // console.log('Selected:', item);
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
              <CustomText
                allowFontScaling={false}
                style={[
                  styles.menuItem,

                  item === selectedFilter && styles.menuItemSelected,
                ]}>
                {item}
              </CustomText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View>
      <View style={[styles.container, { borderBottomColor: SearchVisible ? mainWhiteColor : mainOrangeColor }]}>
        <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />

        <View style={styles.container1}>
          {/* LEFT SIDE */}
          <TouchableOpacity style={styles.leftSection} onPress={() => handleProfilePress()}>
            <View>
              <View style={styles.avatarContainer}>
                <Image source={
                  GetData?.profile_picture
                    ? { uri: GetData?.profile_picture }
                    : ProfileImage
                } style={styles.avatarImage} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    position: 'absolute',
                    left: 0,
                    bottom: 5,
                    right: -10,
                  }}
                >
                  <View
                    style={{
                      width: RfW(10),
                      height: RfW(10),
                      borderRadius: RfW(5),
                      backgroundColor: isConnected ? '#00D100' : '#C4C4C4',
                      marginRight: RfW(8),
                    }}
                  />
                </View>
              </View>

              <CustomText style={styles.hubName}>{handleHubNameLength()}</CustomText>
            </View>
            {/* <View style={styles.userInfo}>
              <CustomText style={styles.greeting}></CustomText>
              <CustomText style={styles.userName}></CustomText>
            </View> */}
          </TouchableOpacity>
          {/* RIGHT SIDE ICONS */}
          <View style={styles.rightSection}>
            <Pressable
              onPress={() => setSearchVisible(v => !v)}
              style={[
                searchIconStyle,
              ]}
            >
              {searchIcon}
            </Pressable>
            <Pressable>
              <Image source={Bellimage} style={[styles.icon]} />
            </Pressable>
          </View>
        </View>
        {/* Show search bar below header when SearchVisible is true */}
      </View>
      <View>
        {SearchVisible && (
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchContainerExpanded}>
              <View style={{ marginHorizontal: 10, marginRight: 5 }}>
                <SearchSvg width={22} height={22} color="#FC8C4DE5" />
              </View>
              <TextInput
                ref={inputRef}
                allowFontScaling={false}
                placeholder="Search"
                value={SearchValue}
                onChangeText={setSearchValue}
                style={styles.searchInput}
                placeholderTextColor={DarkColor50}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </View>
          </View>
        )}
      </View>
      {renderFilterMenu()}
      <ProfileModal
        navigation={navigation}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </View >
  );
};

export default HeaderComponents;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: mainOrange80,
    borderBottomWidth: 1.3,
    backgroundColor: '#ffffff',
  },

  chatAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
  },

  ChatsTextStyle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 16,
    color: DarkColor,
    marginLeft: 10,
  },
  searchBarWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomColor: mainOrange80,
    borderBottomWidth: 1,
  },
  profileContainer: {
    borderWidth: 1,
    borderColor: mainOrangeColor,
    borderRadius: 50,
    padding: 0,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 25,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    backgroundColor: mainOrange80,
    borderRadius: 25,
    marginRight: 0,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    marginLeft: 0,
  },

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
    elevation: 5,
  },
  menuItem: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  menuItemSelected: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },

  searchContainerExpanded: {
    borderWidth: 1,
    borderColor: '#FC8C4DE5',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    // marginLeft: 15,
    width: '100%',
    height: 45,
    backgroundColor: '#FC8C4D1A',
  },
  searchInput: {
    flex: 1,
    borderRadius: 25,
    fontSize: 14,
    // fontFamily:fonts.PoppinsRegular,
    color: DarkColor,
  },
  container1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: RfH(8),
    backgroundColor: mainWhiteColor,
    width: '100%',
  },

  /** LEFT SIDE **/
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    // width: RfW(44),
    // height: RfH(44),
    borderWidth: 2,
    // borderRadius: 22,
    borderColor: mainOrangeColor,
    // top: RfH(4),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FC8C4D',
    height: RfH(44),
    width: RfH(44),
    borderRadius: RfH(22),
    position: 'relative',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: RfH(22)
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: mainOrangeColor,
    width: '100%',
  },
  hubName: {
    marginTop: RfH(4),
    color: DarkColor80,
    fontSize: normalize(10),
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
  },
  userInfo: {
    marginLeft: RfW(12),
    justifyContent: 'center',
  },
  greeting: {
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    lineHeight: normalize(16),
  },
  userName: {
    fontSize: normalize(10),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginTop: RfH(4),
  },
  /** RIGHT SIDE **/
  rightSection: {
    flexDirection: 'row',
    bottom: RfH(4),
  },
  icon: {
    width: RfW(19.95),
    height: RfH(19.95),
    resizeMode: 'contain',

  },
  bellMargin: {
    marginLeft: RfW(18),
  },
});
