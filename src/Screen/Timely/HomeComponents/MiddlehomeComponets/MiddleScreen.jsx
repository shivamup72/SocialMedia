// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   useWindowDimensions,
//   ScrollView,
// } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import RedFlag from '../../../../assets/svg/RedFlag';
// import SkyBlueFlag from '../../../../assets/svg/SkyBlueFlag';
// import CommentIconSvg from '../../../../assets/svg/iconamoon_comment_light';
// import OpenDirectLink from '../../../../assets/svg/OpenDirectLink';
// import TimerClockSvg from '../../../../assets/svg/TimerClockSvg';
// import PendingDocumentSvg from '../../../../assets/svg/material_symbols_pending_actions_rounded';
// import {
//   fonts,
//   DarkColor,
//   DarkColor20,
//   DarkColor50,
//   mainOrangeColor,
//   mainOrange20,
//   mainOrange50,
//   mainWhiteColor,
//   mainOrange92,
//   DarkColor80,
//   mainGrayColor,
// } from '../../../../utils/style/fonts';
// import { GetTaskCalenderApi } from '../../../../Api/config/HomeApi';
// import CompletedTaskIcon from '../../../../assets/svg/completed_task_icon';
// import { GetMyFolderApi, GetMyNotesApi } from '../../../../Api/config/TimelyApi';
// import { formatDateTimeWithTime } from '../../../../utils/CommonUtils';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import RenderHTML from 'react-native-render-html';
// import NullCommonComponent from '../../../../components/NullCommonComponents';
// import { RfH, RfW } from '../../../../utils/helper';

// const MiddleScreen = ({ setDataList, Refresh, setRefresh }) => {
//   const navigation = useNavigation()
//   // console.log('MiddleScreen =====>');
//   const [activeTab, setActiveTab] = useState('tasks');
//   const [taskData, setTaskData] = useState([]);
//   console.log(taskData, "taskDatadddddd");

//   const [folderData, setFolderData] = useState([]);
//   console.log(folderData, "folderDatadddddd");

//   const [recentNotesData, setRecentNotesData] = useState([]);
//   const isFocused = useIsFocused();
//   const AstronotImage = require('../../../../assets/LoginAssets/png/StandingAstronot.png');

//   const profile1 = require('../../../../assets/Png/ProfileIcon.png');
//   const profile2 = require('../../../../assets/Png/ProfileIcon2.png');
//   const meetingImage = require('../../../../assets/AssestsComponents/Png/MeetingIcon.png');
//   const WorkIcon = require('../../../../assets/AssestsComponents/Png/WorkIcon.png');
//   const CallPhoneimage = require('../../../../assets/AssestsComponents/Png/CallPhoneIcon.png');
//   const AddWorkImage = require('../../../../assets/Png/PlusIcon.png');
//   const { width: windowWidth } = useWindowDimensions();

//   const fetchData = async () => {
//     try {
//       const res = await GetTaskCalenderApi({});
//       setTaskData(res?.results);

//       const folderRes = await GetMyFolderApi({});
//       // console.log('Folder Data Api check =====>',JSON.stringify(folderRes))
//       setFolderData(folderRes?.results);

//       const recentNotesRes = await GetMyNotesApi({});
//       // console.log('Recent Notes Data Api check =====>', JSON.stringify(recentNotesRes))
//       setRecentNotesData(recentNotesRes?.results);

//       setDataList([
//         {
//           completed: res?.completed,
//           pending: res?.pending,
//           completion_rate: res?.completion_rate,
//           completion_percentage: res?.completion_percentage,
//         },
//       ]);
//     } catch (err) {
//       console.log('err ========>', err);
//     } finally {
//       setRefresh(false);
//     }
//   };

//   const stripTrailingEmptyTags = html => {
//     if (!html) return '';
//     let cleanedHtml = html.trim();
//     const trailingTagsRegex =
//       /(<br\s*\/?>|<div>\s*(&nbsp;|<br\s*\/?>)*\s*<\/div>|\s|&nbsp;)*$/i;
//     return cleanedHtml.replace(trailingTagsRegex, '');
//   };

