import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';

// --- Mocking these imports as I don't have the actual SVG files. ---
// --- Replace these with your actual SVG component imports. ---
const RedFlag = () => <Text style={{fontSize: 18, marginRight: 4}}>🚩</Text>;
const SkyBlueFlag = () => (
  <Text style={{fontSize: 18, marginRight: 4}}>🟦</Text>
);
const CommentIconSvg = () => <Text style={{fontSize: 20}}>💬</Text>;
const PendingDocumentSvg = () => (
  <Text style={{fontSize: 24, color: '#4A4A4A'}}>📋</Text>
);
// --------------------------------------------------------------------

const DarkColor = '#2F2F2F';
const DarkColor50 = '#959595';
const mainOrangeColor = '#F9A877';
const mainWhiteColor = '#FFFFFF';
const lightGrayBackground = '#F7F7F7';

// --- Dummy Data ---
// Profile images for assignees
const profile1 = require('../../assets/Png/ProfileIcon.png');
const profile2 = require('../../assets/Png/ProfileIcon2.png');
const profile3 = require('../../assets/Png/ProfileIcon2.png'); // Assuming you have a 3rd and 4th icon
const profile4 = require('../../assets/Png/ProfileIcon2.png');

const DUMMY_TASKS = [
  {
    id: '1',
    title: 'Update inventory at GB Market',
    subtaskCount: 2,
    commentCount: 4,
    priority: 'Normal',
    assignees: [profile1],
  },
  {
    id: '2',
    title: 'Update inventory at AB Market',
    subtaskCount: 2,
    commentCount: 4,
    priority: 'Urgent',
    assignees: [
      profile2,
      profile3,
      profile4,
      profile1,
      profile2,
      profile3,
      profile4,
    ], // 7 total assignees
  },
  {
    id: '3',
    title: 'Prepare Q3 financial report',
    subtaskCount: 5,
    commentCount: 8,
    priority: 'Urgent',
    assignees: [profile3, profile4],
  },
  {
    id: '4',
    title: 'Team meeting for project alpha',
    subtaskCount: 1,
    commentCount: 2,
    priority: 'Low',
    assignees: [profile1, profile2, profile4],
  },
  {
    id: '5',
    title: 'Fix login page bug',
    subtaskCount: 3,
    commentCount: 12,
    priority: 'Urgent',
    assignees: [profile2],
  },
  {
    id: '6',
    title: 'Design new landing page',
    subtaskCount: 4,
    commentCount: 5,
    priority: 'Normal',
    assignees: [profile1, profile4],
  },
  {
    id: '7',
    title: 'User testing session',
    subtaskCount: 2,
    commentCount: 3,
    priority: 'Normal',
    assignees: [profile1, profile2, profile3],
  },
  {
    id: '8',
    title: 'Deploy server updates',
    subtaskCount: 6,
    commentCount: 1,
    priority: 'Urgent',
    assignees: [profile4],
  },
  {
    id: '9',
    title: 'Client follow-up calls',
    subtaskCount: 0,
    commentCount: 0,
    priority: 'Low',
    assignees: [profile1, profile3],
  },
  {
    id: '10',
    title: 'Organize team outing',
    subtaskCount: 3,
    commentCount: 9,
    priority: 'Normal',
    assignees: [profile1, profile2, profile3, profile4],
  },
];

// --- Reusable Components ---

const PriorityTag = ({priority}) => {
  if (priority === 'Urgent') {
    return (
      <View style={[styles.priorityTag, {backgroundColor: '#FFD6D6'}]}>
        <RedFlag />
        <Text style={[styles.priorityText, {color: '#D9534F'}]}>Urgent</Text>
      </View>
    );
  }
  // Add more cases for 'Low', etc. if needed
  return (
    <View style={[styles.priorityTag, {backgroundColor: '#D6EFFF'}]}>
      <SkyBlueFlag />
      <Text style={[styles.priorityText, {color: '#4A90E2'}]}>Normal</Text>
    </View>
  );
};

const AssigneeList = ({assignees}) => {
  const maxVisible = 3;
  const visibleAssignees = assignees.slice(0, maxVisible);
  const hiddenCount = assignees.length - maxVisible;

  return (
    <View style={styles.assigneeContainer}>
      {visibleAssignees.map((assignee, index) => (
        <Image
          key={index}
          source={assignee}
          style={[
            styles.assigneeImage,
            {marginLeft: index > 0 ? -12 : 0}, // Overlap effect
          ]}
        />
      ))}
      {hiddenCount > 0 && (
        <Text style={styles.moreUsersText}>+ {hiddenCount} users</Text>
      )}
    </View>
  );
};

const TaskCard = ({item}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.headerIcons}>
          <PriorityTag priority={item.priority} />
          <View style={{marginLeft: 8}}>
            <PendingDocumentSvg />
          </View>
        </View>
      </View>

      <Text style={styles.subtasksText}>Subtasks ({item.subtaskCount})</Text>

      <View style={styles.cardFooter}>
        <View style={styles.commentsContainer}>
          <CommentIconSvg />
          <Text style={styles.commentsText}>{item.commentCount}</Text>
        </View>
        <AssigneeList assignees={item.assignees} />
      </View>
    </View>
  );
};

// --- Main Screen Component ---

const TaskComponents = () => {
  return (
    <View style={styles.screenContainer}>
      {/* My Tasks Section */}
      <Text style={styles.sectionTitle}>My Tasks</Text>
      <FlatList
        data={DUMMY_TASKS}
        renderItem={({item}) => <TaskCard item={item} />}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Notes Section - uses the same card for demonstration */}
      <Text style={styles.sectionTitle}>Notes</Text>
      <FlatList
        data={DUMMY_TASKS.slice().reverse()} // Using reversed data for variety
        renderItem={({item}) => <TaskCard item={item} />}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

// --- Styles ---
const cardWidth = Dimensions.get('window').width * 0.75; // Adjust this for card size

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: lightGrayBackground,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DarkColor,
    marginLeft: 15,
    marginBottom: 10,
  },
  flatListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: mainOrangeColor,
    borderRadius: 20,
    padding: 16,
    width: cardWidth,
    marginRight: 15,
    justifyContent: 'space-between',
    height: 140, // Fixed height for consistency
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DarkColor,
    flex: 1, // Allow title to take space but not push icons
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtasksText: {
    fontSize: 16,
    color: DarkColor50,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsText: {
    fontSize: 16,
    color: DarkColor,
    marginLeft: 8,
    fontWeight: '500',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: mainWhiteColor,
  },
  moreUsersText: {
    fontSize: 14,
    color: DarkColor,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default TaskComponents;
