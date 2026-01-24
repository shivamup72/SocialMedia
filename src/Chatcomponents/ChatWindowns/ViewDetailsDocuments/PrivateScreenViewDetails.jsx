import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { DarkCOlor30 } from '../../../utils/style/fonts';
import LeftArrowSvg from '../../../assets/svg/LeftArrowSvg';
import Avatar from '../../../components/AvatarComponents/Avatar';

const fonts = {
  PoppinsRegular: 'Poppins-Regular',
  PoppinsMedium: 'Poppins-Medium',
};
const mainOrangeColor = '#FF7A00';
const DarkColor = '#212121';
const DarkColor60 = '#828282';

// Placeholder for the arrow icon. In a real app, this would be an SVG component.
const RightArrowIcon = () => (
  <LeftArrowSvg width={15} height={15} color={DarkColor60} />
);

// Data derived from the visual elements in the image.

const groupData = {
  id: '1',
  name: 'Riggle Distribution Force',
  icon: require('../../../assets/Png/ProfileIcon2.png'), // Placeholder path
  locationIcon: require('../../../assets/Png/ProfileIcon2.png'), // Placeholder path
};

const SharedContentScreen = ({ navigation, MembersList, CommonGroup }) => {
  // console.log('\n', 'MembersList share data ====>', CommonGroup, '\n');
  const [activeTab, setActiveTab] = useState('Media');

  const tabs = ['Media', 'Audio', 'Docs'];
  const renderMediaItem = ({ item }) => (
    <View style={styles.mediaItemContainer}>
      <Image
        source={{ uri: item.url }}
        style={styles.mediaImage}
        resizeMode="cover"
      />
    </View>
  );

  const handleGroupPress = item => {
    navigation.navigate('ChatWindows', {
      conversationId: item?.conversation,
      isGroup: item?.is_group,
      GroupId: item?.id,
      name: item?.name,
      avatar: item?.profile_picture,
      type: 'old',
    });
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupPress(item)}>
      <View style={styles.groupIconContainer}>
        <Avatar
          avatarUri={item?.profile_picture}
          size={45}
          borderRadius={30}
          fontSize={16}
          name={item?.name}
        />
      </View>
      <Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  console.log('\n', 'MembersList share data ====>', CommonGroup, '\n');

  return (
    <View style={styles.container}>
      {/* Tab Navigator Header */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Media Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Media</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.itemCount}>
              {MembersList?.items?.length || 0}
            </Text>
            <RightArrowIcon />
          </TouchableOpacity>
        </View>

        <FlatList
          data={MembersList?.items}
          renderItem={renderMediaItem}
          keyExtractor={item => `${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{ color: DarkColor60, fontFamily: fonts.PoppinsRegular }}>
              No media found
            </Text>
          }
        />
      </View>

      <View style={styles.separator} />
      {console.log('common group name -=-==-=-=---->', CommonGroup)}
      <View style={styles.groupsSection}>
        <Text style={styles.sectionTitle}>
          common Groups ({CommonGroup?.length || 0})
        </Text>
        <FlatList
          data={CommonGroup || []}
          renderItem={renderGroupItem}
          keyExtractor={item => `group_${item.id}`}
          ListEmptyComponent={
            <Text
              style={{ color: DarkColor60, fontFamily: fonts.PoppinsRegular }}>
              No groups found
            </Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  tab: {
    paddingHorizontal: 5,
    paddingBottom: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
  },
  activeTabText: {
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: mainOrangeColor,
    marginTop: 8,
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 5,
  },
  groupsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    // Add some bottom margin to separate title from list
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginRight: 8,
  },
  arrowText: {
    fontSize: 18,
    color: DarkColor60,
    fontWeight: 'bold',
  },
  mediaItemContainer: {
    borderWidth: 1,
    borderColor: DarkCOlor30,
    width: 86,
    height: 86,
    borderRadius: 12,
    marginRight: 10,
  },
  mediaImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    marginRight: 12,
  },
  separator: {
    height: 8,
    backgroundColor: '#F7F7F7',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // Removed marginTop, spacing is now handled by sectionTitle margin
    // and FlatList's item separators if you were to add them.
    marginBottom: 16, // Add margin between group items
  },
  groupIconContainer: {
    // borderWidth: 1,
    // borderColor: DarkCOlor30,
    // width: 55,
    // height: 55,
    // borderRadius: 27,
  },
  groupIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  groupName: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginLeft: 12,
    flex: 1,
  },
  locationIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default SharedContentScreen;
