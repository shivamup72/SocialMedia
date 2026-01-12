import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  Alert,
  Linking,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor60,
  DarkColor80,
  DarkColor20,
} from '../../../utils/style/fonts';

import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import PendingDocumentSvg from '../../../assets/svg/material_symbols_pending_actions_rounded';
import ClockIcon from '../../../assets/svg/ClockSvg';
import CalenderSvg from '../../../assets/svg/CalenderSvg';
import BellNotifications from '../../../assets/svg/Bell_notification';
import DropDownSvgIcon from '../../../assets/svg/DropDownSvg';
import CommentIconSvg from '../../../assets/svg/iconamoon_comment_light';
import { formatTimeToAMPM } from '../../../utils/CommonUtils';
import {
  GetTaskAllData,
  PostCommentApi,
  GetCommentApi,
  DeleteMeetingApi,
  GetMeetingApiById,
} from '../../../Api/config/TimelyApi';
import ButtonModalScreen from './ButtonModalScreen';
import CompletedTaskIcon from '../../../assets/svg/completed_task_icon';
import EventSubTaskScreen from './EventSubTaskScreen';
// import { apiPost, apiGet } from '../../context/ApiServices';
// import { PrivateUserIconapi } from '../../config/apiUrls';
// import { CommentApi } from '../../config/apiUrls';
import Toast from '../../../Api/context/Toast';
import ConfirmationModal from '../ReuseableComponents/ReuseableComponents';
import AttendeeList from '../../../components/AttendeeList/AttendeeList';
import { useIsFocused } from '@react-navigation/native';
import { formatDateInMonth, FormatDDMMYYYY } from '../../../utils/CommonUtils';

