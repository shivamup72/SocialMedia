import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import LeftArrowFilled from '../../../assets/svg/left_arrow_filled';
import RightArrowFilled from '../../../assets/svg/Right_arrow_filled';
import SelectedDateIcon from '../../../assets/svg/bx_task';
// import TaskCompleted from './TaskCompleted';
// import StartModal from './StartModal';
import AllTaskModal from './AllTaskModal';
import {
  GetTaskApiListingData,
  GetCalenderDataApi,
} from '../../../Api/config/TimelyApi';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CompletedTaskIcon from '../../../assets/svg/completed_task_icon';
import GG_Link from '../../../assets/svg/gg_link';
import Toast from '../../../Api/context/Toast';

import {
  fonts,
  DarkColor60,
  DarkColor,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor50,
} from '../../../utils/style/fonts';
import RedFlag from '../../../assets/svg/RedFlag';
import SkyBlueFlag from '../../../assets/svg/SkyBlueFlag';
import CommentIconSvg from '../../../assets/svg/iconamoon_comment_light';
import PendingDocumentSvg from '../../../assets/svg/material_symbols_pending_actions_rounded';
import { RfH, RfW } from '../../../utils/helper';
import CustomText from '../../../utils/CustomText';

const CalenderScreen = () => {
  const navigation = useNavigation()
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState([]);
  const [TaskData, setTaskData] = useState([]);
  const PlusIcon = require('../../../assets/Png/PlusIcon.png');
  const [isModalVisible, setModalVisible] = useState(false);
  console.log(isModalVisible, "isModalVisible");

  const IsFocused = useIsFocused();

  const toastRef = useRef(null);

  const getMonthRange = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 2);
    const lastDay = new Date(year, month + 1, 1);
    const formatDate = date1 => date1.toISOString().split('T')[0];
    return {
      firstDay: formatDate(firstDay),
      lastDay: formatDate(lastDay),
    };
  };

  // console.log('selectedDate ====---->', selectedDate);

  useEffect(() => {
    const getTaskData = async () => {
      try {
        const { firstDay, lastDay } = getMonthRange(currentDate);
        // console.log('\n', 'Date Range: ==---->', {firstDay, lastDay});
        const res1 = await GetCalenderDataApi({
          start_date: firstDay,
          end_date: lastDay,
        });

        // console.log(
        //   '\n',
        //   'Calender Data: ==---->',
        //   '\n',
        //   JSON.stringify(res1?.data),
        // );

        setTaskData(res1?.data);

        // const response = await GetTaskApiListingData({});
        // console.log('\n','Task Data: ==---->','\n',JSON.stringify(response, null, 2));
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    getTaskData();
  }, [currentDate, IsFocused]);

  useEffect(() => {
    const SelectedDayFetchData = async () => {
      try {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const res = await GetTaskApiListingData({
          date: formattedDate,
        });
        setTasksForSelectedDay(res?.results);
      } catch (error) {
        console.log('Error in SelectedDayFetchData ==---->', error);
        toastRef.current.show({
          type: 'error',
          message: error?.message,
        });
      }
    };

    SelectedDayFetchData();
  }, [, IsFocused]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if current view is the current month
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      currentDate.getFullYear() === now.getFullYear() &&
      currentDate.getMonth() === now.getMonth()
    );
  }, [currentDate]);

  const handleAddTask = () => {
    setModalVisible(false);
    navigation.navigate('TaskScreen');
  };

  const handleAddLeave = () => {
    setModalVisible(false);
    navigation.navigate('LeaveScreen');
  };
  const handleAddExpense = () => {
    setModalVisible(false);
    navigation.navigate('ExpenseClaimScreen');
  };

  const handleAddMeeting = () => {
    setModalVisible(false);
    // console.log('Add Meeting pressed');
    navigation.navigate('MeetingScreen');
  };

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() - 1,
        1,
      );
      // Update selectedDate to the first day of the new month
      setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        1,
      );
      setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return newDate;
    });
  }, []);

  const handleDateSelect = useCallback(
    async (day, isCurrentMonth) => {
      if (!isCurrentMonth) return;

      const selectedDate1 = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      setSelectedDate(selectedDate1);

      try {
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const formattedDate = `${currentDate.getFullYear()}-${month}-${dayStr}`;
        console.log(
          'date selected -=-=-=-=----->',
          formattedDate,
          '\n',
          '\n',
          selectedDate,
          '\n',
          day,
        );
        const res = await GetTaskApiListingData({
          date: formattedDate,
        });

        setTasksForSelectedDay(res?.results);
        console.log(
          '\n',
          'Selected Day Data: ==---->',
          '\n',
          JSON.stringify(res),
        );
      } catch (err) {
        console.log('Error in handleDateSelect ==---->', err);
      }
    },
    [currentDate],
  );

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    ).getDate();

    const days = [];
    const rows = [];

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    // Split into rows of 7 days
    for (let i = 0; i < 6; i++) {
      rows.push(days.slice(i * 7, (i + 1) * 7));
    }

    return rows;
  }, [currentDate]);

  const handleTaskPress = item => {
    // console.log('Task pressed:', item);
    navigation.navigate('EventTypeScreen', { Data: item });
  };

  const renderTaskItem = ({ item, index }) => {
    return (
      <Pressable
        style={Taskstyles.taskContainer}
        onPress={() => handleTaskPress(item)}>
        <View style={Taskstyles.timeSection}>
          <CustomText allowFontScaling={false} style={Taskstyles.timeText}>
            {item.start_time
              ? new Date(`2000-01-01T${item.start_time}`).toLocaleTimeString(
                'en-US',
                {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                },
              )
              : ''}
          </CustomText>
        </View>
        <View style={Taskstyles.verticalLine} />

        <View
          style={[
            Taskstyles.taskCard,
            item.event_type !== 'task'
              ? Taskstyles.meetingCard
              : Taskstyles.normalCard,
          ]}>
          <View style={Taskstyles.taskHeader}>
            <CustomText
              allowFontScaling={false}
              style={[
                Taskstyles.taskTitle,
                item.event_type !== 'task'
                  ? Taskstyles.meetingTitle
                  : Taskstyles.normalTitle,
              ]}>
              {item.title}
            </CustomText>

            <View style={Taskstyles.rightSection}>
              {item.event_type === 'task' && (
                <>
                  {item.priority === 'high' && (
                    <View style={Taskstyles.urgentBadge}>
                      <RedFlag width={12} height={12} />
                      <CustomText
                        allowFontScaling={false}
                        style={Taskstyles.urgentText}>
                        Urgent
                      </CustomText>
                    </View>
                  )}
                  {item.priority === 'medium' && (
                    <View style={Taskstyles.normalBadge}>
                      <SkyBlueFlag width={12} height={12} color={'#EB8F00'} />
                      <CustomText
                        allowFontScaling={false}
                        style={Taskstyles.normalText}>
                        Medium
                      </CustomText>
                    </View>
                  )}

                  {item.priority === 'low' && (
                    <View style={Taskstyles.normalBadge}>
                      <SkyBlueFlag width={12} height={12} color={'#5BC2FC'} />
                      <CustomText
                        allowFontScaling={false}
                        style={Taskstyles.normalText}>
                        Normal
                      </CustomText>
                    </View>
                  )}
                </>
              )}
              {item?.event_type === 'task' && item?.status === 'completed' ? (
                <CompletedTaskIcon width="18" height="18" color={'#40C0E7'} />
              ) : (
                <PendingDocumentSvg width={16} height={16} />
              )}
            </View>
          </View>

          {item?.sub_tasks_count > 0 && (
            <CustomText allowFontScaling={false} style={Taskstyles.subtaskText}>
              Subtasks ({item?.sub_tasks_count})
            </CustomText>
          )}

          {/* {item?.timeRange && (
                        <CustomText style={Taskstyles.timeRangeText}>{item?.timeRange}</CustomText>
                    )} */}

          <View style={Taskstyles.taskFooter}>
            {item?.event_type === 'task' ? (
              <View style={Taskstyles.commentSection}>
                <CommentIconSvg width={16} height={16} />
                <CustomText allowFontScaling={false} style={Taskstyles.commentText}>
                  {item?.comments_count}
                </CustomText>
              </View>
            ) : (
              <TouchableOpacity style={Taskstyles.commentSection}>
                <GG_Link width={16} height={16} />
              </TouchableOpacity>
            )}

            <View style={Taskstyles.userSection}>
              {/* {item?.users?.slice(0, 2)?.map((user, userIndex) => (
                                <Image
                                    key={userIndex}
                                    source={user}
                                    style={[
                                        Taskstyles.userAvatar,
                                        userIndex > 0 && Taskstyles.overlappingAvatar
                                    ]}
                                />
                            ))} */}
              {item?.participants_count > 0 && (
                <CustomText allowFontScaling={false} style={Taskstyles.userCountText}>
                  + {item?.participants_count} users
                </CustomText>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day, index) => (
          <CustomText
            allowFontScaling={false}
            key={index}
            style={[
              styles.dayOfWeekText,
              (index === 0 || index === 7) && styles.weekendText,
            ]}>
            {day}
          </CustomText>
        ))}
      </View>
      {console.log('\n')}
      <View style={styles.calendarGrid}>
        {calendarGrid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.calendarRow}>
            {row.map((item, colIndex) => {
              const isSelected =
                item.isCurrentMonth &&
                item.day === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear();
              const dayOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                item.day,
              ).getDay();
              const isWeekend =
                item.isCurrentMonth && (dayOfWeek === 0 || dayOfWeek === 7);
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.dateCell,
                    isSelected && styles.selectedDateCell,
                  ]}
                  onPress={() =>
                    handleDateSelect(item.day, item.isCurrentMonth)
                  }
                  disabled={!item.isCurrentMonth}>
                  <CustomText
                    allowFontScaling={false}
                    style={[
                      styles.dateText,
                      !item.isCurrentMonth && styles.otherMonthDateText,
                      isWeekend && !isSelected && styles.weekendText,
                      isSelected && styles.selectedDateText,
                    ]}>
                    {item.day}
                  </CustomText>
                  {item.isCurrentMonth &&
                    (() => {
                      // Create date in local timezone
                      const year = currentDate.getFullYear();
                      const month = currentDate.getMonth();
                      const day = item.day;

                      // Create date string in YYYY-MM-DD format
                      const pad = n => (n < 10 ? `0${n}` : n);
                      const currentDateKey = `${year}-${pad(month + 1)}-${pad(
                        day,
                      )}`;

                      // Get tasks for this date
                      const dateTasks = TaskData[currentDateKey];

                      // Only show if we have tasks/meetings for this date
                      if (
                        !dateTasks ||
                        (dateTasks.total_tasks === 0 &&
                          dateTasks.total_meetings === 0)
                      ) {
                        return null;
                      }

                      const totalCount =
                        (dateTasks.total_tasks || 0) +
                        (dateTasks.total_meetings || 0);

                      // console.log(
                      //   'Rendering count for',
                      //   currentDateKey,
                      //   ':',
                      //   dateTasks.total_meetings,
                      //   ' ',
                      //   dateTasks?.total_tasks,
                      //   ' ',
                      //   totalCount,
                      // );

                      return (
                        <View style={styles.selectionInfo}>
                          <SelectedDateIcon
                            color={isSelected ? '#ffffff' : DarkColor50}
                            width={'12'}
                            height={'12'}
                          />
                          <CustomText
                            allowFontScaling={false}
                            style={[
                              styles.selectionInfoText,
                              isSelected ? null : { color: DarkColor50 },
                            ]}>
                            {totalCount}
                          </CustomText>
                        </View>
                      );
                    })()}
                </TouchableOpacity>
              );
            })}
            {rowIndex < 7 && <View style={styles.rowBorder} />}
          </View>
        ))}
      </View>

      <View style={styles.leavesApprovalContainer}>
        <TouchableOpacity
          style={styles.leavesContainer}
          onPress={() => navigation.navigate('MyApprovalsScreen')}>
          <CustomText allowFontScaling={false} style={styles.leavesTitle}>
            My Leaves & Claims
          </CustomText>
          {/* <Text allowFontScaling={false} style={styles.leavesCount}>
            0/0
          </Text> */}
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.approvalsContainer}
          onPress={() => navigation.navigate('ApprovedScreen')}>
          <Text allowFontScaling={false} style={styles.approvalsText}>
            Approvals
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{}}>
      <ScrollView contentContainerStyle={{ paddingBottom: RfH(80) }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
            <LeftArrowFilled color="#263238CC" width="20" height="27" />
          </TouchableOpacity>
          <CustomText
            allowFontScaling={false}
            style={styles.headerText}>{`${monthName} ${year}`}</CustomText>
          <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
            <RightArrowFilled
              color={isCurrentMonth ? '#CCCCCC' : '#263238CC'}
              width="20"
              height="27"
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasksForSelectedDay}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderCalendarHeader}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}>
              <CustomText allowFontScaling={false} style={{ color: '#666' }}>
                No tasks for this day.
              </CustomText>
            </View>
          }
          contentContainerStyle={{
            padding: 16,
            paddingHorizontal: 0,
            paddingTop: 0,
          }}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>

      {/* add button */}

      {!isModalVisible && (
        <View style={{ position: 'absolute', bottom: RfH(120), right: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#F57E3B',
              justifyContent: 'center',
              alignItems: 'center',
              width: RfW(50),
              height: RfH(50),
              borderRadius: 25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 6,
            }}
            onPress={() => setModalVisible(true)}>
            <CustomText style={{
              color: mainWhiteColor, fontSize: 38, alignSelf: 'center',
              left: RfW(1), fontFamily: fonts.PoppinsMedium, bottom: RfH(2)
            }}>+</CustomText>
          </TouchableOpacity>
        </View>
      )}

      {/* <StartModal /> */}

      <AllTaskModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAddTask={handleAddTask}
        onAddLeave={handleAddLeave}
        onAddExpense={handleAddExpense}
        onAddMeeting={handleAddMeeting}
      />
      <Toast ref={toastRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  listContentContainer: { paddingBottom: 10 },
  calendarContainer: { backgroundColor: '#ffffff', paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: mainOrangeColor,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: '#263238',
  },
  leavesApprovalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  leavesContainer: {
    borderWidth: 1,
    borderColor: mainOrangeColor,
    paddingBottom: 5,
    // flex: 1,
    // marginRight: 10,
    borderRadius: 4,
    // paddingHorizontal:10,
    // paddingVertical:5,
    height: 50,
    width: 150,
    justifyContent: 'center',
    // alignItems:'center'
    paddingLeft: 10,
  },
  leavesTitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: mainOrangeColor,
  },
  leavesCount: {
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
    color: mainOrangeColor,
    marginTop: 2,
  },
  approvalsContainer: {
    backgroundColor: mainOrangeColor,
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 150,
    height: 50,
  },
  approvalsText: {
    fontSize: 13,
    fontFamily: fonts.PoppinsSemiBold,
    color: mainWhiteColor,
  },
  arrowButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  arrowText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  headerText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 5,
  },
  dayOfWeekText: {
    width: '14.28%',
    textAlign: 'center',
    color: '#B0B0B0',
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
  },
  weekendText: { color: '#EC360E' },
  calendarGrid: {
    left: RfW(14)
  },
  calendarRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  dateCell: {
    width: '14.28%',
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 0,
    borderColor: '#f0f0f0',
    paddingHorizontal: 5,
    paddingVertical: 5,
    position: 'relative',
  },
  rowBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    // borderTopWidth: 1,
    // borderTopColor: 'red',
  },
  dateText: { fontSize: 11, color: '#262729', fontFamily: fonts.PoppinsSemiBold },
  otherMonthDateText: { color: '#bdc3c7' },
  selectedDateCell: {
    backgroundColor: mainOrangeColor,
    borderRadius: 0,
    borderColor: '#f39c12',
  },
  selectedDateText: { color: mainWhiteColor, fontFamily: fonts.PoppinsMedium },
  selectionInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  selectionInfoText: {
    color: mainWhiteColor,
    fontSize: 10,
    marginLeft: 4,
    marginTop: 2,
    fontFamily: fonts.PoppinsMedium,
  },
  selectedIconContainer: {
    backgroundColor: 'white',
    width: 14,
    height: 14,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconCheck: { color: '#f39c12', fontSize: 10, fontWeight: 'bold' },

  row: { flexDirection: 'row', minHeight: 100, paddingHorizontal: 10 },
  timelineContainer: {
    width: 70,
    alignItems: 'flex-end',
    paddingTop: 4,
    paddingRight: 10,
  },
  timelineTime: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  timelineLineContainer: {
    position: 'absolute',
    top: 10,
    left: 15,
    alignItems: 'center',
    height: '100%',
  },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#eee' },
  taskContainer: { flex: 1, paddingBottom: 20 },
  verticalLine: {
    width: '100%',
    borderColor: 'red',
    borderWidth: 1,
  },
  card: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  inventoryCard: { backgroundColor: '#FDE7D4' },
  meetingCard: { backgroundColor: '#A8A9FF' },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentsSection: { flexDirection: 'row', alignItems: 'center' },
  actionsSection: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#555', marginLeft: 5, fontSize: 13 },
  priorityTag: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreUsersText: { fontSize: 13, color: '#555', marginLeft: 8 },
  iconText: { fontSize: 18 },
  flag: { width: 12, height: 12, borderRadius: 2 },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  emptyListText: { fontSize: 16, color: '#888' },
});

const Taskstyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    // backgroundColor: 'red',
    width: '94%',
    alignSelf: 'center'
  },
  timeSection: {
    // width: 30,
    alignItems: 'center',
    paddingHorizontal: RfW(8)
    // marginRight: 8,
    // backgroundColor:'red'
  },
  dateText: {
    marginRight: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  normalTitle: {
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  meetingTitle: {
    color: DarkColor,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgentText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    color: DarkColor60,
    fontFamily: fonts.PoppinsRegular,
    alignItems: 'center',
  },

  taskCard: {
    flex: 1,
    borderRadius: 6,
    padding: 12,
    paddingVertical: 8,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  normalCard: {
    backgroundColor: '#FF9F57',
  },
  meetingCard: {
    backgroundColor: '#A78BFA',
  },
  emptyTaskCard: {
    flex: 1,

    marginRight: 8,
  },

  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  normalTitle: {
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  meetingTitle: {
    color: DarkColor,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgentText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  normalText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  subtaskText: {
    color: mainWhiteColor,
    fontSize: 10,
    marginBottom: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  timeRangeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  overlappingAvatar: {
    marginLeft: -8,
  },
  userCountText: {
    color: mainWhiteColor,
    fontSize: 10,
    marginLeft: 8,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default CalenderScreen;


// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const CalenderScreen = () => {
//   return (
//     <View>
//       <Text>CalenderScreen</Text>
//     </View>
//   )
// }

// export default CalenderScreen

// const styles = StyleSheet.create({})