//   useEffect(() => {
//     fetchData();
//   }, [isFocused]);

//   useEffect(() => {
//     if (Refresh) {
//       fetchData();
//     }
//   }, [Refresh]);

//   const handleTaskPress = item => {
//     console.log('Task pressed ---=---->', item);
//     navigation.navigate('EventTypeScreen', { Data: item });
//   };

//   const renderTaskItem = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => handleTaskPress(item)}
//       style={styles.taskCard}>
//       <View style={styles.taskHeader}>
//         <Text
//           allowFontScaling={false}
//           style={styles.taskTitle}
//           numberOfLines={1}>
//           {item.title}
//         </Text>
//         <View>
//           {item.priority === 'high' && (
//             <View style={styles.urgentBadge}>
//               <RedFlag width={12} height={12} />
//               <Text style={styles.urgentText}>Urgent</Text>
//             </View>
//           )}
//           {item.priority === 'medium' && (
//             <View style={styles.normalBadge}>
//               <SkyBlueFlag width={12} height={12} color={'#EB8F00'} />
//               <Text style={styles.normalText}>Medium</Text>
//             </View>
//           )}

//           {item.priority === 'low' && (
//             <View style={styles.normalBadge}>
//               <SkyBlueFlag width={12} height={12} color={'#5BC2FC'} />
//               <Text style={styles.normalText}>Normal</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity
//           style={{ justifyContent: 'center', marginTop: 3, marginLeft: 5 }}>
//           {item?.event_type === 'task' && item?.status === 'completed' ? (
//             <CompletedTaskIcon width="18" height="18" color={'#40C0E7'} />
//           ) : (
//             <PendingDocumentSvg width={16} height={16} />
//           )}
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.subtasksText}>
//         Subtasks ({item.sub_tasks_count || 0})
//       </Text>

//       <View style={styles.taskFooter}>
//         <View style={styles.commentsContainer}>
//           <CommentIconSvg width="15" height="15" />
//           <Text allowFontScaling={false} style={styles.commentsText}>
//             {item.comments_count}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderFolderItem = ({ item }) => (
//     <View style={styles.folderCard}>
//       <View style={[styles.folderIcon, { backgroundColor: item.color }]}>
//         <Image
//           source={
//             item?.icon_type === 'meeting'
//               ? meetingImage
//               : item?.icon_type === 'work'
//                 ? WorkIcon
//                 : item?.icon_type === 'call'
//                   ? CallPhoneimage
//                   : profile1
//           }
//           style={styles.icon}
//         />
//       </View>
//       <Text
//         allowFontScaling={false}
//         style={styles.folderName}
//         numberOfLines={2}>
//         {item.name}
//       </Text>
//       <Text allowFontScaling={false} style={styles.folderCount}>
//         ({item.notes_count})
//       </Text>
//     </View>
//   );

//   const handleMovetoNotesScreen = item => {
//     // console.log('handleMovetoNotesScreen ====>', item)
//     navigation.navigate('AddNotesScreen', {
//       id: item?.id,
//       Edit: true,
//       noteData: item,
//     });
//   };

//   const renderNoteItem = ({ item }) => {
//     const cleanedHtml = stripTrailingEmptyTags(item.text);
//     return (
//       <View style={styles.noteCard}>
//         <View style={styles.noteHeader}>
//           <Text allowFontScaling={false} style={styles.noteTitle}>
//             {item?.check}
//           </Text>
//           <TouchableOpacity
//             onPress={() => {
//               handleMovetoNotesScreen(item);
//             }}>
//             <OpenDirectLink />
//           </TouchableOpacity>
//         </View>
//         {/* <Text
//           allowFontScaling={false}
//           style={styles.noteContent}
//           numberOfLines={2}>
//           {item?.text}
//         </Text> */}

