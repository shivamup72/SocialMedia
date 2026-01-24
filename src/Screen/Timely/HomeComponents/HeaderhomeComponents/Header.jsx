import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import RocketButton from './RocketButton/RocketButton';
import ProgressCircularComponents from './ProgressComponets/ProgressCircularComponents';
import {
  fonts,
  DarkColor,
  DarkCOlor30,
  DarkColor20,
  DarkColor80,
  mainOrange20,
  mainOrangeColor,
  DarkColor50,
} from '../../../../utils/style/fonts';
import AsyncStorage1 from '../../../../Api/config/AsyncStorage';
import { useIsFocused } from '@react-navigation/native';
import { useSettings } from '../../../../Api/context/SettingsContext';
import { GetUserIdListingApi } from '../../../../Api/config/HomeApi';

const HeaderComponents = ({ navigation, DataListTask, Refresh, setRefresh }) => {
  const ProfileImage = require('../../../../assets/Png/ProfileIcon.png');
  const Bellimage = require('../../../../assets/Png/bellIconImage.png');
  const [UserData, setUserData] = useState([]);
  const [HubName, setHubName] = useState('');
  const [Name, setname] = useState(null);
  const IsFocused = useIsFocused();
  const [GetData, setGetData] = useState([]);

  const { settings } = useSettings();

  const FetchData = async () => {
    try {
      const userData = await AsyncStorage1.getItem('userLoginResponse');
      setUserData(userData);

      const userId = userData?.data?.user?.id;

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
      console.log('User Details Error ==-=-==--->', error);
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

  const handleProfilePress = () => {
    setIsProfileModalVisible(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalVisible(false);
  };

  // console.log('DataListTask --=--===>', settings);

  const handleHubNameLength = () => {
    if (HubName?.length > 18) {
      return HubName?.slice(0, 10) + '...';
    }
    return HubName;
  };

  return (
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
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              style={styles.workspaceName}
              numberOfLines={1}>
              {handleHubNameLength(HubName)}
            </Text>
          </View>

          <View style={styles.greetingContainer}>
            <Text allowFontScaling={false} style={styles.greetingText}>
              Hello
            </Text>
            <Text allowFontScaling={false} style={styles.greetingText}>
              {GetData?.first_name + ' ' + GetData?.last_name ||
                'Unknown Riggler!'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {settings?.start_day_end_day && <RocketButton />}

          <TouchableOpacity style={styles.bellButton}>
            <Image source={Bellimage} style={styles.bellIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressSectionContainer}>
        <ProgressCircularComponents
          completionPercentage={DataListTask[0]?.completion_percentage || 0.0}
        />
      </View>
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={closeProfileModal}
        navigation={navigation}
        setRefresh={setRefresh}
      />
    </View>
  );
};

export default HeaderComponents;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 0,
    backgroundColor: '#f9f9f9',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: DarkColor50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 41,
  },
  workspaceName: {
    marginTop: 8,
    fontSize: 9,
    color: DarkColor80,
    fontFamily: fonts.PoppinsMedium,
  },
  greetingContainer: {
    marginLeft: 10,
    paddingTop: 16,
  },
  greetingText: {
    fontSize: 13,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    lineHeight: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  bellButton: {
    marginLeft: 15,
  },
  bellIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#495057',
  },
  progressSectionContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
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
