import React, { useState, useEffect, useCallback } from 'react';
// import ProfileModal from './ProfileModal';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
  SafeAreaView
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  fonts,
  DarkColor,
  DarkColor80,
  mainOrange20,
  DarkColor50,
  mainWhiteColor,
  mainOrangeColor,
} from '../../../utils/style/fonts';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSettings } from '../../../Api/context/SettingsContext';
import { GetUserIdListingApi } from '../../../Api/config/HomeApi';
import { RfH, RfW } from '../../../utils/helper';
import CustomText from '../../../utils/CustomText';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import ProfileModal from '../../../Screen/Timely/HomeComponents/HeaderhomeComponents/ProfileModal';

const HeaderComponents = ({ navigation, DataListTask, Refresh, setRefresh }) => {
  const { isConnected } = useWebSocket();
  const ProfileImage = require('../../../assets/Png/ProfileIcon.png');
  const Bellimage = require('../../../assets/Png/bellIconImage.png');
  const calanderImage = require('../../../assets/Png/calender.webp');
  const offline = require('../../../assets/Png/offline.png');


  const [UserData, setUserData] = useState([]);
  const [HubName, setHubName] = useState('');
  console.log(HubName, "<<--HubName--->>");

  const [Name, setname] = useState(null);
  const IsFocused = useIsFocused();
  const [GetData, setGetData] = useState(null);

  useEffect(() => {
    if (GetData) {
      console.log(GetData, "<<--GetData--->>");
    }
  }, [GetData]);


  const { settings } = useSettings();

  const FetchData = async () => {
    try {
      const userData = await AsyncStorage1.getItem('userLoginResponse');
      setUserData(userData);
      const userId = userData?.data?.user?.id; // Fallback to data.id if data.user.id is not available
      const response = await GetUserIdListingApi(userId, {});
      // console.log('GetUserIdListingApi --=--===>', response);
      if (response?.success) {
        setGetData(response?.data);
      }

      // console.log('user data --=--====>', userData);
      const hubname = await AsyncStorage1.getItem('HubName');
      // console.log('HubName --=--===>', hubname);
      setHubName(hubname);
      const first_name = await AsyncStorage1.getItem('first_name');
      const last_name = await AsyncStorage1.getItem('last_name');
      setname(first_name + ' ' + last_name);
    } catch (error) {
      console.log('User Details Error ==-=-==---> Main Home Page', error);
    } finally {
      setRefresh(false);
    }
  };
  useEffect(() => {
    FetchData();
  }, [IsFocused]);

  useEffect(() => {
    if (Refresh) {
      FetchData();
    }
  }, [Refresh]);

  const progressPercentage = 60;
  const circleSize = 45;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (circumference * progressPercentage) / 100;

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);


  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };
  useFocusEffect(
    useCallback(() => {
      setProfileModalVisible(false);
    }, [])
  );
  const handleHubNameLength = () => {
    if (HubName?.length > 18) {
      return HubName?.slice(0, 10) + '...';
    }
    return HubName;
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.userInfoSection}>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                style={styles.profileImageWrapper}
                onPress={handleProfilePress}>
                <Image
                  source={
                    GetData?.profile_picture
                      ? { uri: GetData?.profile_picture }
                      : ProfileImage
                  }
                  style={styles.profileImage}
                />
                <View
                  style={{
                    width: RfW(10),
                    height: RfW(10),
                    borderRadius: RfW(5),
                    backgroundColor: isConnected ? '#00D100' : '#C4C4C4',
                    // marginRight: RfW(-40),
                    bottom: RfH(6),
                    position: 'absolute',
                    right: RfW(-0),

                  }}
                />
              </TouchableOpacity>

              <View>
                <CustomText style={styles.workspaceName}>{handleHubNameLength()}</CustomText>

              </View>
            </View>
            <View style={styles.greetingContainer}>
              <CustomText allowFontScaling={false} style={styles.greetingText1}>
                Hello {getGreeting()}
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.greetingText}>
                {(() => {
                  const name = GetData?.first_name ? (GetData?.first_name + ' ' + GetData?.last_name) : 'Unknown Riggler!';
                  return name.length > 16 ? name.slice(0, 16) + '...' : name;
                })()}
              </CustomText>
            </View>
          </View>
          <View style={styles.actionsContainer}>
            {settings?.start_day_end_day && <RocketButton />}
            <View style={styles.bellIcon}>
              <Image source={calanderImage} style={styles.imagestyle} resizeMode='contain' />
            </View>
            <View style={styles.bellIcon}>
              <Image source={Bellimage} style={styles.imagestyle} resizeMode='contain' />
            </View>
            <View style={styles.offlineimage}>
              <Image source={offline} style={styles.imagestyle} resizeMode='contain' />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.devider}></View>
      {/* <ProfileModal
        visible={isProfileModalVisible}
        onClose={closeProfileModal}
        navigation={navigation}
        setRefresh={setRefresh}
      /> */}
      <ProfileModal
        navigation={navigation}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default HeaderComponents;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: mainWhiteColor,
    borderBottomColor: mainOrange20,
  },
  container: {
    paddingBottom: 0,
    backgroundColor: mainWhiteColor,
  },
  devider: {
    borderBottomWidth: 1,
    borderBottomColor: mainOrange20,
    paddingVertical: RfH(6)

  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: RfW(16),
    paddingTop: RfH(14)
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImageWrapper: {
    // width: RfW(56),
    // height: RfH(56),
    // borderRadius: RfH(28),
    // borderWidth: 1,
    // borderColor: DarkColor50,
    // justifyContent: 'center',
    // alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FC8C4D',
    height: RfH(50),
    width: RfH(50),
    borderRadius: RfH(25),
    position: 'relative',
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
  profileImage: {
    width: RfW(50),
    height: RfH(50),
    borderRadius: RfH(25),
    borderWidth: 1,
    borderColor: mainOrangeColor,

  },
  workspaceName: {
    marginTop: RfH(2),
    fontSize: 9,
    color: DarkColor80,
    fontFamily: fonts.PoppinsMedium,
    top: RfH(4)
  },
  greetingContainer: {
    marginLeft: RfW(4),
    // paddingTop: RfH(4),
    top: RfH(6)
  },
  greetingText: {
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    lineHeight: 14,
    top: RfH(2)
  },
  greetingText1: {
    fontSize: 12,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    lineHeight: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    gap: RfW(12),
  },
  bellButton: {
    marginLeft: 15,
  },
  imagestyle: {
    height: '100%',
    width: '100%'
  },
  offlineimage: {
    width: RfW(63),
    height: RfH(24),
  },
  bellIcon: {
    width: RfW(16.95),
    height: RfH(16.95),
  },
  progressSectionContainer: {
    alignItems: 'flex-end',
    // marginTop: -10,
    // backgroundColor: 'red',
  },
  progressCircleWrapper: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 18,
    fontFamily: fonts.PoppinsMedium, // Using PoppinsSemiBold font for the progress text
    color: DarkColor,
  },
});