//         <RenderHTML
//           contentWidth={windowWidth}
//           source={{ html: cleanedHtml }}
//           baseStyle={styles.noteContent}
//           tagsStyles={{
//             p: { margin: 0, padding: 0 },
//             div: { margin: 0, padding: 0 },
//           }}
//         />
//         <View style={styles.noteFooter}>
//           <TimerClockSvg />
//           <Text allowFontScaling={false} style={styles.noteTime}>
//             {formatDateTimeWithTime(item?.updated_at)}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const handleAddTask = () => {
//     navigation.navigate('TaskScreen');
//   };

//   const handleNotesAdd = () => {
//     console.log("Timelllly");
//     // navigation.navigate('Timely');
//   };

//   const emptyTasksState = (
//     <NullCommonComponent
//       title="Let's turn plans into action!"
//       subtitle="Start by setting up your first task."
//       buttonText="Create task"
//       onButtonPress={handleAddTask}
//       imageSource={AstronotImage}
//       borderColor="#FDBA74"
//     />
//   );

//   const emptyNotesState = (
//     <NullCommonComponent
//       title="Let's turn plans into action!"
//       subtitle="Start by setting up your first notes."
//       buttonText="Create Notes"
//       onButtonPress={handleNotesAdd}
//       imageSource={AstronotImage}
//       borderColor="#FDBA74"
//     />
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
//           onPress={() => setActiveTab('tasks')}>
//           <Text
//             allowFontScaling={false}
//             style={[
//               styles.tabText,
//               activeTab === 'tasks' && styles.activeTabText,
//             ]}>
//             My Tasks ({taskData?.length})
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
//           onPress={() => setActiveTab('notes')}>
//           <Text
//             allowFontScaling={false}
//             style={[
//               styles.tabText,
//               activeTab === 'notes' && styles.activeTabText,
//             ]}>
//             Notes ({recentNotesData?.length})
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {activeTab === 'tasks' ? (
//         <>
//           {taskData?.length === 0 ? (
//             emptyTasksState
//           ) : (
//             <View style={styles.tasksContainer}>
//               <FlatList
//                 data={taskData}
//                 renderItem={renderTaskItem}
//                 keyExtractor={item => item.id}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.flatListContainer1}
//                 ItemSeparatorComponent={() => (
//                   <View style={styles.itemSeparator} />
//                 )}
//               />
//             </View>
//           )}

//           {/* <AwaitingComponents /> */}
//         </>
//       ) : (
//         <View style={styles.notesContainer}>
//           <View style={styles.sectionHeader}>
//             <Text allowFontScaling={false} style={styles.sectionTitle}>
//               Folders ({folderData?.length})
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Timely')}>
//               <Text allowFontScaling={false} style={styles.viewAllText}>
//                 View All
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <FlatList
//             data={folderData}
//             renderItem={renderFolderItem}
//             keyExtractor={item => item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.folderListContainer}
//             style={styles.folderList}
//           />

//           <Text style={styles.sectionTitle}>Recent Notes</Text>

//           {/* </View> */}

//           <FlatList
//             data={recentNotesData}
//             renderItem={renderNoteItem}
//             keyExtractor={item => item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             ListEmptyComponent={emptyNotesState}
//             contentContainerStyle={styles.flatListContainer}
//             ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   folderCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     borderColor: mainOrangeColor,
//     paddingHorizontal: RfW(20),
//     height: RfH(110),
//     borderLeftWidth: 2,
//     // iOS shadow
//     shadowColor: '#8384EF',
//     shadowOffset: { width: 1, height: 1 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     // Android shadow
//     elevation: 4,
//   },

//   folderIcon: {
//     width: 35,
//     height: 35,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   icon: {
//     width: 25,
//     height: 25,
//     resizeMode: 'contain',
//   },
//   folderName: {
//     fontSize: 10,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor,
//     textAlign: 'center',
//     marginBottom: 4,
//     width: '100%',
//   },
//   folderCount: {
//     fontSize: 10,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor50,
//     textAlign: 'center',
//   },
//   folderListContainer: {
//     paddingVertical: 10,
//     paddingTop: 0,
//     paddingRight: 16,
//     paddingBottom: 0,
//     // backgroundColor:'red',
//   },
//   folderList: {
//     flexGrow: 0,
//     height: 120,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     paddingHorizontal: 16,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#ffffff',
//     borderRadius: 15,
//     padding: 6,
//     marginBottom: 10,
//     shadowColor: '#A6A6A640',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     paddingHorizontal: RfW(10),
//     justifyContent: 'space-between'
//   },
//   tab: {
//     // flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 10,
//     backgroundColor: '#F9F9F9',
//     width: '48%'
//     // paddingHorizontal: RfW(40)
//   },
//   activeTab: {
//     backgroundColor: mainOrangeColor,
//   },
//   tabText: {
//     fontSize: 14,
//     color: DarkColor50,
//     fontFamily: fonts.PoppinsMedium,
//   },
//   activeTabText: {
//     color: '#FFFFFF',
//     fontFamily: fonts.PoppinsMedium,
//   },
//   tasksContainer: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     borderRadius: 15,
//     padding: 10,
//     shadowColor: '#A6A6A640',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     minHeight: 250,
//   },
//   notesContainer: {
//     flex: 1,
//     backgroundColor: mainWhiteColor,
//     padding: 10,
//     paddingVertical: 20,
//     borderRadius: 20,
//   },
//   flatListContainer1: {
//     paddingBottom: 10, // Add some padding at the bottom
//     height: 150,
//   },

//   flatListContainer: {
//     marginBottom: 10,
//   },
//   itemSeparator: {
//     width: 12,
//   },
//   taskCard: {
//     backgroundColor: mainOrange92,
//     borderRadius: 4,
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     width: '100%',
//     height: 74,
//     marginBottom: 0,
//     marginBottom: 10,
//   },
//   taskHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     // marginBottom: 8,
//   },
//   taskTitle: {
//     fontSize: 10,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor,
//     flex: 1,
//     marginRight: 8,
//     marginTop: 2,
//   },
//   priorityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF80',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 2,
//   },
//   priorityText: {
//     fontSize: 8,
//     marginLeft: 4,
//     marginRight: 8,
//     fontFamily: fonts.PoppinsLight,
//     color: DarkColor80,
//   },
//   urgentText: {
//     color: '#ffffff',
//     fontSize: 8,
//     fontFamily: fonts.PoppinsRegular,
//   },
//   normalText: {
//     color: '#ffffff',
//     fontSize: 8,
//     fontFamily: fonts.PoppinsRegular,
//   },

//   urgentBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   normalBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   subtasksText: {
//     fontSize: 9,
//     color: mainWhiteColor,
//     fontFamily: fonts.PoppinsLight,
//     // marginBottom: 12,
//   },
//   taskFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   commentsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   commentsText: {
//     fontSize: 10,
//     color: '#FFFFFF',
//     marginLeft: 4,
//   },
//   collaboratorsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   collaboratorImage: {
//     width: 20,
//     height: 20,
//     borderRadius: 12,
//     borderWidth: 0.5,
//     borderColor: '#FFFFFF',
//   },
//   assigneeImage: {
//     width: 20,
//     height: 20,
//     borderRadius: 16,
//     borderWidth: 0.5,
//     borderColor: '#FFFFFF',
//   },
//   moreCollaborators: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     marginLeft: 8,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontFamily: fonts.PoppinsMedium,
//     color: DarkColor,
//     marginBottom: 5,
//     // marginTop:20,
//   },
//   viewAllText: {
//     fontSize: 12,
//     color: '#FF8C42',
//     fontFamily: fonts.PoppinsMedium,
//     textDecorationLine: 'underline',
//   },

//   noteCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     width: RfW(240),
//     minHeight: RfH(120),
//     height: RfH(120),
//     borderLeftWidth: 4,
//     borderLeftColor: '#FF8C42',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//     borderRightWidth: 1,
//     borderRightColor: '#E2E8F0',
//   },
//   noteHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // marginBottom: 4,
//   },
//   noteTitle: {
//     fontSize: 10,
//     fontFamily: fonts.PoppinsSemiBold,
//     color: DarkColor,
//     flex: 1,
//   },
//   noteCategory: {
//     fontSize: 10,
//     color: DarkColor50,
//     marginBottom: 4,
//   },
//   noteContent: {
//     fontSize: 12,
//     color: DarkColor50,
//     lineHeight: 20,
//     marginBottom: 12,
//     fontFamily: fonts.PoppinsLight,
//     height: 40,
//   },
//   noteFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   noteTime: {
//     fontSize: 10,
//     color: DarkColor50,
//     marginLeft: 4,
//     marginTop: 3,
//     fontFamily: fonts.PoppinsLight,
//   },
//   icon: {
//     width: 35,
//     height: 35,
//     resizeMode: 'contain',
//   },
// });

// export default MiddleScreen;




import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import RedFlag from '../../../../assets/svg/RedFlag';
import SkyBlueFlag from '../../../../assets/svg/SkyBlueFlag';
import CommentIconSvg from '../../../../assets/svg/iconamoon_comment_light';
import OpenDirectLink from '../../../../assets/svg/OpenDirectLink';
import TimerClockSvg from '../../../../assets/svg/TimerClockSvg';
import PendingDocumentSvg from '../../../../assets/svg/material_symbols_pending_actions_rounded';
import {
  fonts,
  DarkColor,
  DarkColor20,
  DarkColor50,
  mainOrangeColor,
  mainOrange20,
  mainOrange50,
  mainWhiteColor,
  mainOrange92,
  DarkColor80,
  mainGrayColor,
} from '../../../../utils/style/fonts';
import { GetTaskCalenderApi } from '../../../../Api/config/HomeApi';
import CompletedTaskIcon from '../../../../assets/svg/completed_task_icon';
import { GetMyFolderApi, GetMyNotesApi } from '../../../../Api/config/TimelyApi';
import { formatDateTimeWithTime } from '../../../../utils/CommonUtils';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import RenderHTML from 'react-native-render-html';
import NullCommonComponent from '../../../../components/NullCommonComponents';
import { RfH, RfW } from '../../../../utils/helper';
import AddWorkComponents from '../../MyNotesComponents/AddWorkNotesComponents';

const MiddleScreen = ({ setDataList, Refresh, setRefresh }) => {
  const navigation = useNavigation()
  // console.log('MiddleScreen =====>');
  const [activeTab, setActiveTab] = useState('tasks');
  const [taskData, setTaskData] = useState([]);
  // console.log(taskData, "taskDatadddddd");
  const [showMainModal, setShowMainModal] = useState(false);
  const [folderData, setFolderData] = useState([]);
  // console.log(folderData, "folderDatadddddd");
  const [folderToEdit, setFolderToEdit] = useState(null);
  const [EditType, setEditType] = useState('noraml');
  const [refreshing, setRefreshing] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [recentNotesData, setRecentNotesData] = useState([]);
  const isFocused = useIsFocused();
  const AstronotImage = require('../../../../assets/LoginAssets/png/StandingAstronot.png');
  const profile1 = require('../../../../assets/Png/ProfileIcon.png');
  const profile2 = require('../../../../assets/Png/ProfileIcon2.png');
  const meetingImage = require('../../../../assets/AssestsComponents/Png/MeetingIcon.png');
  const WorkIcon = require('../../../../assets/AssestsComponents/Png/WorkIcon.png');
  const CallPhoneimage = require('../../../../assets/AssestsComponents/Png/CallPhoneIcon.png');
  const AddWorkImage = require('../../../../assets/Png/PlusIcon.png');
  const { width: windowWidth } = useWindowDimensions();

  const fetchData = async () => {
    try {
      const res = await GetTaskCalenderApi({});
      setTaskData(res?.results);

      const folderRes = await GetMyFolderApi({});
      // console.log('Folder Data Api check =====>',JSON.stringify(folderRes))
      setFolderData(folderRes?.results);

      const recentNotesRes = await GetMyNotesApi({});
      // console.log('Recent Notes Data Api check =====>', JSON.stringify(recentNotesRes))
      setRecentNotesData(recentNotesRes?.results);

      setDataList([
        {
          completed: res?.completed,
          pending: res?.pending,
          completion_rate: res?.completion_rate,
          completion_percentage: res?.completion_percentage,
        },
      ]);
    } catch (err) {
      console.log('err ========>', err);
    } finally {
      setRefresh(false);
    }
  };

  const stripTrailingEmptyTags = html => {
    if (!html) return '';
    let cleanedHtml = html.trim();
    const trailingTagsRegex =
      /(<br\s*\/?>|<div>\s*(&nbsp;|<br\s*\/?>)*\s*<\/div>|\s|&nbsp;)*$/i;
    return cleanedHtml.replace(trailingTagsRegex, '');
  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    if (Refresh) {
      fetchData();
    }
  }, [Refresh]);

  const handleTaskPress = item => {
    console.log('Task pressed ---=---->', item);
    navigation.navigate('EventTypeScreen', { Data: item });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleTaskPress(item)}
      style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text
          allowFontScaling={false}
          style={styles.taskTitle}
          numberOfLines={1}>
          {item.title}
        </Text>
        <View>
          {item.priority === 'high' && (
            <View style={styles.urgentBadge}>
              <RedFlag width={12} height={12} />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
          {item.priority === 'medium' && (
            <View style={styles.normalBadge}>
              <SkyBlueFlag width={12} height={12} color={'#EB8F00'} />
              <Text style={styles.normalText}>Medium</Text>
            </View>
          )}

          {item.priority === 'low' && (
            <View style={styles.normalBadge}>
              <SkyBlueFlag width={12} height={12} color={'#5BC2FC'} />
              <Text style={styles.normalText}>Normal</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={{ justifyContent: 'center', marginTop: 3, marginLeft: 5 }}>
          {item?.event_type === 'task' && item?.status === 'completed' ? (
            <CompletedTaskIcon width="18" height="18" color={'#40C0E7'} />
          ) : (
            <PendingDocumentSvg width={16} height={16} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtasksText}>
        Subtasks ({item.sub_tasks_count || 0})
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.commentsContainer}>
          <CommentIconSvg width="15" height="15" />
          <Text allowFontScaling={false} style={styles.commentsText}>
            {item.comments_count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }) => (
    <View style={styles.folderCard}>
      <View style={[styles.folderIcon, { backgroundColor: item.color }]}>
        <Image
          source={
            item?.icon_type === 'meeting'
              ? meetingImage
              : item?.icon_type === 'work'
                ? WorkIcon
                : item?.icon_type === 'call'
                  ? CallPhoneimage
                  : profile1
          }
          style={styles.icon}
        />
      </View>
      <Text
        allowFontScaling={false}
        style={styles.folderName}
        numberOfLines={2}>
        {item.name}
      </Text>
      <Text allowFontScaling={false} style={styles.folderCount}>
        ({item.notes_count})
      </Text>
    </View>
  );

  const handleMovetoNotesScreen = item => {
    // console.log('handleMovetoNotesScreen ====>', item)
    navigation.navigate('AddNotesScreen', {
      id: item?.id,
      Edit: true,
      noteData: item,
    });
  };

  const renderNoteItem = ({ item }) => {
    const cleanedHtml = stripTrailingEmptyTags(item.text);
    return (
      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text allowFontScaling={false} style={styles.noteTitle}>
            {item?.check}
          </Text>
          <TouchableOpacity
            onPress={() => {
              handleMovetoNotesScreen(item);
            }}>
            <OpenDirectLink />
          </TouchableOpacity>
        </View>
        {/* <Text
          allowFontScaling={false}
          style={styles.noteContent}
          numberOfLines={2}>
          {item?.text}
        </Text> */}

        <RenderHTML
          contentWidth={windowWidth}
          source={{ html: cleanedHtml }}
          baseStyle={styles.noteContent}
          tagsStyles={{
            p: { margin: 0, padding: 0 },
            div: { margin: 0, padding: 0 },
          }}
        />
        <View style={styles.noteFooter}>
          <TimerClockSvg />
          <Text allowFontScaling={false} style={styles.noteTime}>
            {formatDateTimeWithTime(item?.updated_at)}
          </Text>
        </View>
      </View>
    );
  };

  const handleAddTask = () => {
    navigation.navigate('TaskScreen');
  };

  const handleNotesAdd = () => {
    // setShowMainModal(true);
    // setEditType('normal');
    navigation.navigate('MyNoteScreen', { flag: 'flag' });
  };
  const handleCloseMainModal = () => {
    setShowMainModal(false);
  };

  const handleOpenFolder = () => {
    setShowMainModal(false);
    setShowFolderModal(true);
  };

  const handleCloseFolderModal = () => {
    setShowFolderModal(false);
    setFolderToEdit(null);
  };


  const emptyTasksState = (
    <NullCommonComponent
      title="Let's turn plans into action!"
      subtitle="Start by setting up your first task."
      buttonText="Create task"
      onButtonPress={handleAddTask}
      imageSource={AstronotImage}
      borderColor="#FDBA74"
    />
  );

  const emptyNotesState = (
    <NullCommonComponent
      title="Let's turn plans into action!"
      subtitle="Start by setting up your first notes."
      buttonText="Create Notes"
      onButtonPress={handleNotesAdd}
      imageSource={AstronotImage}
      borderColor="#FDBA74"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}>
          <Text
            allowFontScaling={false}
            style={[
              styles.tabText,
              activeTab === 'tasks' && styles.activeTabText,
            ]}>
            My Tasks ({taskData?.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}>
          <Text
            allowFontScaling={false}
            style={[
              styles.tabText,
              activeTab === 'notes' && styles.activeTabText,
            ]}>
            Notes ({recentNotesData?.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tasks' ? (
        <>
          {taskData?.length === 0 ? (
            emptyTasksState
          ) : (
            <View style={styles.tasksContainer}>
              <FlatList
                data={taskData}
                renderItem={renderTaskItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer1}
                ItemSeparatorComponent={() => (
                  <View style={styles.itemSeparator} />
                )}
              />
            </View>
          )}

          {/* <AwaitingComponents /> */}
        </>
      ) : (
        <View style={styles.notesContainer}>
          {folderData.length === 0 ? (
            null // or you can use <Text>No folders found</Text> or a custom component
          ) : (<View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Folders ({folderData?.length})
            </Text>
            {/* <TouchableOpacity onPress={() => navigation.navigate('MyNotesScreen')}> */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              navigation.navigate('MyNoteScreen', { flag: 'flag' });
            }}>
              <Text allowFontScaling={false} style={styles.viewAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>)}

          {folderData.length === 0 ? (
            null // or you can use <Text>No folders found</Text> or a custom component
          ) : (
            <FlatList
              data={folderData}
              renderItem={renderFolderItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.folderListContainer}
              style={styles.folderList}
            />
          )}

          <Text style={styles.sectionTitle}>Recent Notes</Text>

          {/* </View> */}

          <FlatList
            data={recentNotesData}
            renderItem={renderNoteItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={emptyNotesState}
            contentContainerStyle={styles.flatListContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </View>
      )}
      <AddWorkComponents
        visible={showMainModal}
        showFolderModal={showFolderModal}
        onClose={handleCloseMainModal}
        onOpenFolder={handleOpenFolder}
        onCloseFolder={handleCloseFolderModal}
        setRefreshing={setRefreshing}
        editingData={folderToEdit}
        edit={EditType}
        onCreateFolder={async (name, color) => {
          try {
            setRefreshing(true);
            await fetchData();
          } catch (error) {
            console.log('Error refreshing data:', error);
          } finally {
            setRefreshing(false);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  folderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderColor: mainOrangeColor,
    paddingHorizontal: RfW(20),
    height: RfH(110),
    borderLeftWidth: 2,
    // iOS shadow
    shadowColor: '#8384EF',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Android shadow
    elevation: 4,
  },

  folderIcon: {
    width: 35,
    height: 35,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  folderName: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
  },
  folderCount: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor50,
    textAlign: 'center',
  },
  folderListContainer: {
    paddingVertical: 10,
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 0,
    // backgroundColor:'red',
  },
  folderList: {
    flexGrow: 0,
    height: 120,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 6,
    marginBottom: 10,
    shadowColor: '#A6A6A640',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: RfW(10),
    justifyContent: 'space-between'
  },
  tab: {
    // flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    width: '48%'
    // paddingHorizontal: RfW(40)
  },
  activeTab: {
    backgroundColor: mainOrangeColor,
  },
  tabText: {
    fontSize: 14,
    color: DarkColor50,
    fontFamily: fonts.PoppinsMedium,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: fonts.PoppinsMedium,
  },
  tasksContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: RfH(10),
    shadowColor: '#A6A6A640',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: RfH(250),
  },
  notesContainer: {
    // flex: 1,
    backgroundColor: mainWhiteColor,
    padding: RfH(10),
    paddingVertical: RfH(20),
    borderRadius: 20,
    width: '100%'
  },
  flatListContainer1: {
    paddingBottom: RfH(10), // Add some padding at the bottom
    height: RfH(150),
  },

  flatListContainer: {
    marginBottom: RfH(10),
  },
  itemSeparator: {
    width: RfW(12),
  },
  taskCard: {
    backgroundColor: mainOrange92,
    borderRadius: 4,
    paddingVertical: RfH(8),
    paddingHorizontal: RfW(8),
    width: '100%',
    height: RfH(74),
    marginBottom: 0,
    marginBottom: RfH(10),
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: 8,
  },
  taskTitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    flex: 1,
    marginRight: 8,
    marginTop: 2,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  priorityText: {
    fontSize: 8,
    marginLeft: RfW(4),
    marginRight: RfW(8),
    fontFamily: fonts.PoppinsLight,
    color: DarkColor80,
  },
  urgentText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  normalText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
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
    paddingHorizontal: RfW(8),
    paddingVertical: RfH(4),
    borderRadius: 12,
    gap: 4,
  },
  subtasksText: {
    fontSize: 9,
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsLight,
    // marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  collaboratorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorImage: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
  },
  assigneeImage: {
    width: RfW(20),
    height: RfH(20),
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
  },
  moreCollaborators: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 5,
    // marginTop:20,
  },
  viewAllText: {
    fontSize: 12,
    color: '#FF8C42',
    fontFamily: fonts.PoppinsMedium,
    textDecorationLine: 'underline',
  },

  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: RfW(240),
    minHeight: RfH(120),
    height: RfH(120),
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 4,
  },
  noteTitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    flex: 1,
  },
  noteCategory: {
    fontSize: 10,
    color: DarkColor50,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 12,
    color: DarkColor50,
    lineHeight: 20,
    marginBottom: RfH(12),
    fontFamily: fonts.PoppinsLight,
    height: RfH(40),
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTime: {
    fontSize: 10,
    color: DarkColor50,
    marginLeft: 4,
    marginTop: 3,
    fontFamily: fonts.PoppinsLight,
  },
  icon: {
    width: RfW(35),
    height: RfH(35),
    resizeMode: 'contain',
  },
});

export default MiddleScreen;
