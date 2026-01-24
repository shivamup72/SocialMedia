// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import RedFlag from '../../assets/svg/RedFlag';
// import SkyBlueFlag from '../../assets/svg/SkyBlueFlag';
// import CommentIconSvg from '../../assets/svg/iconamoon_comment_light';
// import PendingDocumentSvg from '../../assets/svg/material_symbols_pending_actions_rounded';



// const TaskCompleted = () => {
//   return (
//     <View>
//       <Text>TaskCompleted</Text>
//     </View>
//   )
// }

// export default TaskCompleted

// const styles = StyleSheet.create({})

//////////////
////////////////
//////////////

import { StyleSheet, Text, View, FlatList, Image, SafeAreaView } from 'react-native';
import React from 'react';
import RedFlag from '../../assets/svg/RedFlag';
import SkyBlueFlag from '../../assets/svg/SkyBlueFlag';
import CommentIconSvg from '../../assets/svg/iconamoon_comment_light';
import PendingDocumentSvg from '../../assets/svg/material_symbols_pending_actions_rounded';

const TaskCompleted = () => {
    const ProfileImage = require('../../assets/Png/ProfileIcon.png');
    const ProfileImage1 = require('../../assets/Png/ProfileIcon2.png');
    
    const taskData = [
        {
            id: '1',
            date: '21',
            time: '9 AM',
            title: 'Update Inventory at GB Market',
            subtasks: 2,
            priority: 'normal',
            comments: 4,
            users: [ProfileImage],
            userCount: 1,
            isUrgent: false
        },
        {
            id: '2',
            date: '22',
            time: '10 AM',
            title: 'Update Inventory at AB Market',
            subtasks: 2,
            priority: 'urgent',
            comments: 4,
            users: [ProfileImage, ProfileImage1],
            userCount: 4,
            isUrgent: true
        },
        {
            id: '3',
            date: '23',
            time: '11 AM',
            title: 'Update Inventory at GB Market',
            subtasks: 2,
            priority: 'normal',
            comments: 4,
            users: [ProfileImage],
            userCount: 1,
            isUrgent: false
        },
        {
            id: '4',
            date: '24',
            time: '12 AM',
            title: 'Update Inventory at AB Market',
            subtasks: 2,
            priority: 'urgent',
            comments: 4,
            users: [ProfileImage, ProfileImage1],
            userCount: 4,
            isUrgent: true
        },
        {
            id: '5',
            date: '25',
            time: '1 PM',
            title: 'Meeting with Gupta Traders',
            subtasks: 0,
            timeRange: '5:00 - 6:00 PM',
            priority: 'meeting',
            comments: 1,
            users: [ProfileImage],
            userCount: 1,
            isUrgent: false,
            isMeeting: true
        },
        {
            id: '6',
            date: '26',
            time: '2 PM',
            title: '',
            subtasks: 0,
            priority: 'normal',
            comments: 0,
            users: [],
            userCount: 0,
            isUrgent: false,
            isEmpty: true
        }
    ];

    const renderTaskItem = ({ item, index }) => {
        if (item.isEmpty) {
            return (
                <View style={Taskstyles.taskContainer}>
                    <View style={Taskstyles.timeSection}>
                        <Text style={Taskstyles.dateText}>{item.date}</Text>
                        <Text style={Taskstyles.timeText}>{item.time}</Text>
                    </View>
                    <View style={Taskstyles.verticalLine} />
                    <View style={Taskstyles.emptyTaskCard} />
                </View>
            );
        }

        return (
            <View style={Taskstyles.taskContainer}>
                <View style={Taskstyles.timeSection}>
                    <Text style={Taskstyles.dateText}>{item.date}</Text>
                    <Text style={Taskstyles.timeText}>{item.time}</Text>
                </View>
                <View style={Taskstyles.verticalLine} />
                <View style={[
                    Taskstyles.taskCard,
                    item.isMeeting ? Taskstyles.meetingCard : Taskstyles.normalCard
                ]}>
                    <View style={Taskstyles.taskHeader}>
                        <Text style={[
                            Taskstyles.taskTitle,
                            item.isMeeting ? Taskstyles.meetingTitle : Taskstyles.normalTitle
                        ]}>
                            {item.title}
                        </Text>
                        <View style={Taskstyles.rightSection}>
                            {item.isUrgent && (
                                <View style={Taskstyles.urgentBadge}>
                                    <RedFlag width={12} height={12} />
                                    <Text style={Taskstyles.urgentText}>Urgent</Text>
                                </View>
                            )}
                            {!item.isUrgent && !item.isMeeting && (
                                <View style={Taskstyles.normalBadge}>
                                    <SkyBlueFlag width={12} height={12} />
                                    <Text style={Taskstyles.normalText}>Normal</Text>
                                </View>
                            )}
                            <PendingDocumentSvg width={16} height={16} />
                        </View>
                    </View>
                    
                    {item.subtasks > 0 && (
                        <Text style={Taskstyles.subtaskText}>Subtasks ({item.subtasks})</Text>
                    )}
                    
                    {item.timeRange && (
                        <Text style={Taskstyles.timeRangeText}>{item.timeRange}</Text>
                    )}
                    
                    <View style={Taskstyles.taskFooter}>
                        <View style={Taskstyles.commentSection}>
                            <CommentIconSvg width={16} height={16} />
                            <Text style={Taskstyles.commentText}>{item.comments}</Text>
                        </View>
                        
                        <View style={Taskstyles.userSection}>
                            {item.users.slice(0, 2).map((user, userIndex) => (
                                <Image
                                    key={userIndex}
                                    source={user}
                                    style={[
                                        Taskstyles.userAvatar,
                                        userIndex > 0 && Taskstyles.overlappingAvatar
                                    ]}
                                />
                            ))}
                            {item.userCount > 2 && (
                                <Text style={Taskstyles.userCountText}>+ {item.userCount - 2} users</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={Taskstyles.safeArea}>
            <FlatList
                data={taskData}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Taskstyles.listContainer}
            />
        </SafeAreaView>
    );
};

export default TaskCompleted;

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
    },
    timeSection: {
        width: 60,
        alignItems: 'center',
        marginRight: 16,
        backgroundColor:'red'
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#999',
    },
    verticalLine: {
        width: 2,
        height: 80,
        backgroundColor: '#E5E5E5',
        marginRight: 16,
        marginTop: 8,
    },
    taskCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
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
        height: 2,
        backgroundColor: '#E5E5E5',
        marginTop: 16,
        borderRadius: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    normalTitle: {
        color: '#fff',
    },
    meetingTitle: {
        color: '#fff',
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
        fontSize: 10,
        fontWeight: '500',
    },
    normalText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    subtaskText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginBottom: 8,
    },
    timeRangeText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
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
        fontSize: 14,
        fontWeight: '500',
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
        color: '#fff',
        fontSize: 12,
        marginLeft: 8,
        fontWeight: '500',
    },
});