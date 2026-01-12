import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor60,
  DarkColor80,
  DarkCOlor30,
} from '../../../../utils/style/fonts';

import ClockIcon from '../../../../assets/svg/ClockSvg';
import DropDownSvgIcon from '../../../../assets/svg/DropDownSvg';
import RedFlag from '../../../../assets/svg/RedFlag';
import LucideUserRound from '../../../../assets/svg/lucide_user_round';

const priorityColors = {
  high: '#D9534F',
  medium: '#EB8F00',
  low: '#5BC2FC',
};

const ArrowSpinImage = require('../../../../assets/AssestsComponents/Png/pepicons_pencil_arrow_spin.png');
// import CommonDateTimePicker from '../../../components/CommonDateTimePicker/CommonDateTimePicker';

const formatDate = date =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

const formatTime = date =>
  date
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();

const RepeatModal = ({
  visible,
  onClose,
  onSelect,
  currentSelection,
  repeatConstants = [],
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { width: '80%' }]}>
          <FlatList
            data={repeatConstants}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => onSelect(item.value)}>
                <View
                  style={[
                    styles.radioButton,
                    currentSelection === item.value &&
                    styles.radioButtonSelected,
                  ]}
                />
                <Text allowFontScaling={false} style={styles.modalOptionText}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const PriorityModal = ({
  visible,
  onClose,
  onSelect,
  currentSelection,
  priorityConstants = [],
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { width: '60%' }]}>
          <FlatList
            data={priorityConstants}
            keyExtractor={item => item.value}
            renderItem={({ item }) => {
              // Debug the current item and selection
              const isSelected =
                currentSelection?.value === item.value ||
                currentSelection === item.value;
              console.log(`Item: ${item.value}, isSelected: ${isSelected}`);

              return (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() =>
                    onSelect({
                      label: item.label,
                      value: item.value,
                      color: priorityColors[item.value.toLowerCase()],
                    })
                  }>
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  />
                  <Text allowFontScaling={false} style={styles.modalOptionText}>
                    {item.label}
                  </Text>
                  <RedFlag
                    width={20}
                    height={20}
                    color={
                      priorityColors[item.value.toLowerCase()] || '#000000'
                    }
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const AssigneeModal = ({
  visible,
  onClose,
  onSelect,
  currentSelection = [],
  UserList,
  searchQuery,
  setSearchQuery,
}) => {
  const toggleSelection = user => {
    const isSelected = currentSelection?.some(u => u?.id === user?.id);
    const newSelection = isSelected
      ? currentSelection?.filter(u => u?.id !== user?.id)
      : [...currentSelection, user];
    onSelect(newSelection);
  };

  const filteredUsers = UserList?.filter(user => {
    const searchLower = searchQuery?.toLowerCase().trim();
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`
      .toLowerCase()
      .trim();
    return (
      user?.first_name?.toLowerCase()?.includes(searchLower) ||
      user?.last_name?.toLowerCase()?.includes(searchLower) ||
      fullName?.includes(searchLower) ||
      user?.email?.toLowerCase()?.includes(searchLower)
    );
  });

  // console.log('filter user -=-=-=-=-=-=----------->', UserList, '\n', '\n');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={[styles.modalContent, { width: '80%', maxHeight: '70%' }]}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={DarkCOlor30}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <Text style={styles.noResultsText}>No users found</Text>
            }
            renderItem={({ item }) => {
              const isSelected = currentSelection.some(u => u.id === item.id);
              return (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => toggleSelection(item)}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  />
                  <Image
                    source={
                      item.profile_picture
                        ? { uri: item.profile_picture }
                        : require('../../../../assets/Png/ProfileIcon.png')
                    }
                    style={styles.avatar}
                  />
                  <Text allowFontScaling={false} style={styles.modalOptionText}>
                    {item.first_name || item.last_name
                      ? `${item.first_name || ''} ${item.last_name || ''
                        }`.trim()
                      : item.email || 'No Name'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const TaskDetails = ({
  task,
  taskId,
  onUpdate,
  showDatepicker,
  isSubtask = false,
  Type = 'Task',
  repeatConstants = [],
  priorityConstants = [],
  UserList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const effectiveTaskId = taskId || task?.id;

  const [modalType, setModalType] = useState(null);

  // const toastRef = useRef(null);

  const handleRepeatSelect = repeat => {
    onUpdate(effectiveTaskId, { repeat });
    setModalType(null);
  };

  const handlePrioritySelect = priority => {
    onUpdate(effectiveTaskId, {
      priority: priority.value,
      priorityColor: priorityColors[priority.value.toLowerCase()],
    });
    setModalType(null);
  };

  const handleAssigneeSelect = assignees => {
    onUpdate(effectiveTaskId, { assignees });
  };

  return (
    <>
      {Type === 'meeting' && (
        <>
          <Text
            style={{
              color: DarkColor,
              fontSize: 16,
              fontFamily: fonts.PoppinsMedium,
            }}>
            Meeting Link
          </Text>
          <TextInput
            allowFontScaling={false}
            placeholder="Add Meeting Link"
            placeholderTextColor={DarkCOlor30}
            style={styles.detailsInput}
            multiline
            value={task.meetingLink}
            onChangeText={text =>
              onUpdate(effectiveTaskId, { meetingLink: text })
            }
          />
        </>
      )}

      <TextInput
        allowFontScaling={false}
        placeholder={
          isSubtask ? 'Add Details' : 'Add Details, links or notes..'
        }
        placeholderTextColor={DarkCOlor30}
        style={isSubtask ? styles.subtaskDetailsInput : styles.detailsInput}
        multiline
        value={task.details}
        onChangeText={text => onUpdate(effectiveTaskId, { details: text })}
      />
      <View style={[styles.separator, { height: 0.5 }]} />
      <View style={styles.detailsSection}>
        <View style={styles.allDayContainer}>
          <View style={styles.allDayLeft}>
            <ClockIcon width="18" height="18" color={DarkColor80} />
            <Text allowFontScaling={false} style={styles.allDayText}>
              All Day
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#dcdcdc', true: '#2EC315' }}
            thumbColor={mainWhiteColor}
            onValueChange={value =>
              onUpdate(effectiveTaskId, { isAllDay: value })
            }
            value={task.isAllDay}
          />
        </View>
        <View style={styles.dateContainer}>
          <View style={styles.dateBlock}>
            <TouchableOpacity
              onPress={() =>
                showDatepicker('startDate', 'date', effectiveTaskId)
              }>
              <Text style={styles.dateText}>
                {formatDate(new Date(task.startDate))}
              </Text>
            </TouchableOpacity>
            {!task.isAllDay && (
              <TouchableOpacity
                onPress={() =>
                  showDatepicker('startDate', 'time', effectiveTaskId)
                }>
                <Text style={styles.timeText}>
                  {formatTime(new Date(task.startDate))}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.dateBlock}>
            <TouchableOpacity
              onPress={() =>
                showDatepicker('endDate', 'date', effectiveTaskId)
              }>
              <Text style={styles.dateText}>
                {formatDate(new Date(task.endDate))}
              </Text>
            </TouchableOpacity>
            {!task.isAllDay && (
              <TouchableOpacity
                onPress={() =>
                  showDatepicker('endDate', 'time', effectiveTaskId)
                }>
                <Text style={styles.timeText}>
                  {formatTime(new Date(task.endDate))}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setModalType('repeat')}>
          <Image source={ArrowSpinImage} style={{ width: 18, height: 18 }} />
          <Text style={styles.actionText}>
            {task.repeat?.split(' ')[0] || 'Repeat'}
          </Text>
          <DropDownSvgIcon width="13" height="13" color={DarkColor60} />
        </TouchableOpacity>
        {/* {console.log('task priority', task.priority)} */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setModalType('priority')}>
          <RedFlag
            width="15"
            height="18"
            color={
              task.priority === 'low'
                ? priorityColors.low
                : task.priority === 'high'
                  ? priorityColors.high
                  : task.priority === 'medium'
                    ? priorityColors.medium
                    : DarkColor
            }
          />
          <DropDownSvgIcon width="15" height="15" color={DarkColor60} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setModalType('assignee')}>
          {task.assignees?.length > 0 ? (
            <View style={styles.avatarGroup}>
              {task.assignees.slice(0, 2).map((u, i) => (
                <Image
                  key={u.id}
                  source={
                    u.profile_picture
                      ? { uri: u.profile_picture }
                      : require('../../../../assets/Png/ProfileIcon.png')
                  }
                  style={[styles.avatarSmall, i > 0 && styles.avatarOverlap]}
                />
              ))}
              {task.assignees.length > 2 && (
                <View
                  style={[
                    styles.avatarSmall,
                    styles.avatarOverlap,
                    styles.avatarMore,
                  ]}>
                  <Text style={styles.avatarMoreText}>
                    +{task.assignees.length - 2}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <LucideUserRound width="18" height="18" color={DarkColor} />
          )}
          <DropDownSvgIcon width="15" height="15" color={DarkColor60} />
        </TouchableOpacity>
      </View>

      <RepeatModal
        visible={modalType === 'repeat'}
        onClose={() => setModalType(null)}
        onSelect={handleRepeatSelect}
        currentSelection={task.repeat}
        repeatConstants={repeatConstants}
      />

      <PriorityModal
        visible={modalType === 'priority'}
        onClose={() => setModalType(null)}
        onSelect={handlePrioritySelect}
        currentSelection={task.priority}
        priorityConstants={priorityConstants}
      />

      <AssigneeModal
        visible={modalType === 'assignee'}
        onClose={() => {
          setModalType(null);
          setSearchQuery('');
        }}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        onSelect={handleAssigneeSelect}
        currentSelection={task.assignees || []}
        UserList={UserList}
      />
    </>
  );
};

const styles = StyleSheet.create({
  detailsInput: {
    fontSize: 13,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    minHeight: 40,
    textAlignVertical: 'top',
    paddingLeft: 10,
    height: 80,
  },
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
  separator: { height: 0.5, backgroundColor: '#26323826', marginVertical: 5 },
  detailsSection: { paddingHorizontal: 10, paddingBottom: 10 },
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
  actionText: { fontSize: 12, color: DarkColor, marginHorizontal: 4 },
  avatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarMore: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  avatarMoreText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    marginLeft: 12,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DarkColor60,
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: mainOrangeColor,
    borderColor: mainOrangeColor,
  },
  checkbox: {
    width: 13,
    height: 13,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: DarkColor60,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 15,
  },
  checkboxSelected: {
    backgroundColor: mainOrangeColor,
    borderColor: mainOrangeColor,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  searchContainer: {
    padding: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    // fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  noResultsText: {
    textAlign: 'center',
    padding: 20,
    color: DarkColor60,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default TaskDetails;
