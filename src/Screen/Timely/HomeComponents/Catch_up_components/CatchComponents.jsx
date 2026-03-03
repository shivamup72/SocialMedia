import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Pressable,
} from 'react-native';
import ClockIcon from '../../../../assets/svg/ClockSvg';
import {
  mainOrangeColor,
  fonts,
  DarkColor,
  DarkColor20,
  DarkColor50,
} from '../../../../utils/style/fonts';

import { GetCatchUpTodayApi, GetMeetingApi } from '../../../../Api/config/HomeApi';
import { formatTimeToAMPM } from '../../../../utils/CommonUtils';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import NullCommonComponent from '../../../../components/NullCommonComponents';
import CustomText from '../../../../utils/CustomText';

const ClockIcon1 = () => (
  <View style={styles.clockIconPlaceholder}>
    <ClockIcon color={mainOrangeColor} width={18} height={18} />
  </View>
);

const CatchComponents = ({ DataListTask, Refresh, setRefresh }) => {
  const navigation = useNavigation();
  const AstronotImage = require('../../../../assets/LoginAssets/png/StandingAstronot.png');

  const IsFocused = useIsFocused();

  const phoneSmsImage = require('../../../../assets/Png/CatchUpIcon.png');

  const profileIcons = {
    profile1: require('../../../../assets/Png/ProfileIcon.png'),
    profile2: require('../../../../assets/Png/ProfileIcon2.png'),
  };

  const [DataList, setDataList] = useState([]);
  console.log(DataList, "DataList");


  const FetchData = async () => {
    try {
      const response = await GetMeetingApi({});
      // console.log('in CatchComponents Dashboard response ==--==-->', response);
      setDataList(response?.results);
    } catch (err) {
      console.log('in CatchComponents Dashboard err ==--==-->', err);
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

  // console.log('DataListTask ====>', DataListTask);

  const joinMeeting = async meetingUrl => {
    try {
      if (
        meetingUrl &&
        (meetingUrl.includes('meet.google.com') ||
          meetingUrl.startsWith('https://meet.google.com/'))
      ) {
        const meetAppUrl = meetingUrl.startsWith('http')
          ? meetingUrl
          : `https://${meetingUrl}`;
        const supported = await Linking.canOpenURL(meetAppUrl);

        if (supported) {
          await Linking.openURL(meetAppUrl);
        } else {
          await Linking.openURL(meetAppUrl);
        }
      } else if (meetingUrl) {
        // For non-Google Meet URLs, open in default browser
        const formattedUrl = meetingUrl.startsWith('http')
          ? meetingUrl
          : `https://${meetingUrl}`;
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert('Error', 'No meeting URL provided');
      }
    } catch (error) {
      console.error('Error opening meeting:', error);
      Alert.alert(
        'Error',
        'Could not open the meeting. Please check the URL and try again.',
      );
    }
  };

  const handleTaskPress = item => {
    navigation.navigate('EventTypeScreen', { Data: item });
  };

  const renderCatchUpItem = ({ item }) => (
    <Pressable
      style={styles.cardContainer}
      onPress={() => handleTaskPress(item)}>
      <View style={styles.cardTopRow}>
        <TouchableOpacity style={styles.timeWrapper}>
          <ClockIcon1 />
          <CustomText allowFontScaling={false} style={styles.timeText}>
            {formatTimeToAMPM(item?.start_time)}
          </CustomText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          marginTop: 10,
        }}>
        <CustomText
          allowFontScaling={false}
          style={styles.descriptionText}
          numberOfLines={2}>
          {item.description}
        </CustomText>
        {/* {console.log('item.meeting_link ====>', item?.meeting_link, '\n')} */}
        {item?.meeting_link && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => joinMeeting(item.meeting_link)}>
            <CustomText allowFontScaling={false} style={styles.joinButtonText}>
              Join
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );

  const handlePlanMeeting = () => {
    navigation.navigate('MeetingScreen');
  };

  // console.log('DataList ====>', DataListTask[0]?.completion_rate);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image source={phoneSmsImage} style={styles.headerIcon} />
          <CustomText allowFontScaling={false} style={styles.headerTitle}>
            Catch-ups today({DataList.length})
          </CustomText>
        </View>
        {DataListTask.length > 0 && (
          <CustomText allowFontScaling={false} style={styles.headerSubtitle}>
            {DataListTask[0]?.completion_rate} tasks done
          </CustomText>
        )}
      </View>

      {DataList.length > 0 ? (
        <FlatList
          data={DataList}
          renderItem={renderCatchUpItem}
          keyExtractor={item => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      ) : (
        <NullCommonComponent
          title="Looks like your calendar's clear"
          subtitle="— time to plan your first meeting!"
          buttonText="Let's Begin"
          onButtonPress={handlePlanMeeting}
          imageSource={AstronotImage}
          borderColor="#A5B4FC"
        />
      )}
    </View>
  );
};

export default CatchComponents;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    paddingHorizontal: 5,
    paddingBottom: 5,
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  headerSubtitle: {
    fontSize: 12,
    color: DarkColor50,
    marginRight: 5,
  },
  listContentContainer: {
    paddingBottom: 10,
    paddingLeft: 10,
  },
  cardContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 8,
    marginRight: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(131, 132, 239, 1)',
    borderLeftWidth: 5,
    borderLeftColor: '#9F7AEA',
    justifyContent: 'space-between',
    flexDirection: 'column',
    height: 100,
    elevation: 3
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIconPlaceholder: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginLeft: 2,
    marginTop: 4,
  },
  attendeesContainer: {
    flexDirection: 'row',
  },
  attendeeImage: {
    width: 25,
    height: 25,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: mainOrangeColor,
  },
  descriptionText: {
    fontSize: 10,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
    flex: 1,
    marginRight: 5,
  },
  joinButton: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
  joinButtonText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
  },
  emptyContainer: {
    marginHorizontal: 15,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    borderColor: '#c5b3f1',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 10,
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  emptySubtitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor50,
    marginTop: 5,
    marginBottom: 10,
  },
  beginButton: {
    backgroundColor: 'white',
    borderColor: mainOrangeColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  beginButtonText: {
    color: mainOrangeColor,
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
  },
  astronautImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});
