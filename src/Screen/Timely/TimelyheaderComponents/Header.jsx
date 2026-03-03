import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import {
  fonts,
  DarkColor60,
  DarkColor,
  mainOrange25,
  DarkColor50,
} from '../../../utils/style/fonts';
import CustomText from '../../../utils/CustomText';
// import CalenderSvg from '../../assets/svg/CalenderSvg';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import ProfileModal from '../../HomeComponents/HeaderhomeComponents/ProfileModal';

const Header = ({ navigation, setRefresh }) => {
  // const profileImage = require('../../assets/Png/ProfileIcon.png');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const formatDate = date1 => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date1.toLocaleDateString('en-US', options);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleProfilePress = () => {
    setIsProfileModalVisible(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalVisible(false);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.profileContainer}>
        {/* <TouchableOpacity style={styles.profileImageWrapper} onPress={handleProfilePress}>
          <Image source={profileImage} style={styles.profileImage} />
        </TouchableOpacity> */}
        {/* <Text allowFontScaling={false} style={styles.workspaceName}>Riggle Workspace</Text> */}
      </View>
      <CustomText style={styles.titleText}>Timely</CustomText>

      {/* <TouchableOpacity
        style={styles.dateContainer}
        onPress={showDatepicker}
        activeOpacity={0.7}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <View style={styles.calendarIcon}>
          <CalenderSvg width="16" height="16" />
        </View>
      </TouchableOpacity> */}

      {/* {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )} */}

      {/* <ProfileModal
        visible={isProfileModalVisible}
        onClose={closeProfileModal}
        navigation={navigation}
        setRefresh={setRefresh}
      /> */}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: mainOrange25,
  },
  titleText: {
    fontSize: 20,
    // fontWeight: 'bold',
    color: DarkColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F8F9FA',
    paddingHorizontal: 5,
    // paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: DarkColor60,
    minWidth: 120,
    height: 40,
  },
  dateText: {
    fontSize: 10,
    color: DarkColor60,
    fontFamily: fonts.PoppinsRegular,
    marginRight: 8,
    flex: 1,
  },
  calendarIcon: {
    marginLeft: 4,
  },
  profileContainer: {
    alignItems: 'center',
    marginRight: 5,
  },
  profileImageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: DarkColor50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 41,
  },
});
