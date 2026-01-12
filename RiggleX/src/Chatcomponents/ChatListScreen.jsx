import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EmptyListComponents from '../components/EmptyListComponents';
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

const ChatListScreen = ({ navigation, SearchValue }) => {
  const PLusIcon = require('../assets/Png/PlusIcon.png');
  const CreateGroupImage = require('../assets/ChatAssets/png/CreateGroupIcon.png');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [displayedData, setDisplayedData] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [ModalVisiable, setModalVisiable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [UnreadCounter, setUnreadCounter] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 60,
    total_items: 0,
    has_more: false,
  });

  const { connect, isConnected, lastMessage, sendMessage } = useWebSocket();
  const isFocused = useIsFocused();
  const toastRef = useRef(null);
  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    connect();
  }, [connect]);

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
      // console.log(
      //   'lastMessage if -=-=------>',
      //   JSON.stringify(lastMessage),
      //   '\n',
      //   '\n',
      //   '\n',
      // );
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
      console.log('lastMessage error -=-=------>', JSON.stringify(lastMessage));
      // toastRef.current.show({
      //   type: 'error',
      //   message: lastMessage?.message,
      // });

      return;
    }

  }, [lastMessage, sendMessage, handleAllConversations, pagination.page]);

  useEffect(() => {
    let filtered = [...conversations];

    if (selectedFilter === 'Unread') {
      filtered = filtered.filter(conv => conv?.unread_count > 0);
      setUnreadCounter(filtered.length);
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

  // console.log(
  //   'profile image last Message -=-=-=-=-=------>',
  //   JSON.stringify(lastMessage),
  //   '\n',
  //   '\n',
  //   '\n',
  // );

  const handleFilterSelect = useCallback(filter => {
    setSelectedFilter(filter);
  }, []);

  const renderFilterItem = useCallback(
    ({ item }) => {
      const isSelected = selectedFilter === item;
      // console.log('item', isSelected, ' ', item);
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
              <Text
                allowFontScaling={false}
                style={[
                  styles.filterText,
                  isSelected && styles.selectedFilterText,
                ]}>
                {item + ' '}({UnreadCounter})
              </Text>
            ) : (
              <Text
                allowFontScaling={false}
                style={[
                  styles.filterText,
                  isSelected && styles.selectedFilterText,
                ]}>
                {item}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [selectedFilter, handleFilterSelect, displayedData.length, isLoading],
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
    ({ item }) => (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() => handleChatWindowsNavigation(item)}>
        <View style={styles.avatarContainer}>
          {/* {console.log('chat_name-=-=-=------>', item?.chat_name, '\n')} */}
          <Avatar
            avatarUri={item?.chat_avatar}
            name={item?.chat_name || item?.chat_email}
            email={item?.chat_email}
            size={50}
            borderRadius={30}
            fontSize={18}
          />
        </View>
        <View style={styles.textContainer}>
          <Text allowFontScaling={false} style={styles.name}>
            {item?.chat_name?.trim() === ''
              ? item?.chat_email
              : item?.chat_name}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text
              allowFontScaling={false}
              style={styles.message}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.is_group && (
                <Text allowFontScaling={false} style={styles.message}>
                  {item.last_message?.sender?.name ||
                    item.last_message?.sender?.email}{' '}
                  :{' '}
                </Text>
              )}
              {item.last_message?.content || 'No messages yet'}
            </Text>
          </View>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text allowFontScaling={false} style={styles.unreadText}>
              {item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [handleChatWindowsNavigation], // Dependency: memoized handleChatWindowsNavigation
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
      <View style={styles.header}>
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterListContent}
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
                <Text style={{ color: DarkColor }}>Loading conversations...</Text>
              ) : (
                <EmptyListComponents
                  text={
                    isConnected ? 'No conversations yet' : 'Connecting to chat...'
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
                <Text style={styles.loadingText}>Loading more...</Text>
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
                <Text style={styles.modalButtonText}>Create group</Text>
                <View style={styles.iconContainer}>
                  <Image source={CreateGroupImage} style={styles.modalIcon} />
                </View>
              </TouchableOpacity>

              {/* New Chat Button */}
              <TouchableOpacity
                style={[styles.modalButton, { marginTop: 25 }]}
                onPress={handlePrivateChat}>
                <Text style={styles.modalButtonText}>New chat</Text>
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
