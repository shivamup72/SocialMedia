// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   Image,
//   TouchableOpacity,
// } from 'react-native';
// import { DarkCOlor30 } from '../../../utils/style/fonts';
// import LeftArrowSvg from '../../../assets/svg/LeftArrowSvg';
// import Avatar from '../../../components/AvatarComponents/Avatar';
// import CustomText from '../../../utils/CustomText';

// const fonts = {
//   PoppinsRegular: 'Poppins-Regular',
//   PoppinsMedium: 'Poppins-Medium',
// };
// const mainOrangeColor = '#FF7A00';
// const DarkColor = '#212121';
// const DarkColor60 = '#828282';

// // Placeholder for the arrow icon. In a real app, this would be an SVG component.
// const RightArrowIcon = () => (
//   <LeftArrowSvg width={15} height={15} color={DarkColor60} />
// );

// // Data derived from the visual elements in the image.

// const groupData = {
//   id: '1',
//   name: 'Riggle Distribution Force',
//   icon: require('../../../assets/Png/ProfileIcon2.png'), // Placeholder path
//   locationIcon: require('../../../assets/Png/ProfileIcon2.png'), // Placeholder path
// };

// const SharedContentScreen = ({ navigation, MembersList, CommonGroup }) => {
//   // console.log('\n', 'MembersList share data ====>', CommonGroup, '\n');
//   const [activeTab, setActiveTab] = useState('Media');

//   const tabs = ['Media', 'Audio', 'Docs'];
//   const renderMediaItem = ({ item }) => (
//     <View style={styles.mediaItemContainer}>
//       <Image
//         source={{ uri: item.url }}
//         style={styles.mediaImage}
//         resizeMode="cover"
//       />
//     </View>
//   );

//   const handleGroupPress = item => {
//     navigation.navigate('ChatWindows', {
//       conversationId: item?.conversation,
//       isGroup: item?.is_group,
//       GroupId: item?.id,
//       name: item?.name,
//       avatar: item?.profile_picture,
//       type: 'old',
//     });
//   };

//   const renderGroupItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.groupItem}
//       onPress={() => handleGroupPress(item)}>
//       <View style={styles.groupIconContainer}>
//         <Avatar
//           avatarUri={item?.profile_picture}
//           size={45}
//           borderRadius={30}
//           fontSize={16}
//           name={item?.name}
//         />
//       </View>
//       <CustomText style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">
//         {item.name}
//       </CustomText>
//     </TouchableOpacity>
//   );

//   console.log('\n', 'MembersList share data ====>', CommonGroup, '\n');

//   return (
//     <View style={styles.container}>
//       {/* Tab Navigator Header */}
//       <View style={styles.tabContainer}>
//         {tabs.map(tab => (
//           <TouchableOpacity
//             key={tab}
//             style={styles.tab}
//             onPress={() => setActiveTab(tab)}>
//             <CustomText
//               style={[
//                 styles.tabText,
//                 activeTab === tab && styles.activeTabText,
//               ]}>
//               {tab}
//             </CustomText>
//             {activeTab === tab && <View style={styles.activeTabIndicator} />}
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Media Section */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <CustomText style={styles.sectionTitle}>Media</CustomText>
//           <TouchableOpacity style={styles.seeAllButton}>
//             <CustomText style={styles.itemCount}>
//               {MembersList?.items?.length || 0}
//             </CustomText>
//             <RightArrowIcon />
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={MembersList?.items}
//           renderItem={renderMediaItem}
//           keyExtractor={item => `${item.id}`}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           ListEmptyComponent={
//             <CustomText
//               style={{ color: DarkColor60, fontFamily: fonts.PoppinsRegular }}>
//               No media found
//             </CustomText>
//           }
//         />
//       </View>

