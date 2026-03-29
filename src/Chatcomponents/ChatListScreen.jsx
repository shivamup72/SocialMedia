import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingModal from '../components/OnboardingModal';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
  BackHandler,
  AppState,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  fonts,
  mainOrange50,
  mainOrange80,
  mainOrangeColor,
  DarkColor,
  DarkColor80,
  DarkColor50,
  mainWhiteColor,
} from '../utils/style/fonts';
import { useWebSocket } from '../Api/context/WebSocketServices';
import { useIsFocused } from '@react-navigation/native';
import ChatSvgIcon from '../assets/Homeassets/svg/ChatSvgIcon';

import Avatar from '../components/AvatarComponents/Avatar';
const FILTERS = ['All', 'Unread', 'Private', 'Groups', 'Call'];
import Toast from '../Api/context/Toast';
import { RfH, RfW } from '../utils/helper';
import ScreenView from '../utils/ScreenView';
import CustomText from '../utils/CustomText';
import { registerDeviceEncryptionKey } from '../utils/E2EEWorkspaceComponent';
import ChatConversationEmpty from '../components/ChatConversationEmpty';

const ONBOARDING_SHOWN_KEY = 'chatlist_onboarding_shown';

const ChatListScreen = ({ SearchValue, setHideTabBar, route }) => {
  const flag = route?.params?.flag;
  console.log('Flag:', flag);

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);

  useEffect(() => {
    // Check if onboarding modal has been shown before
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_SHOWN_KEY);

        if (!value) {
          setShowOnboarding(true);
        }
      } catch (e) {
        // fallback: show modal if error
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleSkipOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  // Open WebView for onboarding action
  const handleOnboardingInvite = async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
    } catch (e) { }
    navigation.navigate('InAppWebView', { url: 'https://riggle-x.com/' });
  };

  const navigation = useNavigation();
  const PLusIcon = require('../assets/Png/PlusIcon.png');
  const CreateGroupImage = require('../assets/ChatAssets/png/CreateGroupIcon.png');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [displayedData, setDisplayedData] = useState([]);
  console.log(displayedData, "displayedData on chat list screen");

  const [conversations, setConversations] = useState([]);
  const [ModalVisiable, setModalVisiable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [UnreadCounter, setUnreadCounter] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  // State for avatar preview modal
  const [previewAvatar, setPreviewAvatar] = useState(null);


  // Always get the latest unread conversation from all conversations, not just filtered
  useEffect(() => {
    // Sum all unread counts across conversations
    const totalUnread = conversations?.reduce((sum, conv) => sum + (conv?.unread_count || 0), 0);
    setUnreadCounter(totalUnread ?? 0);
    console.log('Total unread_count:', totalUnread);
  }, [conversations]);


  useEffect(() => {
    // Hide BottomTab when ModalVisiable is true (for custom tab bar)
    if (typeof setHideTabBar === 'function') {
      setHideTabBar(ModalVisiable);
    }
  }, [ModalVisiable, setHideTabBar]);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 60,
    total_items: 0,
    has_more: false,
  });

  const { connect, isConnected, lastMessage, sendMessage } = useWebSocket();
  const isFocused = useIsFocused();
  const toastRef = useRef(null);

  // Always connect socket immediately on mount and if not connected
  useEffect(() => {
    connect();
  }, [connect, isConnected]);

  // AppState logic to reconnect websocket on foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && !isConnected) {
        connect();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isConnected, connect]);

  const handleAllConversations = useCallback(
    (page = 1, loadMore = false) => {
      if ((isLoading && !loadMore) || !isConnected) {
        console.log('Skipping conversation fetch - loading or not connected');
        return;
      }

      // console.log('Fetching conversations, page:', page);
      setIsLoading(true);
      const payload = {
        action: 'get_all_conversations',
        page: page,
        page_size: pagination.page_size,
        days_back: 30,
      };
      console.log('handleAllConversations check -=-=-=-------->', payload);

      try {
        sendMessage(payload);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, pagination.page_size, sendMessage, isConnected],
  );

  useEffect(() => {
    if (isConnected) {
      setPagination(prev => ({ ...prev, page: 1 }));
      handleAllConversations(1);
    } else {
      connect();
      handleAllConversations(1);
    }
  }, [isFocused, isConnected]);

  // console.log(
  //   'last message on chat List screen -=-=------>',
  //   '\n',
  //   JSON.stringify(lastMessage),
  //   '\n',
  //   '\n',
  // );

  useEffect(() => {
    if (lastMessage?.action === 'get_all_conversations') {
      // ...existing code...
    }
    if (lastMessage?.action === 'receive_new_message' && lastMessage?.data) {
      // console.log(
      //   'last message on chat List screen -=-=------>',
      //   '\n',
      //   JSON.stringify(lastMessage),
      //   '\n',
      //   '\n',
      // );

      sendMessage({
        action: 'update_messages_status',
        status: 'delivered',
        message_ids: lastMessage?.data?.id,
        conversation_id: lastMessage?.data?.conversation_id,
        is_group: lastMessage?.data?.is_group,
      });
      handleAllConversations(1);
      return;
    } else if (lastMessage?.action === 'receive_messages_status_update') {
      handleAllConversations(1);
      return;
    } else if (lastMessage?.action === 'receive_reaction_update') {
      handleAllConversations(1);
      return;
    } else if (lastMessage?.action === 'receive_new_group_message') {
      console.log(
        'last message chat Listing group screen -=-=------>',
        '\n',
        JSON.stringify(lastMessage),
        '\n',
        '\n',
      );

      const Pyload = {
        action: 'update_messages_status',
        status: 'delivered',
        message_ids: lastMessage?.data?.id || lastMessage?.message?.id,
        conversation_id:
          lastMessage?.data?.conversation_id ||
          lastMessage?.message?.conversation?.id,
        is_group: lastMessage?.message?.is_group,
      };

      // console.log('payload -=-=-=-------->', Pyload, '\n', '\n');
      sendMessage(Pyload);
      handleAllConversations(1);
      return;
    } else if (lastMessage?.data?.conversations) {
      // Log the full backend response for debugging
      // console.log('Backend conversations response:', JSON.stringify(lastMessage?.data?.conversations, null, 2));
      setConversations(prev => {
        if (pagination.page === 1) {
          return lastMessage?.data?.conversations || [];
        }
        return [...prev, ...(lastMessage?.data?.conversations || [])];
      });

      if (lastMessage?.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total_items: lastMessage?.data?.pagination?.total_items || 0,
          has_more: lastMessage?.data?.pagination?.has_more || false,
        }));
      }
      setIsLoading(false);
    } else if (lastMessage?.type === 'error') {
      // console.log('lastMessage error -=-=------>', JSON.stringify(lastMessage?.message));
      return;
    }

  }, [lastMessage, sendMessage, handleAllConversations, pagination.page]);

  useEffect(() => {
    let filtered = [...conversations];
    if (selectedFilter === 'Unread') {
      filtered = filtered.filter(conv => conv?.unread_count > 0);
    } else if (selectedFilter === 'Private') {
      filtered = filtered.filter(conv => !conv?.is_group);
    } else if (selectedFilter === 'Groups') {
      filtered = filtered.filter(conv => conv?.is_group);
    } else if (selectedFilter === 'Call') {
      filtered = filtered.filter(conv => conv?.type === 'call');
    }

    if (SearchValue && SearchValue?.trim() !== '') {
      const searchTrim = SearchValue.trim();
      const lowercasedSearch = searchTrim.toLowerCase();
      filtered = filtered?.filter(
        conv =>
          (conv?.chat_name || '').toLowerCase().includes(lowercasedSearch) ||
          (conv?.chat_email || '').toLowerCase().includes(lowercasedSearch),
      );
    }

    setDisplayedData(filtered);
  }, [conversations, selectedFilter, SearchValue]);

  const handleFilterSelect = useCallback(filter => {
    setSelectedFilter(filter);
  }, []);

  // Here handlew E2EE Logic 

  useEffect(() => {
    registerDeviceEncryptionKey();
  }, []);

  const renderFilterItem = useCallback(
    ({ item }) => {
      const isSelected = selectedFilter === item;
      return (
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              isSelected && styles.selectedFilterButton,
            ]}
            onPress={() => handleFilterSelect(item)}
          >
            {item === 'Unread' ? (
              <CustomText
                allowFontScaling={false}
                style={[
                  styles.filterText,
                  isSelected && styles.selectedFilterText,
                ]}>
                {item + ' '}({UnreadCounter})
              </CustomText>
            ) : (
              <CustomText
                allowFontScaling={false}
                style={[
                  styles.filterText,
                  isSelected && styles.selectedFilterText,
                ]}>
                {item}
              </CustomText>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [selectedFilter, handleFilterSelect, displayedData.length, isLoading, UnreadCounter],
  );

  const handleChatWindowsNavigation = useCallback(
    item => {
      setModalVisiable(false);

      navigation.navigate('ChatWindows', {
        conversationId: item?.conversation_id,
        isGroup: item?.is_group,
        GroupId: item?.chat_id,
        name: item?.chat_name,
        email: item?.chat_email,
        avatar: item?.chat_avatar,
        type: 'old',
        muted: item?.muted,
        navigatetype: 'fromscreen',
      });
    },
    [navigation],
  );

  const renderChatItem = useCallback(
    ({ item }) => {
      const chatId = item?.conversation_id || item?.id;
      const formatTime = (timestamp) => {
        const date = new Date(timestamp);

        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true, // AM/PM ke liye
        });
      };
      return (
        <TouchableOpacity
          style={styles.chatItemContainer}
          onPress={() => handleChatWindowsNavigation(item)}
          activeOpacity={0.8}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setPreviewAvatar(item)}
            activeOpacity={0.8}
          >
            <Avatar
              avatarUri={item?.chat_avatar}
              name={item?.chat_name || item?.chat_email}
              email={item?.chat_email}
              size={50}
              borderRadius={30}
              fontSize={18}
            />
          </TouchableOpacity>

          <View style={styles.textContainer}>
            {/* name + time */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomText style={styles.name} numberOfLines={expandedId === chatId ? 2 : 1}>
                  {expandedId === chatId
                    ? item?.chat_name?.trim() === ''
                      ? item?.chat_email
                      : item?.chat_name
                    : ((item?.chat_name?.trim() === ''
                      ? item?.chat_email
                      : item?.chat_name) || '').length > 26
                      ? (
                        item?.chat_name?.trim() === ''
                          ? item?.chat_email
                          : item?.chat_name
                      ).slice(0, 26) + '...'
                      : item?.chat_name?.trim() === ''
                        ? item?.chat_email
                        : item?.chat_name}
                </CustomText>
              </View>

              <CustomText
                style={{ fontSize: 10, fontFamily: fonts.PoppinsRegular }}
              >
                {formatTime(item?.last_message?.timestamp)}
              </CustomText>
            </View>

            {/* message */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CustomText
                allowFontScaling={false}
                style={[styles.message, { flex: 1 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.is_group && (
                  <CustomText allowFontScaling={false} style={styles.message}>
                    {item?.last_message?.sender?.name ||
                      item?.last_message?.sender?.email}
                    {': '}
                  </CustomText>
                )}
                {item?.last_message?.content || 'No messages yet'}
              </CustomText>

              {item?.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <CustomText allowFontScaling={false} style={styles.unreadText}>
                    {item?.unread_count}
                  </CustomText>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )
    },
    [handleChatWindowsNavigation, expandedId],
  );

  const handleModalCreateMedia = useCallback(() => {
    setModalVisiable(true);
  }, []);

  const handlePrivateChat = useCallback(() => {
    setModalVisiable(false);
    navigation.navigate('PrivateChatScreen');
  }, [navigation]);

  const handleCreateGroup = useCallback(() => {
    setModalVisiable(false);
    navigation.navigate('ContactList');
  }, [navigation]);

  return (
    <ScreenView>
      {/* Onboarding Modal (shows only on first entry) */}
      <OnboardingModal
        visible={showOnboarding}
        onSkip={handleSkipOnboarding}
        onMainAction={handleOnboardingInvite}
        buttonText="Start Inviting your Crew"
        showSkip={!onboardingSkipped}
      >
        <CustomText style={{ textAlign: 'center', marginBottom: 16, color: '#666', fontSize: 15 }}>
          Invite your friends, family, or colleagues to start chatting in your new hub!
        </CustomText>
      </OnboardingModal>
      {/* <View style={styles.header}>
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterListContent}
        />
      </View> */}
      <View style={styles.header}>
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterListContent}
          extraData={UnreadCounter}   // ✅ IMPORTANT
        />
      </View>
      <View style={{ paddingBottom: RfH(100) }}>
        <FlatList
          data={displayedData}
          renderItem={renderChatItem}
          keyExtractor={(item, index) => {
            if (!item) return `empty-${index}`;
            return item.is_group
              ? `g_${item.conversation_id || index}`
              : `${item.conversation_id || index}`;
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{
            paddingBottom: 50,
            ...(displayedData?.length === 0 && {}),
          }}
          ListEmptyComponent={
            <View
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {isLoading ? (
                <CustomText style={{ color: DarkColor }}>Loading conversations...</CustomText>
              ) : (
                <ChatConversationEmpty
                  text={
                    isConnected ? 'No chats yet' : 'Connecting to chat...'
                  }
                  subText={
                    isConnected ? 'Start a new conversation to connect!' : ''
                  }
                  btnText={
                    isConnected ? 'Start Inviting your Crew' : ''
                  }
                  button={
                    isConnected
                      ? {
                        backgroundColor: '#FC8C4D',
                        borderRadius: 8,
                        paddingVertical: RfH(10),
                        paddingHorizontal: RfW(24),
                        marginBottom: RfH(8),
                        width: RfW(260),
                        alignItems: 'center',
                        marginTop: RfH(10),
                      }
                      : null
                  }
                  type={1}
                />
              )}
            </View>
          }
          onEndReached={() => {
            if (!isLoading && pagination.has_more) {
              const nextPage = pagination.page + 1;
              setPagination(prev => ({ ...prev, page: nextPage }));
              handleAllConversations(nextPage, true);
            }
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isLoading && pagination.page > 1 ? (
              <View style={styles.loadingMore}>
                <CustomText style={styles.loadingText}>Loading more...</CustomText>
              </View>
            ) : null
          }
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: RfH(120),
          right: RfW(15),
          alignItems: 'flex-end',
        }}>
        <Modal
          transparent={true}
          visible={ModalVisiable}
          animationType="slide"
          onRequestClose={() => setModalVisiable(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisiable(false)}>
            <View style={styles.modalContainer}>
              {/* Create Group Button */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateGroup}>
                <CustomText style={styles.modalButtonText}>Create group</CustomText>
                <View style={styles.iconContainer}>
                  <Image source={CreateGroupImage} style={styles.modalIcon} />
                </View>
              </TouchableOpacity>

              {/* New Chat Button */}
              <TouchableOpacity
                style={[styles.modalButton, { marginTop: 25 }]}
                onPress={handlePrivateChat}>
                <CustomText style={styles.modalButtonText}>New chat</CustomText>
                <View style={styles.iconContainer}>
                  <ChatSvgIcon width="20" height="20" color="#ffffff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisiable(!ModalVisiable)}
                style={{
                  backgroundColor: '#ffffff',
                  width: 36,
                  height: 36,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 5,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  marginEnd: 15,
                  marginTop: 25,
                }}>
                <Animated.Image
                  source={PLusIcon}
                  style={{
                    width: 42,
                    height: 42,
                    marginTop: 4,
                    marginRight: ModalVisiable ? 4.5 : 0,
                    transform: [{ rotate: ModalVisiable ? '45deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Main FAB Button */}
        {!ModalVisiable && (
          <TouchableOpacity
            onPress={() => setModalVisiable(!ModalVisiable)}
            style={{
              backgroundColor: '#ffffff',
              width: 40,
              height: 40,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 5,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
            }}>
            <Animated.Image
              source={PLusIcon}
              style={{
                width: 44,
                height: 44,
                marginTop: 6,
                marginRight: ModalVisiable ? 5 : 0,
                transform: [{ rotate: ModalVisiable ? '45deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* <Toast ref={toastRef} /> */}
      {/* Avatar Preview Modal (global, not per item) */}
      {previewAvatar && (
        <Modal
          visible={!!previewAvatar}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewAvatar(null)}
        >
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setPreviewAvatar(null)}>
            {previewAvatar.chat_avatar && typeof previewAvatar.chat_avatar === 'string' && previewAvatar.chat_avatar.trim() !== '' ? (
              <Image
                source={{ uri: previewAvatar.chat_avatar }}
                style={{ width: '90%', height: '60%', resizeMode: 'contain', borderRadius: 16, }}
              />
            ) : (
              <View style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: '#FC8C4D', justifyContent: 'center', alignItems: 'center' }}>
                <CustomText style={{ color: '#fff', fontSize: 64, fontWeight: 'bold', textAlign: 'center' }}>
                  {(() => {
                    let name = previewAvatar?.chat_name || previewAvatar?.chat_email || '';
                    if (name && typeof name === 'string' && name.trim().length > 0) {
                      const parts = name.trim().split(' ');
                      if (parts.length > 1) {
                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                      }
                      return name[0].toUpperCase();
                    }
                    if (previewAvatar?.chat_email && typeof previewAvatar.chat_email === 'string' && previewAvatar.chat_email.trim().length > 0) {
                      return previewAvatar.chat_email[0].toUpperCase();
                    }
                    return '?';
                  })()}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        </Modal>
      )}
    </ScreenView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    // backgroundColor: 'red',
  },
  filterListContent: {
    paddingHorizontal: 16,
    paddingLeft: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    // borderRadius: 20,
    // backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFilterButton: {
    borderBottomWidth: 2,
    borderBottomColor: mainOrangeColor,
    // backgroundColor: mainOrangeColor,
  },
  filterText: {
    color: DarkColor80,
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    marginTop: 0,
    paddingTop: 2,
  },
  selectedFilterText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsMedium,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    // backgroundColor: 'red',
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  statusDotOnline: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 7,
    backgroundColor: '#2ecc71', // Green for online
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusDotOffline: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 7,
    backgroundColor: '#bdc3c7',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    color: DarkColor,
    marginBottom: 4,
    fontFamily: fonts.PoppinsMedium,
  },
  message: {
    fontSize: 12,
    color: DarkColor50,
    fontFamily: fonts.PoppinsLight,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    fontFamily: fonts.PoppinsMedium,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F6F6',
    marginLeft: 92,
  },
  loadingMore: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: DarkColor50,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingBottom: 70,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'white',
    // padding: 12,
    borderRadius: 10,
    // elevation: 3,
    // marginTop:10,
  },
  iconContainer: {
    backgroundColor: '#F97316',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  modalButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 16,
    marginRight: 10,
  },
});

export default memo(ChatListScreen);
