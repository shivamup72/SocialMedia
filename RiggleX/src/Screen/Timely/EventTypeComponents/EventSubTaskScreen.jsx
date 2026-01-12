import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  fonts,
  DarkColor,
  DarkColor60,
  DarkColor80,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor20,
} from '../../../utils/style/fonts';
import DropUpSvg from '../../../assets/svg/DropUpSvg';
import DropDownSvg from '../../../assets/svg/DropDownSvg';
import SubTaskIconSvg from '../../../assets/svg/SubTaskIconSvg';
import CommentIconSvg from '../../../assets/svg/iconamoon_comment_light';
import {
  GetTaskAllData,
  PostCommentApi,
  GetCommentApi,
} from '../../../Api/config/TimelyApi';
import ButtonModalScreen from './ButtonModalScreen';

const ProfileIcon = require('../../../assets/Png/ProfileIcon2.png');

const DropdownSize = 14;

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
          {parts?.map((part, index) =>
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

const SubTaskItem = ({
  item,
  onToggleNested,
  onOpenComments,
  // setRescheduleModalVisible,
  // setDoneModalVisible,
  onOpenMarkAsDone,
  onOpenReschedule,
  status,
}) => (
  <View style={styles.subTaskWrapper}>
    <View style={styles.subTaskContainer}>
      <View style={styles.subTaskIcon}>
        <SubTaskIconSvg width={16} height={16} color={DarkColor80} />
      </View>
      <View style={styles.subTaskDetails}>
        <View style={styles.subTaskHeader}>
          <Text style={styles.subTaskTitle}>{item.title}</Text>
          <View style={styles.subTaskIconsRight}>
            <TouchableOpacity
              style={styles.commentIconContainer}
              onPress={() => onOpenComments(item.comments, item.id)}>
              <CommentIconSvg width={16} height={16} color={DarkColor60} />
              <Text style={styles.subTaskCommentCount}>
                {item?.comments?.length || 0}
              </Text>
            </TouchableOpacity>
            {item.hasNestedTasks && (
              <TouchableOpacity
                onPress={() => onToggleNested(item.id)}
                style={styles.dropdownIcon}>
                {item.isNestedExpanded ? (
                  <DropUpSvg
                    width={DropdownSize}
                    height={DropdownSize}
                    color={DarkColor80}
                  />
                ) : (
                  <DropDownSvg
                    width={DropdownSize}
                    height={DropdownSize}
                    color={DarkColor80}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.subTaskDescription}>{item.description}</Text>
        {status !== 'completed' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                onOpenMarkAsDone(item);
              }}>
              <Text style={styles.doneButtonText}>Mark as Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rescheduleButton}
              onPress={() => {
                onOpenReschedule(item);
              }}>
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
    {item.isNestedExpanded &&
      item?.nestedTasks?.map(nestedItem => (
        <SubTaskItem
          key={nestedItem.id}
          item={{ ...nestedItem, isNestedExpanded: false }}
          onToggleNested={() => { }}
          onOpenComments={onOpenComments}
          // setRescheduleModalVisible={setRescheduleModalVisible}
          // setDoneModalVisible={setDoneModalVisible}
          onOpenMarkAsDone={onOpenMarkAsDone}
          onOpenReschedule={onOpenReschedule}
          status={status}
        />
      ))}
  </View>
);

const TaskItem = ({
  task,
  onToggle,
  onToggleNested,
  onOpenComments,
  // setDoneModalVisible,
  // setRescheduleModalVisible,
  onOpenMarkAsDone,
  onOpenReschedule,
  status,
}) => {
  const subTaskCount = task?.subtasks?.length;
  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        style={styles.taskHeader}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        {task.isExpanded ? (
          <DropUpSvg
            width={DropdownSize}
            height={DropdownSize}
            color={DarkColor80}
          />
        ) : (
          <DropDownSvg
            width={DropdownSize}
            height={DropdownSize}
            color={DarkColor80}
          />
        )}
      </TouchableOpacity>

      {task.isExpanded && (
        <View style={styles.subTasksList}>
          <Text style={styles.subTaskHeaderText}>
            Sub tasks ({subTaskCount})
          </Text>
          {task?.subtasks?.map(subItem => (
            <SubTaskItem
              key={subItem.id}
              item={subItem}
              onToggleNested={subTaskId => onToggleNested(task.id, subTaskId)}
              onOpenComments={onOpenComments}
              // setRescheduleModalVisible={setRescheduleModalVisible}
              // setDoneModalVisible={setDoneModalVisible}
              onOpenMarkAsDone={onOpenMarkAsDone}
              onOpenReschedule={onOpenReschedule}
              status={status}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const EventTaskScreen = ({ navigation, SubTaskData, status }) => {
  const [tasks, setTasks] = useState([]);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedTaskComments, setSelectedTaskComments] = useState([]);
  const [CommentInput, setCommentInput] = useState('');
  const [CommentsData, setCommentsData] = useState([]);
  const [SelectedTaskId, setSelectedTaskId] = useState(null);
  const [isDoneModalVisible, setDoneModalVisible] = useState(false);
  const [isRescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const ChatArrow = require('../../../assets/Png/ChatArrowtosms.png');
  const [Data, setData] = useState([]);

  useEffect(() => {
    const parentTask = {
      id: 'parent-task-1',
      title: 'Task Group',
      isExpanded: true,
      subtasks: SubTaskData?.map(subtask => ({
        ...subtask,
        hasNestedTasks: !!subtask.sub_tasks && subtask?.sub_tasks?.length > 0,
        isNestedExpanded: false,
      })),
    };
    setTasks([parentTask]);
  }, [SubTaskData]);

  const fetchComments = async TaskId => {
    try {
      const res = await GetCommentApi({
        task_id: TaskId,
        page: 1,
        page_size: 50,
      });

      console.log('Comments Response: -=-=--==>', JSON.stringify(res));

      // setCommentsData(res);
      setSelectedTaskComments(res?.results);
      setCommentModalVisible(true);
    } catch (error) {
      console.log('Error fetching comments:', error);
    }
  };

  const handleOpenComments = (comments, id) => {
    console.log('Opening Comments for Task:', comments, id, '\n', '\n');
    fetchComments(id);
    setSelectedTaskId(id);
  };

  const handleCloseComments = () => {
    setCommentModalVisible(false);
    setSelectedTaskComments([]);
  };

  const handleToggleTask = taskId => {
    setTasks(prevTasks =>
      prevTasks?.map(task =>
        task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task,
      ),
    );
  };

  const handleToggleNestedSubTask = (taskId, subTaskId) => {
    setTasks(prevTasks =>
      prevTasks?.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask => {
              if (subtask.id === subTaskId) {
                return {
                  ...subtask,
                  isNestedExpanded: !subtask.isNestedExpanded,
                };
              }
              return subtask;
            }),
          };
        }
        return task;
      }),
    );
  };

  const totalSubTasks = tasks[0]?.subtasks?.length || 0;

  const handleAddComment = async TaskId => {
    if (!CommentInput.trim()) {
      console.log('Comment is empty.');
      return;
    }

    console.log('Comment Input:', CommentInput);

    try {
      const formData = new FormData();
      formData.append('task_id', SelectedTaskId);
      formData.append('comment', CommentInput.trim());

      //   console.log('Sending comment data:', commentData);

      const response = await PostCommentApi(formData);

      // console.log('Comment Response:', response);

      if (response?.success) {
        // console.log('Comment posted successfully:', response);
        setCommentInput('');

        fetchComments(SelectedTaskId);
      } else {
        const errorMessage = response?.message || 'Failed to post comment';
        console.log('Error in response:', errorMessage);
      }
    } catch (error) {
      console.log('Error adding comment:', error);
    }
  };

  const handlemarkAsDone = id => {
    console.log('Mark as Done Task:', JSON.stringify(id));
    setSelectedTaskId(id.id);
    setData(id);
    setDoneModalVisible(true);
  };

  const handleReschedule = id => {
    console.log('Reschedule Task:', JSON.stringify(id));
    setSelectedTaskId(id.id);
    setData(id);
    setRescheduleModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {SubTaskData?.length > 0 && (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={handleToggleTask}
              onToggleNested={handleToggleNestedSubTask}
              onOpenComments={handleOpenComments}
              setDoneModalVisible={setDoneModalVisible}
              setRescheduleModalVisible={setRescheduleModalVisible}
              onOpenMarkAsDone={handlemarkAsDone}
              onOpenReschedule={handleReschedule}
              status={status}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20, paddingTop: 0 }}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentModalVisible}
        onRequestClose={handleCloseComments}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={handleCloseComments}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View>
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

            <FlatList
              data={selectedTaskComments}
              renderItem={renderComment}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.commentsListContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <ButtonModalScreen
        isDoneModalVisible={isDoneModalVisible}
        setDoneModalVisible={setDoneModalVisible}
        isRescheduleModalVisible={isRescheduleModalVisible}
        setRescheduleModalVisible={setRescheduleModalVisible}
        Data={Data}
        navigation={navigation}
        subTackStatus={true}
      />
    </View>
  );
};

export default EventTaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: mainWhiteColor,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: DarkColor20,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    flex: 1, // Ensure text does not push icon out
  },
  subTaskHeaderText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subTasksList: {
    marginTop: 20,
  },
  subTaskWrapper: {
    paddingLeft: 10,
    marginBottom: 15,
  },
  subTaskContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subTaskIcon: {
    marginRight: 8,
    marginTop: 5,
  },
  subTaskDetails: {
    flex: 1,
  },
  subTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subTaskTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    flex: 1,
  },
  subTaskIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  subTaskCommentCount: {
    fontSize: 11,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginLeft: 4,
  },
  dropdownIcon: {
    marginLeft: 12,
  },
  subTaskDescription: {
    fontSize: 10,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 4,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  doneButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  doneButtonText: {
    color: mainWhiteColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsSemiBold,
  },
  rescheduleButton: {
    borderColor: mainOrangeColor,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginLeft: 10,
  },
  rescheduleButtonText: {
    color: mainOrangeColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsSemiBold,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DarkColor20,
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  commentsListContainer: {
    paddingVertical: 10,
  },
  // COMMENT ITEM STYLES
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  systemCommentContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  avatar: { width: 45, height: 45, borderRadius: 24, marginRight: 12 },
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

  systemCommentText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
  },
});
