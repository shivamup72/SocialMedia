import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import MessageType from '../ChatTypeComponents/MessageType';
import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import { mainOrangeColor } from '../../../utils/style/fonts';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Toast from '../../../Api/context/Toast';
import ScreenView from '../../../utils/ScreenView';
import CustomText from '../../../utils/CustomText';

const StartComponents = ({ navigation, route }) => {
  console.log('StarComponents route params kkkj:', route?.params);
  // Log to get all conversations on mount
  useEffect(() => {
    const payload = {
      action: 'get_all_conversations',
    };
    console.log('Fetching all conversations:', payload);
    sendMessage(payload);
  }, [sendMessage]);
  const { sendMessage, lastMessage } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [User, setUser] = useState(null);
  const [showUnstarConfirm, setShowUnstarConfirm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const currentPageRef = useRef(1);
  const PAGE_SIZE = 15;
  const toastRef = useRef(null);

  // console.log(
  //   'Total messages:',
  //   lastMessage?.data?.[0]?.messages?.length
  // );

  console.log(messages, "Messages in star after processing WebSocket response");


  useEffect(() => {
    const fetData = async () => {
      try {
        const res = await AsyncStorage1.getItem('userLoginResponse');
        setUser(res?.data?.user?.id);
      } catch (err) {
        console.log('Error in useEffect', err);
      }
    };
    fetData();
  }, []);

  const handleConversationStarmsg = () => {
    const isGroup = route?.params?.data?.isGroup;
    const payload = {
      action: 'get_starred_messages',
      conversation_id: route?.params?.conversationId,
      is_group: isGroup,
    };
    if (isGroup && route?.params?.data?.GroupId) {
      payload.group_id = route?.params?.data?.GroupId;
    }
    console.log('payload after star -=-=-=------>', payload);
    sendMessage(payload);
  };


  // Refetch starred messages every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (User && route?.params?.conversationId) {
        handleConversationStarmsg();
      }
    }, [User, route?.params?.conversationId])
  );

  console.log(
    'lastMessage message and action test -=-=-=-=-=-=----->',
    lastMessage?.action,
    lastMessage?.message,
    '\n',
    '\n',
    '\n',
  );
  console.log(JSON.stringify('Full lastMessage object:'), JSON.stringify?.(lastMessage));

  const FetchData = () => {
    try {
      // The WebSocket response for starred messages is an object with a data array.
      // The first item in data contains a messages array, which holds all the starred messages.
      // To access the starred messages, use lastMessage.data[0].messages
      const messagesData = lastMessage.data[0].messages;

      console.log('Starred messages array:', messagesData);
      if (Array.isArray(messagesData)) {
        messagesData.forEach((msg, idx) => {
          console.log(`Starred message [${idx}]:`, msg);
        });
      }
      if (!Array.isArray(messagesData)) {
        console.log('Messages data is not an array:', messagesData);
        return;
      }

      // ⭐️ Filter only starred messages
      const starredMessages = messagesData.filter(msg => msg && msg.starred);

      const timestamp = Date.now();
      const newMessages = starredMessages
        .map((msg, index) => {
          if (!msg) return null;
          return {
            id: msg?.id?.toString() || 'msg',
            content: msg?.content || '',
            timestamp: msg?.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              : '',
            isSender: String(msg?.sender?.id) === String(User),
            senderName:
              msg?.sender?.name || msg?.sender?.email || 'Unknown Riggler!',
            status: msg?.status || '',
            reactions: Array.isArray(msg?.reactions) ? msg.reactions : [],
            is_system_message: Boolean(msg?.is_system_message),
            is_thread_root: Boolean(msg?.is_thread_root),
            replies_count: Number(msg?.replies_count) || 0,
            avatar: msg?.sender?.avatar || null,
            starred: Boolean(msg?.starred),
          };
        })
        .filter(Boolean);

      setLoading(false);

      // Log the newMessages array before updating state for debugging
      console.log('Setting messages state with:', newMessages);

      if (newMessages.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (currentPageRef.current === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prevMessages => {
          const existingMessageIds = new Set(prevMessages.map(m => m.id));
          const uniqueNewMessages = newMessages.filter(
            m => !existingMessageIds.has(m.id),
          );
          return [...prevMessages, ...uniqueNewMessages];
        });
      }
    } catch (err) {
      toastRef.current.show({
        type: 'error',
        message: lastMessage?.message,
      });
    }
  };

  useEffect(() => {
    if (
      !lastMessage ||
      !lastMessage.data ||
      !Array.isArray(lastMessage.data) ||
      !lastMessage.data[0] ||
      !lastMessage.data[0].messages ||
      lastMessage.message !== 'Starred messages retrieved successfully'
    ) {
      console.log('No messages or invalid message format');
      return;
    }
    if (lastMessage.message === 'Starred messages retrieved successfully') {
      FetchData();
      return;
    }
  }, [lastMessage]);

  // const FetchData = () => {
  //   try {
  //     if (
  //       !lastMessage ||
  //       !lastMessage.data ||
  //       !Array.isArray(lastMessage.data) ||
  //       !lastMessage.data[0] ||
  //       !lastMessage.data[0].messages
  //     ) {
  //       console.log('Invalid lastMessage structure');
  //       return;
  //     }
  //     const messagesData = lastMessage.data[0].messages;
  //     // ...rest of your code
  //   } catch (err) {
  //     // ...existing error handling
  //   }
  // };

  const handleStarandUnstarMessage = item => {
    if (item?.starred) {
      setSelectedMessage(item);
      setShowUnstarConfirm(true);
    } else {
      const payload = {
        action: 'toggle_star_messages',
        is_group: route?.params?.data?.isGroup,
        star: true,
        message_ids: item.id,
      };
      console.log('Star payload: -=-=-=-=-=-------->', payload, '\n', '\n');
      sendMessage(payload);
      // Refresh starred messages after starring
      setTimeout(() => {
        handleConversationStarmsg();
      }, 500);
    }
  };

  const handleConfirmUnstar = () => {
    if (selectedMessage) {
      const payload = {
        action: 'toggle_star_messages',
        conversation_id: route?.params?.conversationId,
        is_group: route?.params?.data?.isGroup,
        star: false,
        message_ids: selectedMessage?.id,
      };

      console.log('Unstar payload: -=-=-=-=-=-------->', payload, '\n', '\n');

      sendMessage(payload);
      // Refresh starred messages after unstarring
      setTimeout(() => {
        handleConversationStarmsg();
      }, 500);
      setShowUnstarConfirm(false);
      setSelectedMessage(null);
    }
  };

  const handleCancelUnstar = () => {
    setShowUnstarConfirm(false);
    setSelectedMessage(null);
  };

  const renderMessageItem = useCallback(
    ({ item }) => (
      <MessageType
        item={item}
        isGroup={route?.params?.data?.isGroup}
        StarListing={true}
        handleStarandUnstarMessage={handleStarandUnstarMessage}
        navigation={navigation}
      />
    ),
    [route?.params?.data?.isGroup, handleStarandUnstarMessage, navigation],
  );

  // console.log(
  //   'messages star listing -=-=-=-=-=----------->',
  //   messages,
  //   '\n',
  //   '\n',
  // );

  return (
    <ScreenView>
      <ConfirmationModal
        visible={showUnstarConfirm}
        onClose={handleCancelUnstar}
        onConfirm={handleConfirmUnstar}
        title="Unstar Message"
        message="Are you sure you want to unstar this message?"
        confirmText="Unstar"
      />
      <HeaderComponents Type={'All Star Messages'} navigation={navigation} />

      {!route?.params?.conversationId ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>No starred messages yet</CustomText>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            if (!loading && hasMore) {
              setLoading(true);
              currentPageRef.current += 1;
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>No starred messages yet</CustomText>
            </View>
          }
          ListFooterComponent={
            loading && messages.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={mainOrangeColor} />
              </View>
            ) : null
          }
        />
      )}

      <Toast ref={toastRef} />
    </ScreenView>
  );
};

export default StartComponents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  listContent: {
    padding: 10,
  },
  footerLoader: {
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