const EventTypeScreen = ({ navigation, route }) => {
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default behavior (app close)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);
  const { Data } = route.params;
  //   console.log('\n', 'Data: ==----\u003e', '\n', JSON.stringify(Data));

  const [isDoneModalVisible, setDoneModalVisible] = useState(false);
  const [isRescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState('10 min before');

  const [isDeleteMeetingModalVisible, setDeleteMeetingModalVisible] =
    useState(false);
  const [commentStatus, setCommentStatus] = useState(false);
  const [CommentInput, setCommentInput] = useState('');
  const [subTaskData, setSubTaskData] = useState([]);
  const [Loading, setLoading] = useState(true);
  const ProfileIcon = require('../../../assets/Png/ProfileIcon.png');
  const ProfileIcon2 = require('../../../assets/Png/ProfileIcon2.png');
  const ChatArrow = require('../../../assets/Png/ChatArrowtosms.png');
  const [CommentsData, setCommentsData] = useState([]);
  const toastRef = useRef(null);

  const IsFocused = useIsFocused();

  const [MeetingData, setMeetingData] = useState([]);

  const FetchData = async () => {
    try {
      const response = await GetTaskAllData(Data?.id, {});
      console.log(
        'response event Task screens -=------>',
        JSON.stringify(response),
      );
      setSubTaskData(response?.data);
    } catch (error) {
      console.log('Error fetching subtask data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingData = async () => {
    try {
      const res = await GetMeetingApiById(Data?.id);
      console.log('Meeting Data: -=-=--==>', JSON.stringify(res?.data));
      setMeetingData(res?.data);
    } catch (error) {
      console.log('Error fetching meeting data:', error);
    }
  };

  const fetchComments = async TaskId => {
    try {
      const res = await GetCommentApi({
        task_id: TaskId,
        page: 1,
        page_size: 50,
      });

      console.log('Comments Response: -=-=--==>', JSON.stringify(res));

      setCommentsData(res);
    } catch (error) {
      console.log('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    // if (Loading) {

    if (Data?.event_type === 'task') {
      FetchData();
    } else {
      fetchMeetingData();
    }

    // }
  }, [route?.params?.Data, IsFocused]);

  const notificationOptions = [
    'At time of event',
    '5 min before',
    '10 min before',
    '15 min before',
    '30 min before',
    '1 hour before',
    '1 day before',
  ];

  const handleNotificationSelect = option => {
    setSelectedNotification(option);
    setNotificationModalVisible(false);
  };

  const renderComment = ({ item }) => {
    if (item?.is_system_comment) {
      return (
        <View style={styles.systemCommentContainer}>
          <Text style={styles.systemCommentText}>{item.comment}</Text>
        </View>
      );
    }

    const parts = item.comment?.split(/(@\w+)/) || [];

    return (
      <View style={styles.commentContainer}>
        <Image
          source={
            item.created_by?.profile_picture
              ? { uri: item.created_by.profile_picture }
              : ProfileIcon
          }
          style={styles.avatar}
        />
        <View style={styles.commentTextContainer}>
          <Text style={styles.commenterName}>
            {(() => {
              const fullName = `${item.created_by?.first_name || ''} ${item.created_by?.last_name || ''
                }`.trim();
              return fullName !== '' ? fullName : item.created_by?.email || '';
            })()}
          </Text>
          <Text style={styles.commentText}>
            {parts.map((part, index) =>
              part.startsWith('@') ? (
                <Text key={index} style={styles.mentionText}>
                  {part}{' '}
                </Text>
              ) : (
                part
              ),
            )}
          </Text>
        </View>
      </View>
    );
  };

  const handleAddComment = async () => {
    if (!CommentInput.trim()) {
      console.log('Comment is empty.');
      toastRef.current.show({
        type: 'error',
        message: 'Please add a comment.',
      });
      return;
    }

    // console.log('Comment Input:', CommentInput);

    try {
      //   const commentData = {
      //     task_id: Data?.id,
      //     comment: CommentInput.trim(),
      //   };

      const formData = new FormData();
      formData.append('task_id', Data?.id);
      formData.append('comment', CommentInput.trim());

      //   console.log('Sending comment data:', commentData);

      const response = await PostCommentApi(formData);

      // console.log('Comment Response:', response);

      if (response?.success) {
        // console.log('Comment posted successfully:', response);
        setCommentInput('');
        // Refresh comments
        setLoading(true);

        toastRef.current.show({
          type: 'success',
          message: response?.message,
        });

        fetchComments(Data?.id);
      } else {
        const errorMessage = response?.message || 'Failed to post comment';
        console.log('Error in response:', response);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.log('Error adding comment:', error);
      //   Alert.alert('Error', error.message || 'Failed to post comment');
    }
  };
  const handleDeleteMeeting = async () => {
    const response = await DeleteMeetingApi(Data?.id);
    console.log('Delete Meeting Response:', response);
    if (response?.success) {
      setDeleteMeetingModalVisible(false);
      toastRef.current.show({
        type: 'success',
        message: response?.message,
      });
      setTimeout(() => {
        navigation.goBack();
      }, 400);
      // navigation.goBack();
    } else {
      toastRef.current.show({
        type: 'error',
        message: response?.message,
      });
    }
  };

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
          // If Google Meet app is not installed, open in browser
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

  return (
    <View style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <HeaderComponents
        Type={Data?.event_type === 'task' ? 'Task' : 'Meeting'}
        navigation={navigation}
        DataList={Data?.event_type === 'task' ? subTaskData : Data}
      />

      <View style={styles.container}>
        <View style={styles.orangeBarMain} />
        <View style={styles.contentArea}>
          {Data?.event_type === 'meeting' && (
            <View style={styles.meetingContainer}>
              <View style={styles.header}>
                <Text style={styles.meetingTitle}>{MeetingData?.title}</Text>
              </View>
              <View style={styles.infoRow}>
                <CalenderSvg width={18} height={18} color={DarkColor80} />
                <Text style={styles.infoText}>
                  {FormatDDMMYYYY(MeetingData?.start_date)}
                </Text>
              </View>
              <View style={[styles.infoRow, styles.spaceBetween]}>
                <View style={styles.iconTextContainer}>
                  <ClockIcon width={18} height={18} color={DarkColor80} />
                  <Text style={styles.infoText}>
                    {formatTimeToAMPM(MeetingData?.start_time)} -{' '}
                    {formatTimeToAMPM(MeetingData?.end_time)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.iconTextContainer}
                  onPress={() => setNotificationModalVisible(true)}>
                  <BellNotifications
                    width={18}
                    height={18}
                    color={DarkColor80}
                  />
                  <Text style={styles.infoText}>{selectedNotification}</Text>
                  <View style={{ marginLeft: 8 }}>
                    <DropDownSvgIcon
                      width={12}
                      height={12}
                      color={DarkColor80}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {MeetingData?.meeting_link && (
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => {
                      joinMeeting(MeetingData?.meeting_link);
                    }}>
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                )}

                {/* <TouchableOpacity
                  style={[
                    styles.joinButton,
                    {
                      marginLeft: 10,
                      borderWidth: 0.5,
                      borderColor: 'red',
                      backgroundColor: mainWhiteColor,
                    },
                  ]}
                  onPress={() => {
                    setDeleteMeetingModalVisible(true);
                  }}>
                  <Text
                    style={[
                      styles.joinButtonText,
                      {color: 'red', fontFamily: fonts.PoppinsMedium},
                    ]}>
                    Remove
                  </Text>
                </TouchableOpacity> */}

                {/* here code */}
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'enter',
                    alignItems: 'flex-end',
                    marginTop: 10,
                  }}>
                  <AttendeeList attendees={MeetingData?.participants} />
                </View>
              </View>
            </View>
          )}

          {Data?.event_type === 'task' && (
            <View style={styles.taskContainer}>
              <View style={styles.taskHeaderRow}>
                <Text style={styles.taskTitle}>{Data?.title}</Text>
                <TouchableOpacity>
                  {Data?.status === 'completed' ? (
                    <CompletedTaskIcon width={18} height={18} color="#9645FC" />
                  ) : (
                    <PendingDocumentSvg
                      width={18}
                      height={18}
                      color="#9645FC"
                    />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.taskSubtitle}>{Data?.description}</Text>
              <View style={styles.taskDetailsRow}>
                <View style={styles.detailItem}>
                  <ClockIcon width={20} height={20} color={DarkColor60} />
                  <Text style={styles.detailText}>
                    {formatTimeToAMPM(Data?.start_time)} -{' '}
                    {formatTimeToAMPM(Data?.end_time)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailItem}
                  onPress={() => setCommentStatus(!commentStatus)}>
                  <CommentIconSvg
                    width={20}
                    height={20}
                    color={commentStatus ? mainOrangeColor : DarkColor60}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: commentStatus ? mainOrangeColor : DarkColor60 },
                    ]}>
                    {Data?.comments_count}
                  </Text>
                </TouchableOpacity>
              </View>
              {route?.params?.Data?.status !== 'completed' && (
                <View style={styles.taskButtonRow}>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setDoneModalVisible(true)}>
                    <Text style={styles.doneButtonText}>Mark as Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rescheduleButton}
                    onPress={() => setRescheduleModalVisible(true)}>
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {Data?.event_type === 'task' && commentStatus && (
            <View>
              <Text style={styles.commentsHeaderTitle}>Comments</Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add your comment"
                    placeholderTextColor={DarkColor60}
                    multiline={true}
                    value={CommentInput}
                    onChangeText={setCommentInput}
                  />
                </View>
                <TouchableOpacity onPress={handleAddComment}>
                  <Image
                    source={ChatArrow}
                    style={{ width: 35, height: 35, resizeMode: 'contain' }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {Data?.event_type === 'task' && !commentStatus && (
            <EventSubTaskScreen
              navigation={navigation}
              SubTaskData={subTaskData?.sub_tasks}
              status={Data?.status}
            />
          )}

          {Data?.event_type === 'task' && commentStatus && (
            <FlatList
              style={{ flex: 1 }}
              data={
                CommentsData?.results?.length > 0
                  ? CommentsData?.results
                  : subTaskData?.comments
              }
              renderItem={renderComment}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          )}
        </View>
      </View>

      <ButtonModalScreen
        isDoneModalVisible={isDoneModalVisible}
        setDoneModalVisible={setDoneModalVisible}
        isRescheduleModalVisible={isRescheduleModalVisible}
        setRescheduleModalVisible={setRescheduleModalVisible}
        Data={Data}
        navigation={navigation}
        subTackStatus={false}
      />

      <ConfirmationModal
        isVisible={isDeleteMeetingModalVisible}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting?"
        onClose={() => setDeleteMeetingModalVisible(false)}
        onConfirm={handleDeleteMeeting}
      />

      <Toast ref={toastRef} />

      {/* Modal remains unchanged checking */}
      <Modal
        visible={isNotificationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setNotificationModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Notification</Text>
                <View style={styles.optionsContainer}>
                  {notificationOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedNotification === option &&
                        styles.selectedOption,
                      ]}
                      onPress={() => handleNotificationSelect(option)}>
                      <Text style={styles.optionText}>{option}</Text>
                      {selectedNotification === option && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default EventTypeScreen;

const styles = StyleSheet.create({
  // Main Layout
  container: { flex: 1, flexDirection: 'row', marginTop: 8 },
  orangeBarMain: {
    width: 6,
    backgroundColor: mainOrangeColor,
    borderRadius: 4,
    height: 150,
  }, // Height is removed to allow stretching
  contentArea: { flex: 1, paddingLeft: 10, paddingRight: 15 },

  // Meeting Styles
  meetingContainer: {
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: DarkColor20,
    paddingBottom: 20,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  meetingTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconTextContainer: { flexDirection: 'row', alignItems: 'center' },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor80,
    marginLeft: 10,
  },
  spaceBetween: { justifyContent: 'space-between' },
  joinButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 5,
    width: '35%',
  },
  joinButtonText: {
    color: mainWhiteColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },

  // Task Styles
  taskContainer: {
    paddingHorizontal: 5,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 20,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: { fontSize: 16, fontFamily: fonts.PoppinsMedium, color: DarkColor },
  taskSubtitle: {
    fontSize: 12,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 4,
    marginBottom: 10,
  },
  taskDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor80,
  },
  taskButtonRow: { flexDirection: 'row', alignItems: 'center' },
  doneButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
  },
  doneButtonText: {
    color: mainWhiteColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  rescheduleButton: {
    borderColor: mainOrangeColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 16,
    flex: 1,
  },
  rescheduleButtonText: {
    color: mainOrangeColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },

  // Comment Styles
  commentsHeaderTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    height: 90,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 6,
    padding: 15,
    textAlignVertical: 'top',
    paddingVertical: 5,
    paddingTop: 10,
    fontSize: 12,
    // fontFamily: fonts.Regular,
    color: DarkColor,
    marginBottom: 5,
    fontFamily: fonts.PoppinsRegular,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: DarkColor20,
  },
  commentTextContainer: { flex: 1 },
  commenterName: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  commentText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    lineHeight: 22,
  },
  mentionText: { fontFamily: fonts.Bold, color: DarkColor },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: { width: '100%' },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  selectedOption: { backgroundColor: 'rgba(255, 152, 0, 0.1)' },
  selectedIndicator: {
    width: 6,
    height: 12,
    borderColor: mainOrangeColor,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  systemCommentContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  systemCommentText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
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
});