//       <View style={styles.separator} />
//       {console.log('common group name -=-==-=-=---->', JSON.stringify(CommonGroup))}
//       <View style={styles.groupsSection}>
//         <CustomText style={styles.sectionTitle}>
//           common Groups ({CommonGroup?.length || 0})
//         </CustomText>
//         <FlatList
//           data={CommonGroup || []}
//           renderItem={renderGroupItem}
//           keyExtractor={item => `group_${item.id}`}
//           ListEmptyComponent={
//             <CustomText
//               style={{ color: DarkColor60, fontFamily: fonts.PoppinsRegular }}>
//               No groups found
//             </CustomText>
//           }
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 24 }}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     marginTop: 10,
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F2F2F2',
//   },
//   tab: {
//     paddingHorizontal: 5,
//     paddingBottom: 10,
//     alignItems: 'center',
//   },
//   tabText: {
//     fontSize: 16,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor60,
//   },
//   activeTabText: {
//     fontFamily: fonts.PoppinsMedium,
//     color: mainOrangeColor,
//   },
//   activeTabIndicator: {
//     height: 3,
//     width: '100%',
//     backgroundColor: mainOrangeColor,
//     marginTop: 8,
//     borderRadius: 2,
//   },
//   section: {
//     paddingHorizontal: 16,
//     paddingVertical: 24,
//     paddingTop: 5,
//   },
//   groupsSection: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontFamily: fonts.PoppinsMedium,
//     color: DarkColor,
//     // Add some bottom margin to separate title from list
//     marginBottom: 16,
//   },
//   seeAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   itemCount: {
//     fontSize: 14,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor60,
//     marginRight: 8,
//   },
//   arrowText: {
//     fontSize: 18,
//     color: DarkColor60,
//     fontWeight: 'bold',
//   },
//   mediaItemContainer: {
//     borderWidth: 1,
//     borderColor: DarkCOlor30,
//     width: 86,
//     height: 86,
//     borderRadius: 12,
//     marginRight: 10,
//   },
//   mediaImage: {
//     width: 85,
//     height: 85,
//     borderRadius: 12,
//     marginRight: 12,
//   },
//   separator: {
//     height: 8,
//     backgroundColor: '#F7F7F7',
//   },
//   groupItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // Removed marginTop, spacing is now handled by sectionTitle margin
//     // and FlatList's item separators if you were to add them.
//     marginBottom: 16, // Add margin between group items
//   },
//   groupIconContainer: {
//     // borderWidth: 1,
//     // borderColor: DarkCOlor30,
//     // width: 55,
//     // height: 55,
//     // borderRadius: 27,
//   },
//   groupIcon: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//   },
//   groupName: {
//     fontSize: 14,
//     fontFamily: fonts.PoppinsMedium,
//     color: DarkColor,
//     marginLeft: 12,
//     flex: 1,
//   },
//   locationIcon: {
//     width: 20,
//     height: 20,
//     resizeMode: 'contain',
//   },
// });

// export default SharedContentScreen;
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import CustomText from '../../../utils/CustomText';
import { Image } from 'react-native';
import LeftArrowSvg from '../../../assets/svg/LeftArrowSvg';
import { DarkColor, mainWhiteColor } from '../../../utils/style/fonts';
import CatchComponents from '../../../Screen/Timely/HomeComponents/Catch_up_components/CatchComponents';

const fonts = {
  PoppinsRegular: 'Poppins-Regular',
  PoppinsMedium: 'Poppins-Medium',
};

// const DarkColor = '#212121';
const DarkColor60 = '#7A7A7A';

const RightArrowIcon = () => (
  <View style={{ transform: [{ rotate: '180deg' }] }}>
    <LeftArrowSvg width={14} height={14} color={DarkColor60} />
  </View>
);

const SharedContentScreen = ({ navigation }) => {
  const handlePress = (type) => {
    console.log(type);
  };

  // Map emoji to image source
  const iconMap = {
    Media: require('../../../assets/ChatAssets/png/media.webp'), // replace with your actual image path
    Starred: require('../../../assets/ChatAssets/png/star.webp'),
    AISummaries: require('../../../assets/ChatAssets/png/aisummari.webp'),
    Groups: require('../../../assets/ChatAssets/png/group.webp'),
  };

  const Row = ({ title, emoji, onPress, showDivider }) => (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.left}>
          <Image
            source={iconMap[emoji]}
            style={{ width: 23, height: 25, marginRight: 12 }}
            resizeMode="contain"
          />
          <CustomText style={styles.text}>{title}</CustomText>
        </View>
        <LeftArrowSvg height='18' width='6' />
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </>
  );

  return (
    <View style={styles.container}>

      {/* 🔹 Top Box (3 items inside) */}
      <View style={styles.card}>
        <Row
          title="Media Links And Docs"
          emoji="Media"
          onPress={() => handlePress('media')}
          showDivider
        />
        <Row
          title="Starred Messages"
          emoji="Starred"
          onPress={() => handlePress('starred')}
          showDivider
        />
        <Row
          title="AI Summaries"
          emoji="AISummaries"
          onPress={() => handlePress('ai')}
        />
      </View>

      {/* 🔹 Bottom Box */}
      <View style={styles.card}>
        <Row
          title="Groups In Common"
          emoji="Groups"
          onPress={() => handlePress('groups')}
        />
      </View>
      <View>
        <CatchComponents />
      </View>
    </View>
  );
};

export default SharedContentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
    paddingHorizontal: 10,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    fontSize: 18,
    marginRight: 12,
  },

  text: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },

  divider: {
    height: 1,
    backgroundColor: '#DCDCDC',
  },
});