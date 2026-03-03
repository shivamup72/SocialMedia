import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
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
  DarkColor50,
  DarkColor20,
  DarkCOlor30,
} from '../../../../utils/style/fonts';
import HeaderComponents from '../../../../components/HeaderComponents/HeaderComponents';
import SubStackicon from '../../../../assets/svg/SubStackIcon';
import DropUpSvg from '../../../../assets/svg/DropUpSvg';
import DropDownSvgIcon from '../../../../assets/svg/DropDownSvg';
import LightDeleteSvg from '../../../../assets/svg/LightDeleteSvg';
import {
  GetConstantApi,
  PostCreateTaskApi,
  PatchTaskApi,
} from '../../../../Api/config/TimelyApi';
import { GetUserListingApi } from '../../../../Api/config/HomeApi';
import Toast from '../../../../Api/context/Toast';
import TaskDetails from './TaskDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommonDateTimePicker from '../../../../components/CommonDateTimePicker/CommonDateTimePicker';
import SubTaskArrow from '../../../../assets/svg/SubTaskArrow';
import { RfH, RfW } from '../../../../utils/helper';
import CustomText from '../../../../utils/CustomText';

const SubtaskCard = ({
  subtask,
  onDelete,
  onAddSubtask,
  onUpdate,
  showDatepicker,
  repeatConstants,
  priorityConstants,
  UserList,
}) => {
  return (
    <View style={styles.subtaskContainer}>
      <SubTaskArrow
        width={18}
        height={18}
        color={DarkColor60}
        style={styles.subtaskArrow}
      />
      <View style={styles.subtaskContent}>
        <View style={styles.subtaskHeader}>
          <TextInput
            allowFontScaling={false}
            placeholder="Add Title"
            value={subtask.title}
            onChangeText={text => onUpdate(subtask.id, { title: text })}
            placeholderTextColor={DarkColor60}
            style={styles.subtaskTitleInput}
            placeholderTextStyle={{ fontStyle: fonts.italic }}
          />
          <View style={styles.subtaskControls}>
            <TouchableOpacity
              onPress={() => onDelete(subtask.id)}
              style={{ paddingLeft: 15 }}>
              <LightDeleteSvg width={12} height={16} color={'#F31D1DCC'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onUpdate(subtask.id, { isExpanded: !subtask.isExpanded })
              }
              style={{ paddingLeft: 15 }}>
              {subtask.isExpanded ? (
                <DropUpSvg width={15} height={15} color={DarkColor80} />
              ) : (
                <DropDownSvgIcon width={15} height={15} color={DarkColor80} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {subtask.isExpanded && (
          <>
            <View
              style={[styles.separator, { marginVertical: 0, marginTop: 5 }]}
            />
            <TaskDetails
              task={subtask}
              taskId={subtask.id}
              onUpdate={onUpdate}
              showDatepicker={showDatepicker}
              isSubtask={true}
              repeatConstants={repeatConstants}
              priorityConstants={priorityConstants}
              UserList={UserList}
            />
          </>
        )}
      </View>
    </View>
  );
};

const TaskScreen = ({ navigation, route }) => {
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
  const { EditData, isEdit } = route.params || {};
  const [repeat_constants, setRepeatConstants] = useState([]);
  const [priority_constants, setPriorityConstants] = useState([]);
  const [UserList, setUserList] = useState([]);
  const toastRef = useRef(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [task, setTask] = useState(() => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 60000); // Add 30 minutes

    return {
      id: 'main_task',
      title: '',
      details: '',
      isAllDay: true,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      repeat: "Don't repeat",
      priority: null,
      assignees: [],
      startTime: '',
      endTime: '',
      subtasks: [],
    };
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerConfig, setDatePickerConfig] = useState({
    mode: 'date',
    field: 'startDate',
    taskId: null,
  });
  const [DropDownVisible, setDropDownVisible] = useState(true);

  // Helper to combine date and time strings into a valid ISO string
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return new Date().toISOString();
    const time = timeStr || '00:00:00';
    return new Date(`${dateStr}T${time}`).toISOString();
  };

  // Transforms the API data structure to the component's state structure
  const transformApiTaskToState = (apiTask, allUsers) => {
    const assignees =
      apiTask.assignments
        ?.map(assignment =>
          allUsers.find(user => user.id === assignment.assigned_to.id),
        )
        .filter(Boolean) || [];

    const subtasks =
      apiTask.sub_tasks?.map(sub => transformApiTaskToState(sub, allUsers)) ||
      [];

    return {
      id: apiTask.id,
      title: apiTask.title || '',
      details: apiTask.description || '',
      isAllDay: apiTask.all_day,
      startDate: combineDateTime(apiTask.start_date, apiTask.start_time),
      endDate: combineDateTime(apiTask.end_date, apiTask.end_time),
      startTime: apiTask.start_time || '',
      endTime: apiTask.end_time || '',
      repeat: apiTask.repeat_type || "Don't repeat",
      priority: apiTask.priority || null,
      assignees: assignees,
      subtasks: subtasks,
      isExpanded: true,
    };
  };

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        const res = await GetConstantApi({});
        setRepeatConstants(res?.data?.repeat_constants);
        setPriorityConstants(res?.data?.priority_constants);

        const res2 = await GetUserListingApi({ page: 1, page_size: 100 });
        const userList = res2?.results || [];
        setUserList(userList);

        if (isEdit && EditData) {
          const transformedTask = transformApiTaskToState(EditData, userList);
          setTask(transformedTask);
        }
      } catch (err) {
        console.log('Error initializing screen:', err);
      }
    };

    initializeScreen();
  }, [isEdit, EditData]);

  // All your handler functions (handleUpdateTask, handleAddSubtask, handleDeleteSubtask, etc.)
  // remain the same as they correctly handle the nested state.
  const createNewTask = () => ({
    id: `new_${Date.now()}`, // Give new tasks a temporary unique ID
    title: '',
    details: '',
    isAllDay: true,
    isExpanded: true,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    startTime: '',
    endTime: '',
    repeat: "Don't repeat",
    priority: null,
    assignees: [],
    subtasks: [],
  });

  const handleUpdateTask = (taskId, updates) => {
    const updateRecursively = nodes =>
      nodes.map(node => {
        if (node.id === taskId) {
          return { ...node, ...updates };
        }
        if (node.subtasks) {
          return { ...node, subtasks: updateRecursively(node.subtasks) };
        }
        return node;
      });

    setTask(currentTask => {
      if (taskId === 'main_task' || taskId === currentTask.id) {
        return { ...currentTask, ...updates };
      }
      return {
        ...currentTask,
        subtasks: updateRecursively(currentTask.subtasks),
      };
    });
  };

  const handleAddSubtask = (parentId = null) => {
    const newSubtask = createNewTask();
    if (parentId === null || parentId === 'main_task' || parentId === task.id) {
      setTask(prev => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), newSubtask],
      }));
    } else {
      console.log(
        'Attempted to add subtask to a nested subtask. This is not supported by the UI.',
      );
    }
  };

  const handleDeleteSubtask = id => {
    const deleteRecursively = nodes => nodes.filter(n => n.id !== id);
    setTask(prev => ({
      ...prev,
      subtasks: deleteRecursively(prev.subtasks),
    }));
  };

  const showDatepicker = (field, mode, taskId) => {
    setDatePickerConfig({ field, mode, taskId });
    setShowDatePicker(true);
  };

  const onDateChange = selectedDate => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updates = {
        [datePickerConfig.field]: selectedDate.toISOString(),
      };

      handleUpdateTask(datePickerConfig.taskId, updates);
    }
  };

  const findTaskById = (rootTask, id) => {
    if (id === 'main_task' || rootTask.id === id) return rootTask;
    const findRecursively = nodes => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.subtasks) {
          const found = findRecursively(node.subtasks);
          if (found) return found;
        }
      }
      return null;
    };
    return findRecursively(rootTask.subtasks || []);
  };

  const formatDateForApi = dateString =>
    new Date(dateString).toISOString().split('T')[0];
  const formatTimeForApi = dateString =>
    new Date(dateString).toTimeString().split(' ')[0];

  const formatSubtasksForApi = subtasks => {
    if (!subtasks || subtasks.length === 0) return [];
    return subtasks.map(subtask => ({
      ...(typeof subtask.id === 'number' && { id: subtask.id }),
      title: subtask.title,
      description: subtask.details,
      start_date: formatDateForApi(subtask.startDate),
      end_date: formatDateForApi(subtask.endDate),
      all_day: subtask.isAllDay,
      priority: subtask.priority,
      assigned_to: subtask.assignees.map(user => user?.id).filter(Boolean),
    }));
  };

  const validateSubtask = (subtask, index) => {
    if (!subtask.title || subtask.title.trim() === '') {
      Alert.alert(
        'Validation Error',
        `Subtask #${index + 1}: Title is required`,
      );
      return false;
    }

    if (subtask?.repeat === `Don't repeat`) {
      Alert.alert('Repeat Type', 'Please select a repeat type');
      return false;
    }

    if (!subtask?.priority || subtask?.priority?.trim() === '') {
      Alert.alert('Error', 'Task priority is required');
      return false;
    }

    if (!subtask?.description || subtask?.description.trim() === '') {
      Alert.alert('Error', 'Task description is required');
      return false;
    }

    if (subtask?.assigned_to?.length === 0) {
      Alert.alert('No Participants', 'Please add at least one participant');
      return false;
    }

    if (!subtask.start_date) {
      Alert.alert(
        'Validation Error',
        `Subtask #${index + 1}: Start date is required`,
      );
      return false;
    }

    if (!subtask.end_date) {
      Alert.alert(
        'Validation Error',
        `Subtask #${index + 1}: End date is required`,
      );
      return false;
    }

    const startDate = new Date(subtask.start_date);
    const endDate = new Date(subtask.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Alert.alert(
        'Validation Error',
        `Subtask #${index + 1}: Invalid date format`,
      );
      return false;
    }

    if (endDate < startDate) {
      Alert.alert(
        'Validation Error',
        `Subtask #${index + 1}: End date cannot be before start date`,
      );
      return false;
    }

    return true;
  };

  const validateTaskData = data => {
    console.log('validateTaskData -=-=-=-=-=------->', data, '\n', '\n');
    if (!data.title || data.title.trim() === '') {
      Alert.alert('Error', 'Task title is required');
      return false;
    }

    if (data?.repeat_type === `Don't repeat`) {
      Alert.alert('Repeat Type', 'Please select a repeat type');
      return false;
    }

    if (!data?.priority || data?.priority?.trim() === '') {
      Alert.alert('Error', 'Task priority is required');
      return false;
    }

    if (!data.description || data.description.trim() === '') {
      Alert.alert('Error', 'Task description is required');
      return false;
    }

    if (data?.assigned_to?.length === 0) {
      Alert.alert('No Participants', 'Please add at least one participant');
      return false;
    }

    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Alert.alert('Error', 'Invalid date format');
      return false;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date cannot be before start date');
      return false;
    }

    // Validate subtasks if any exist
    if (data.sub_tasks && data.sub_tasks.length > 0) {
      for (let i = 0; i < data.sub_tasks.length; i++) {
        if (!validateSubtask(data.sub_tasks[i], i)) {
          return false;
        }
      }
    }

    // Validate time if not all day
    if (!data.all_day) {
      if (!data.start_time || !data.end_time) {
        Alert.alert(
          'Error',
          'Start time and end time are required for non-all-day tasks',
        );
        return false;
      }

      // If it's the same day, check if end time is after start time
      if (data.start_date === data.end_date) {
        const startTime = new Date(`${data.start_date}T${data.start_time}`);
        const endTime = new Date(`${data.end_date}T${data.end_time}`);

        if (endTime <= startTime) {
          Alert.alert('Error', 'End time must be after start time');
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveTask = async () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 3000);
    try {
      const taskData = {
        title: task.title,
        description: task.details,
        start_date: formatDateForApi(task.startDate),
        end_date: formatDateForApi(task.endDate),
        all_day: task.isAllDay,
        start_time: !task.isAllDay ? formatTimeForApi(task.startDate) : null,
        end_time: !task.isAllDay ? formatTimeForApi(task.endDate) : null,
        repeat_type: task.repeat,
        priority: task.priority?.toLowerCase(),
        assigned_to: task.assignees?.map(user => user.id) || [],
        sub_tasks: formatSubtasksForApi(task.subtasks),
      };

      // console.log('taskData -=-=-=-=-=-=-=-=-=->', taskData, '\n', '\n');

      if (!validateTaskData(taskData)) {
        return;
      }

      if (isEdit) {
        await handleUpdateTaskApi(taskData);
      } else {
        await handleCreateTaskApi(taskData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert(
        'Error',
        'Failed to save task. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true },
      );
    }
  };

  const handleCreateTaskApi = async taskData => {
    try {
      const response = await PostCreateTaskApi(taskData);
      if (response?.success) {
        toastRef.current.show({
          type: 'success',
          message: response?.message || 'Task created!',
        });
        setTimeout(() => navigation.goBack(), 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Creation failed.',
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTaskApi = async taskData => {
    // console.log('Task data for update:', '\n', JSON.stringify(taskData), '\n');
    try {
      const response = await PatchTaskApi(EditData.id, taskData);
      if (response?.success) {
        toastRef.current.show({
          type: 'success',
          message: response?.message || 'Task updated!',
        });
        setTimeout(() => navigation.goBack(), 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Update failed.',
        });
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <HeaderComponents
        Type={isEdit ? 'Edit Task' : 'Add Task'}
        navigation={navigation}
      />
      <View style={styles.container}>
        <View style={styles.orangeBarMain} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.mainContent}>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View
                style={[
                  styles.taskTitleContainer,
                  { borderBottomWidth: DropDownVisible ? 0.5 : 0 },
                ]}>
                <TextInput
                  allowFontScaling={false}
                  placeholder="What's this task about ?"
                  placeholderTextColor={DarkCOlor30}
                  style={styles.titleInput}
                  value={task.title}
                  onChangeText={text =>
                    handleUpdateTask(task.id, { title: text })
                  }
                />
                <TouchableOpacity
                  style={styles.subtaskButton}
                  onPress={() => handleAddSubtask(task.id)}>
                  <SubStackicon
                    width="12"
                    height="12"
                    color={
                      task.subtasks.length > 0 ? mainOrangeColor : DarkColor50
                    }
                  />
                  <CustomText
                    style={[
                      styles.subtaskButtonText,
                      {
                        color:
                          task.subtasks.length > 0
                            ? mainOrangeColor
                            : DarkColor50,
                      },
                    ]}>
                    Add Subtask
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDropDownVisible(!DropDownVisible)}>
                  {DropDownVisible ? (
                    <DropUpSvg width="14" height="14" color={DarkColor} />
                  ) : (
                    <DropDownSvgIcon width="14" height="14" color={DarkColor} />
                  )}
                </TouchableOpacity>
              </View>

              {DropDownVisible && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderColor: DarkColor20,
                    borderRadius: 4,
                    padding: 5,
                  }}>
                  <TaskDetails
                    task={task}
                    taskId={task.id}
                    onUpdate={handleUpdateTask}
                    showDatepicker={showDatepicker}
                    repeatConstants={repeat_constants}
                    priorityConstants={priority_constants}
                    UserList={UserList}
                  />
                </View>
              )}
            </View>

            {task?.subtasks?.map(t => (
              <SubtaskCard
                key={t.id}
                subtask={t}
                onDelete={handleDeleteSubtask}
                onAddSubtask={handleAddSubtask}
                onUpdate={handleUpdateTask}
                showDatepicker={showDatepicker}
                repeatConstants={repeat_constants}
                priorityConstants={priority_constants}
                UserList={UserList}
              />
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, isButtonDisabled && { opacity: 0.8 }]} onPress={handleSaveTask} disabled={isButtonDisabled}>
          <CustomText style={styles.saveButtonText}>
            {isEdit ? 'Update' : 'Save'}
          </CustomText>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <CommonDateTimePicker
          isVisible={showDatePicker}
          onConfirm={onDateChange}
          onCancel={() => setShowDatePicker(false)}
          value={
            new Date(
              findTaskById(task, datePickerConfig.taskId)?.[
              datePickerConfig.field
              ] || new Date(),
            )
          }
          mode={datePickerConfig.mode}
          minimumDate={new Date()}
        />
      )}
      <Toast ref={toastRef} />
    </SafeAreaView>
  );
};

export default TaskScreen;

// Your existing styles remain here
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: mainWhiteColor },
  container: { flex: 1, flexDirection: 'row', marginTop: 8 },
  orangeBarMain: {
    width: 6,
    backgroundColor: mainOrangeColor,
    borderRadius: 4,
    height: 150,
  },
  scrollView: { flex: 1 },
  mainContent: { flex: 1, paddingRight: 15, paddingBottom: 120 },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 10,
    borderColor: '#e0e0e0',
  },
  titleInput: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    flex: 1,
  },
  subtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  subtaskButtonText: {
    fontSize: 10,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor50,
    marginLeft: 6,
  },
  detailsInput: {
    fontSize: 13,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    minHeight: 40,
    textAlignVertical: 'top',
    paddingLeft: 10,
    height: 80,
  },
  separator: { height: 0.5, backgroundColor: '#26323826', marginVertical: 5 },
  subtaskContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'flex-start',
    marginLeft: 8,
  },
  subtaskArrow: { marginRight: 5, marginTop: 15 },
  subtaskContent: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    padding: 10,
    paddingHorizontal: 0,
    paddingBottom: 3,
    marginLeft: 5,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  subtaskTitleInput: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    flex: 1,
    padding: 0,
  },
  subtaskControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  controlButton: {
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  detailsSection: { paddingHorizontal: 10, paddingBottom: 10 },
  subtaskDetailsInput: {
    fontSize: 13,
    fontFamily: fonts.PoppinsLight,
    color: DarkColor60,
    marginTop: 5,
    minHeight: 30,
    paddingStart: 5,
    height: 70,
    textAlignVertical: 'top',
  },
  allDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 0,
  },
  allDayLeft: { flexDirection: 'row', alignItems: 'center' },
  allDayText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor80,
    marginLeft: 7,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginHorizontal: 25,
  },
  dateBlock: { alignItems: 'center' },
  dateText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
  },
  timeText: { fontSize: 12, fontFamily: fonts.PoppinsMedium, color: DarkColor80 },
  arrow: { fontSize: 20, color: DarkColor60, marginHorizontal: 10 },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '20%',
  },
  addAnotherButton: { alignSelf: 'flex-start', marginTop: 20 },
  nestedSubtasksContainer: { marginTop: 10, paddingLeft: 10 },
  bottomButtonContainer: {
    position: 'absolute',
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
  actionText: { fontSize: RfH(12), color: DarkColor, marginHorizontal: 4 },
  avatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: mainWhiteColor,
  },
  avatarOverlap: { marginLeft: -12 },
});
