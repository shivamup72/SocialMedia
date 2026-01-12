import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor80,
  DarkColor60,
} from '../../../../utils/style/fonts';
import HeaderComponents from '../../../../components/HeaderComponents/HeaderComponents';
import TaskDetails from '../TaskComponents/TaskDetails';
import {
  GetConstantApi,
  PostCreateMeetingApi,
  PatchMeetingApi,
  GetMeetingApiById,
} from '../../../../Api/config/TimelyApi';
import { GetUserListingApi } from '../../../../Api/config/HomeApi';
import Toast from '../../../../Api/context/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommonDateTimePicker from '../../../../components/CommonDateTimePicker/CommonDateTimePicker';
import { RfH, RfW } from '../../../../utils/helper';

const MeetingScreen = ({ navigation, route }) => {
  const { isEdit, EditData } = route.params || {};
  const [repeat_constants, setRepeatConstants] = useState([]);
  const [priority_constants, setPriorityConstants] = useState([]);
  const [UserList, setUserList] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const ArrowLogo = require('../../../../assets/LoginAssets/png/ArrowLogo.png');
  const toastRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerConfig, setDatePickerConfig] = useState({
    mode: 'date',
    field: 'startDate',
  });

  const [task, setTask] = useState(() => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    return {
      id: `meeting-${Date.now()}`,
      title: '',
      meetingLink: '',
      details: '',
      isAllDay: true,
      startDate: startDate,
      endDate: endDate,
      repeat: "Don't repeat",
      priority: null,
      assignees: [],
    };
  });

  const FetchMeetingData = async userListPayload => {
    try {
      const res = await GetMeetingApiById(EditData?.id, {});
      const meetingDetails = res?.data;
      console.log(
        'res  Meeting Api =----==>',
        JSON.stringify(meetingDetails),
        '\n',
      );
      if (meetingDetails) {
        const participants =
          meetingDetails.participants
            ?.map(p => userListPayload.find(u => u.id === p.id))
            .filter(Boolean) || [];

        setTask({
          id: meetingDetails.id,
          title: meetingDetails.title || '',
          meetingLink: meetingDetails.meeting_link || '',
          details: meetingDetails.description || '',
          isAllDay: meetingDetails.all_day,
          startDate: meetingDetails?.start_date,
          endDate: meetingDetails?.end_date,
          repeat: meetingDetails.repeat_type || "Don't repeat",
          priority: meetingDetails.priority || null,
          assignees: participants,
        });
      }
    } catch (err) {
      console.log('Error in FetchMeetingData --=---->', err);
    }
  };

  useEffect(() => {
    const FetchInitialData = async () => {
      try {
        const constantRes = await GetConstantApi({});
        setRepeatConstants(constantRes?.data?.repeat_constants);
        setPriorityConstants(constantRes?.data?.priority_constants);

        const userRes = await GetUserListingApi({});
        const fetchedUserList = userRes?.results || [];
        setUserList(fetchedUserList);

        if (isEdit) {
          await FetchMeetingData(fetchedUserList);
        }
      } catch (err) {
        console.log('Error in FetchInitialData --=---->', err);
      }
    };
    FetchInitialData();
  }, []);

  const handleUpdateTask = (taskId, updates) => {
    setTask(prev => ({ ...prev, ...updates }));
  };

  const showDatepicker = (field, mode) => {
    setDatePickerConfig({ field, mode });
    setShowDatePicker(true);
  };

  const onDateChange = selectedDate => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(task[datePickerConfig.field]);
      const newDate = new Date(selectedDate);
      if (datePickerConfig.mode === 'date') {
        currentDate.setFullYear(newDate.getFullYear());
        currentDate.setMonth(newDate.getMonth());
        currentDate.setDate(newDate.getDate());
      } else {
        currentDate.setHours(newDate.getHours());
        currentDate.setMinutes(newDate.getMinutes());
      }
      handleUpdateTask(task.id, {
        [datePickerConfig.field]: currentDate.toISOString(),
      });
    }
  };

  const validateMeetingData = () => {
    const requiredFields = [
      { field: 'title', label: 'Title' },
      { field: 'details', label: 'Description' },
      { field: 'meetingLink', label: 'Meeting Link' },
      { field: 'startDate', label: 'Start Date' },
      { field: 'endDate', label: 'End Date' },
      { field: 'repeat', label: 'Repeat Type' },
      { field: 'priority', label: 'Priority' },
    ];
    console.log('form validation check -=-=-=-=---->', requiredFields[0].label);

    if (task.title.length > 255) {
      Alert.alert(
        'Title Error',
        'Ensure this field has no more than 255 characters.',
      );
      return false;
    }
    // Check required fields
    const missingFields = requiredFields.filter(({ field, label }) => {
      const value = task?.[field];
      if (value instanceof Date) return false; // Skip date fields as they're already validated
      return !value || (typeof value === 'string' && !value.trim());
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.label).join(', ');
      Alert.alert(
        'Missing Information',
        `Please fill in the following required fields: ${fieldNames}`,
      );
      return false;
    }

    // Validate date range
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);

    if (endDate < startDate) {
      Alert.alert('Invalid Date Range', 'End date cannot be before start date');
      return false;
    }

    if (!task.isAllDay) {
      const startTime = new Date(task.startDate).getTime();
      const endTime = new Date(task.endDate).getTime();

      if (endTime <= startTime) {
        Alert.alert('Invalid Time Range', 'End time must be after start time');
        return false;
      }
    }

    if (task?.assignees?.length === 0) {
      Alert.alert('No Participants', 'Please add at least one participant');
      return false;
    }

    if (task?.repeat === `Don't repeat`) {
      Alert.alert('Repeat Type', 'Please select a repeat type');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 4000);
    if (!validateMeetingData()) {
      return;
    }

    try {
      const formatDateForApi = dateString =>
        new Date(dateString).toISOString().split('T')[0];
      const formatTimeForApi = dateString =>
        new Date(dateString).toTimeString().split(' ')[0];

      const meetingData = {
        title: task.title.trim(),
        description: task.details.trim(),
        meeting_link: task.meetingLink.trim(),
        start_date: formatDateForApi(task.startDate),
        end_date: formatDateForApi(task.endDate),
        all_day: task.isAllDay,
        ...(!task.isAllDay && {
          start_time: formatTimeForApi(task.startDate),
          end_time: formatTimeForApi(task.endDate),
        }),
        repeat_type: task.repeat,
        priority: task.priority,
        participants: task.assignees?.map(user => user.id) || [],
      };

      console.log('Meeting Data for API:', meetingData?.title.length);

      if (isEdit) {
        await handleUpdateMeeting(meetingData);
      } else {
        await handleCreateMeeting(meetingData);
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Error', 'An error occurred while saving the meeting');
    }
  };

  const handleCreateMeeting = async meetingData => {
    try {
      const response = await PostCreateMeetingApi(meetingData);
      if (response?.success) {
        toastRef.current.show({ type: 'success', message: 'Meeting created!' });
        setTimeout(() => navigation.goBack(), 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Creation failed.',
        });
      }
    } catch (err) {
      console.log('Error in handleCreateMeeting:', err);
    }
  };

  const handleUpdateMeeting = async meetingData => {
    try {
      const response = await PatchMeetingApi(EditData.id, meetingData);
      if (response?.success) {
        toastRef.current.show({ type: 'success', message: 'Meeting updated!' });
        setTimeout(() => navigation.goBack(), 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Update failed.',
        });
      }
    } catch (err) {
      console.log('Error in handleUpdateMeeting:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <HeaderComponents
        Type={isEdit ? 'Edit Meeting' : 'Add Meeting'}
        navigation={navigation}
      />
      <View style={styles.container}>
        <View style={styles.orangeBarMain} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.mainContent}>
            <View style={styles.taskTitleContainer}>
              <TextInput
                allowFontScaling={false}
                placeholder="What's this meeting about?"
                placeholderTextColor={DarkColor60}
                style={styles.titleInput}
                value={task.title}
                onChangeText={text => handleUpdateTask(task.id, { title: text })}
              />
            </View>

            <View style={styles.detailsContainer}>
              <TaskDetails
                task={task}
                taskId={task.id}
                onUpdate={handleUpdateTask}
                showDatepicker={showDatepicker}
                Type="meeting"
                repeatConstants={repeat_constants}
                priorityConstants={priority_constants}
                UserList={UserList}
                isSubtask={false}
              />
            </View>

            {showDatePicker && (
              <CommonDateTimePicker
                isVisible={showDatePicker}
                onConfirm={onDateChange}
                onCancel={() => setShowDatePicker(false)}
                value={new Date(task[datePickerConfig.field])}
                mode={datePickerConfig.mode}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* <View style={styles.createButtonContainer}>
        <TouchableOpacity onPress={handleSave}>
          <Image source={ArrowLogo} style={styles.arrowLogo} />
        </TouchableOpacity>
      </View> */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, isButtonDisabled && { opacity: 0.8 }]} onPress={handleSave} disabled={isButtonDisabled}>
          <Text style={styles.saveButtonText}>
            {isEdit ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
};

export default MeetingScreen;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: mainWhiteColor },
  container: { flex: 1, flexDirection: 'row', marginTop: 8 },
  orangeBarMain: {
    width: 6,
    backgroundColor: mainOrangeColor,
    borderRadius: 4,
    height: 140,
  },
  scrollView: { flex: 1 },
  mainContent: { flex: 1, paddingRight: 15, paddingBottom: 120 },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 0,
    borderColor: '#e0e0e0',
  },
  titleInput: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    flex: 1,
    marginLeft: 5,
  },
  detailsContainer: {
    marginHorizontal: 5,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    padding: 10,
    backgroundColor: mainWhiteColor,
  },
  arrowLogo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  bottomButtonContainer: {
    // position: 'absolute',
    bottom: RfH(20),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: RfH(10),
    paddingHorizontal: RfW(20),
    backgroundColor: mainWhiteColor,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: mainOrangeColor,
    borderRadius: 8,
    paddingVertical: RfH(8),
    width: '42%',
    paddingHorizontal: RfW(30),
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color: mainOrangeColor,
    fontSize: RfH(16),
    fontFamily: fonts.PoppinsMedium,
  },
  saveButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
    paddingVertical: RfH(12),
    width: '42%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: mainWhiteColor,
    fontSize: RfH(16),
    fontFamily: fonts.PoppinsMedium,
  },
});
