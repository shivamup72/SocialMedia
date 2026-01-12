import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, {useState, useEffect, useMemo, useCallback} from 'react';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import SearchSvg from '../../assets/svg/SearchSvg';
import {
  mainOrangeColor,
  DarkColor,
  DarkColor80,
  fonts,
} from '../../style/fonts';
import {GetUserListingApi} from '../../config/HomeApi';
import Avatar from '../../components/AvatarComponents/Avatar';

const MembersStatusListing = ({navigation, route}) => {
  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [membersOfflineLength, setMembersOfflineLength] = useState(null);

  const fetchMembers = async () => {
    try {
      setRefreshing(true);
      const response = await GetUserListingApi({page: 1, page_size: 60});
      if (response?.results) {
        console.log('response -=-=-=-=----->', response?.results, '\n', '\n');
        const isOffline = response?.results.map(
          member =>
            member?.activities === null ||
            (member?.activities?.start === '' &&
              member?.activities?.end === ''),
        );

        setMembersOfflineLength(isOffline?.length);
        setMembers(response.results);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRefresh = () => {
    fetchMembers();
  };

  const renderMemberItem = ({item}) => {
    const isOffline =
      item?.activities === null ||
      (item?.activities?.start === '' && item?.activities?.end === '');

    // console.log('isOffline -=-=-=-=-=-=--------->', isOffline, '\n', '\n');
    return (
      <TouchableOpacity style={styles.memberItem}>
        <View style={styles.avatarContainer}>
          <Avatar
            avatarUri={item?.profile_picture}
            name={item?.first_name + ' ' + item?.last_name || item?.email}
            email={item?.email}
            size={50}
            borderRadius={30}
            fontSize={18}
          />
        </View>
        <View style={{flex: 1}}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName} numberOfLines={2}>
              {item?.first_name?.trim() === '' && item?.last_name?.trim() === ''
                ? item?.email
                : `${item?.first_name} ${item?.last_name}`}
            </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={styles.ItemStyle}>
              <Text style={styles.styleText}>Start</Text>
              <Text style={styles.styleText}>
                {item?.activities?.start || '-'}
              </Text>
            </View>
            <View style={styles.ItemStyle}>
              <Text style={styles.styleText}>End</Text>
              <Text style={styles.styleText}>
                {item?.activities?.end || '-'}
              </Text>
            </View>

            <View style={styles.ItemStyle}>
              <Text style={styles.styleText}>Active hrs</Text>
              <Text style={styles.styleText}>{'X hrs'}</Text>
            </View>
          </View>

          {/* <View
            style={[
              styles.statusDot,
              !isOffline ? styles.onlineDot : styles.offlineDot,
            ]}
          /> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <BackArrowSvg />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Members</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <SearchSvg color={mainOrangeColor} width="20" height="20" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={DarkColor80}
        />
      </View> */}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'live' && styles.activeTabText,
            ]}>
            Live ({members?.length - membersOfflineLength || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offline' && styles.activeTab]}
          onPress={() => setActiveTab('offline')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'offline' && styles.activeTabText,
            ]}>
            Offline ({membersOfflineLength || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Member List */}
      <FlatList
        data={members.filter(member => {
          const isOffline =
            member?.activities === null ||
            (member?.activities?.start === '' &&
              member?.activities?.end === '');
          return activeTab === 'live' ? !isOffline : isOffline;
        })}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: mainOrangeColor,
  },
  tabText: {
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor80,
    fontSize: 14,
  },
  activeTabText: {
    color: mainOrangeColor,
  },
  listContainer: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    color: DarkColor,
    marginBottom: 2,
  },
  memberStatus: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 12,
    color: DarkColor80,
  },
  lastSeen: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 11,
  },
  onlineText: {
    color: '#4CAF50',
  },
  styleText: {
    color: DarkColor80,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
  },
  ItemStyle: {
    // justifyContent:'center',
    alignItems: 'center',
  },
  offlineText: {
    color: DarkColor80,
  },
  avatarContainer: {
    // position: 'relative',
    marginRight: 16,
    // borderWidth: 1,
    // borderColor: mainOrangeColor,
    borderRadius: 30,
    width: 51,
    height: 51,
  },
});

export default MembersStatusListing;
