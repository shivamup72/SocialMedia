import {
  StyleSheet,
  View,
  StatusBar,
  Alert,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Clipboard,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Windowsheader from './windowsHeader/Windowsheader';
import ChatInputBar from './MediaComponents/MediaComponents';
import { mainOrangeColor, fonts, mainGrayColor } from '../../utils/style/fonts';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { useHeaderHeight } from '@react-navigation/elements';
import MessageType from './ChatTypeComponents/MessageType';
import ReactionPicker from './ReactionPicker';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from '../../Api/context/Toast';

const ScreenWindows = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [User, setUser] = useState(null);
  const [ReplyCheck, setReplyCheck] = useState(false);
  const [selectedMessageStatus, setSelectedMessageStatus] = useState([]);
  const [conversationValue, setConversations] = useState(null);
  const [Editmessagestatus, setEditmessagestatus] = useState(false);
  const flatListRef = useRef(null);


  // console.log(
  //   'conversationValue ScreenWindows check in side 4-=----->',
  //   route?.params,
  // );
  const [selectedMessage, setSelectedMessage] = useState(null);
  const toastRef = useRef(null);

  const conversationId = route?.params?.conversationId;
  const PAGE_SIZE = 15;

  const [reactionPickerState, setReactionPickerState] = useState({
    visible: false,
    message: null,
    positionY: 0,
  });
  const headerHeight = useHeaderHeight();
  const currentPageRef = useRef(1);

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

  const handleMarkAsDeliver = (messageIds, sender_idcheck) => {
    const payload = {
      action: 'mark_messages_as_delivered',
      message_ids: messageIds,
      sender_id: sender_idcheck,
    };
    sendMessage(payload);
  };

  const loadMessages = useCallback(
    pageNum => {
      if (!isConnected || !conversationId) return;
      setLoading(true);
      currentPageRef.current = pageNum;
      const action1 = route?.params?.isGroup
        ? 'get_group_conversation_details'
        : 'get_private_conversation_details';

      const payload = {
        action: action1,
        conversation_id:
          route?.params?.type === 'new' ? conversationValue : conversationId,
        page: pageNum || 1,
        page_size: PAGE_SIZE,
      };
      if (route?.params?.isGroup) {
        payload.group_id = route?.params?.GroupId;
      }
      sendMessage(payload);
    },
    [
      isConnected,
      conversationId,
      sendMessage,
      route?.params?.isGroup,
      route?.params?.GroupId,
      conversationValue,
    ],
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  }, [loading, hasMore, page, loadMessages]);

  useEffect(() => {
    if (isConnected && conversationId) {
      setPage(1);
      setMessages([]);
      setHasMore(true);
      loadMessages(page);
    }
  }, [conversationId, isConnected, loadMessages]);

  // console.log(
  //   'lastMessage action checking data -=----->',
  //   JSON.stringify(lastMessage.message),
  //   lastMessage?.action,
  //   '\n',
  //   '\n',
  // );

  useEffect(() => {
    if (lastMessage?.action === 'receive_new_message' && lastMessage.data) {
      // handleMarkAsDeliver(lastMessage?.data?.id, lastMessage?.data?.sender_id);
      sendMessage({
        action: 'update_messages_status',
        status: 'delivered',
        message_ids: lastMessage?.data?.id,
        conversation_id: lastMessage?.data?.conversation_id,
        is_group: lastMessage?.data?.is_group,
      });
      loadMessages(page);
      return;
    }

    if (
      lastMessage?.action === 'receive_message_updated' ||
      lastMessage.action === 'receive_messages_deleted'
    ) {
      // console.log('lastMessage action checking data -=----->', lastMessage);
      loadMessages(page);
      return;
    }

    if (lastMessage?.action === 'receive_messages_status_update') {
      // handleMarkAsDeliver(lastMessage?.data?.id, lastMessage?.data?.sender_id);
      loadMessages(page);
      return;
    }

    if (
      lastMessage?.action === 'receive_thread_created' ||
      lastMessage?.action === 'receive_thread_reply' ||
      lastMessage?.message === 'Thread created'
    ) {
      handleMarkAsDeliver(lastMessage?.data?.id, lastMessage?.data?.sender_id);
      loadMessages(page);
      return;
    }

    if (lastMessage?.action === 'send_message') {
      loadMessages(page);
      return;
    }

    if (lastMessage?.action === 'receive_message_updated') {
      loadMessages(page);
      return;
    }

    if (lastMessage?.action === 'receive_new_group_message') {
      // console.log('lastMessage action checking data -=----->', lastMessage);
      sendMessage({
        action: 'update_messages_status',
        status: 'delivered',
        message_ids: lastMessage?.data?.id || lastMessage?.data?.message?.id,
        conversation_id:
          lastMessage?.data?.conversation_id ||
          lastMessage?.data?.message?.conversation?.id,
        is_group: lastMessage?.data?.message?.is_group,
      });
      loadMessages(page);
      return;
    }

    if (
      lastMessage?.action === 'receive_reaction_update' ||
      lastMessage?.message === 'Reaction added' ||
      lastMessage?.message === 'Reaction removed'
    ) {
      loadMessages(page);
      return;
    }

    if (
      lastMessage?.message === 'Message sent' &&
      route?.params?.type === 'new'
    ) {
      setConversations(lastMessage?.data?.conversation_id);
      return;
    }

    if (lastMessage?.data?.messages) {
      const newMessages = lastMessage?.data?.messages.map(msg => ({
        id: msg?.id?.toString(),
        content: msg?.content,
        timestamp: new Date(msg?.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        isSender: String(msg?.sender?.id) === String(User),
        senderName: msg?.sender?.name || msg?.sender?.email,
        status: msg?.status || '',
        reactions: msg?.reactions || [],
        is_system_message: msg?.is_system_message || false,
        is_thread_root: msg?.is_thread_root || false,
        replies_count: msg?.replies_count || 0,
        avatar: msg?.sender?.avatar || null,
      }));

      setLoading(false);

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
    }
  }, [lastMessage, conversationId, User, lastMessage?.action]);

  const handleSend = useCallback(
    async data => {
      if (!isConnected) {
        Alert.alert(
          'Connection Error',
          "Not connected, can't send message. Please try again.",
        );
        return;
      }
      console.log('selectedMessage ScreenWindows in side -=----->', ReplyCheck);

      if (ReplyCheck) {
        const payload = {
          action: 'create_thread',
          message_id: selectedMessage?.id,
          is_group: route?.params?.isGroup,
          text: data.content,
        };

        // console.log('selectedMessage ScreenWindows -=----->', JSON.stringify(payload))

        sendMessage(payload);
        setReplyCheck(false);
        setSelectedMessage(null);
        loadMessages(page);
      } else {
        // console.log('selectedMessage ScreenWindows for checking -=----->', JSON.stringify(data))

        const optimisticMessage = {
          id: Date.now().toString(),
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isSender: true,
          senderName: '',
          status: 'sending',
        };
        setMessages(prevMessages => [optimisticMessage, ...prevMessages]);

        const action = route?.params?.isGroup
          ? 'send_group_message'
          : 'send_message';
        const messageObject = {
          action,
          message: data.content,
        };

        if (route?.params?.isGroup) {
          messageObject.group_id = route?.params?.GroupId;
        } else {
          messageObject.recipient_id = route?.params?.GroupId;
        }

        sendMessage(messageObject);
        loadMessages(page);
      }
    },
    [
      isConnected,
      sendMessage,
      route?.params?.isGroup,
      route?.params?.GroupId,
      ReplyCheck,
    ],
  );

  const dismissReactionPicker = useCallback(() => {
    if (reactionPickerState.visible) {
      setReactionPickerState({ visible: false, message: null, positionY: 0 });
      setSelectedMessage(null);
    }
  }, [reactionPickerState.visible]);

  const handleLongPressMessage = useCallback(
    (event, message) => {
      setSelectedMessage(message);
      setReplyCheck(false);
      setSelectedMessageStatus(message?.status);
      const { pageY } = event.nativeEvent;
      const pickerYPosition = pageY - headerHeight - 60;
      setReactionPickerState({
        visible: true,
        message: message,
        positionY: pickerYPosition,
      });
    },
    [headerHeight],
  );

  const handleSelectReaction = useCallback(
    reaction => {
      const { message } = reactionPickerState;
      if (!message) return;

      const payload = {
        action: 'add_reaction',
        message_id: message.id,
        reaction: reaction,
        is_group: route?.params?.isGroup || false,
      };

      sendMessage(payload);
      dismissReactionPicker();
    },
    [
      reactionPickerState,
      sendMessage,
      route?.params?.isGroup,
      dismissReactionPicker,
    ],
  );

  const handleRemoveReaction = useCallback(
    payload => {
      sendMessage(payload);
    },
    [sendMessage],
  );

  const handleCopyMessage = () => {
    Clipboard.setString(selectedMessage?.content);
    toastRef.current.show({
      type: 'success',
      message: 'Message copied.',
    });
  };

  const renderMessageItem = useCallback(
    ({ item }) => (
      <MessageType
        item={item}
        onLongPress={handleLongPressMessage}
        isGroup={route?.params?.isGroup}
        onRemoveReaction={handleRemoveReaction}
        selectedMessage={selectedMessage}
        navigation={navigation}
      />
    ),
    [
      handleLongPressMessage,
      handleRemoveReaction,
      route?.params?.isGroup,
      selectedMessage,
    ],
  );
  // console.log('params route -=-=---->', route?.params);
  const handleEditMessage = editedMessage => {
    console.log('editedMessage ScreenWindows in side -=----->', editedMessage);
    if (route?.params?.isGroup) {
      const payload = {
        action: 'edit_message',
        message_id: selectedMessage.id,
        new_content: editedMessage,
        conversation_id: conversationId,
        is_group: true,
      };
      sendMessage(payload);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      <Windowsheader
        navigation={navigation}
        Condition={!!selectedMessage}
        name={route?.params?.name}
        setReplyCheck={setReplyCheck}
        isGroup={route?.params?.isGroup}
        GroupId={route?.params?.GroupId}
        setSelectedMessage={setSelectedMessage}
        setEditmessagestatus={setEditmessagestatus}
        editmessagestatus={Editmessagestatus}
        onEditMessage={handleEditMessage}
        handleCopyMessage={handleCopyMessage}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight + (StatusBar.currentHeight || 0) + insets.top,
          android: headerHeight + (StatusBar.currentHeight || 0),
        })}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Pressable style={{ flex: 1 }} onPress={dismissReactionPicker}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                inverted
                style={styles.messageList}
                contentContainerStyle={styles.messageListContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.noMessagesText}>No messages yet.</Text>
                  </View>
                )}
              />

              {reactionPickerState.visible && (
                <View
                  style={[
                    styles.pickerWrapper,
                    { top: reactionPickerState.positionY },
                  ]}>
                  <ReactionPicker onSelectReaction={handleSelectReaction} />
                </View>
              )}
            </Pressable>

            <ChatInputBar
              onSend={handleSend}
              setReplyCheck={setReplyCheck}
              ReplyCheck={ReplyCheck}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              editmessagestatus={Editmessagestatus}
              setEditmessagestatus={setEditmessagestatus}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messageList: {
    flex: 1,
  },
  messageListContainer: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  loader: {
    marginVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // transform: [{scaleY: -1}],
  },
  noMessagesText: {
    textAlign: 'center',
    color: mainGrayColor,
    fontFamily: fonts.PoppinsRegular,
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  sentMessageBubble: {
    backgroundColor: mainOrangeColor,
    borderRadius: 12,
    borderTopRightRadius: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '90%',
  },
  sentMessageText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 15,
    fontFamily: fonts.PoppinsRegular,
  },
  sentTimeText: {
    color: '#797C7B',
    fontSize: 10,
    marginTop: 4,
    fontFamily: fonts.PoppinsLight,
  },
  receivedMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receivedMessageBubble: {
    backgroundColor: '#F2F7FB',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    paddingTop: 8,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  receivedMessageText: {
    color: '#000E08',
    fontSize: 13,
    lineHeight: 15,
    marginTop: 2,
    fontFamily: fonts.PoppinsRegular,
  },
  receivedTimeText: {
    color: '#797C7B',
    fontSize: 10,
    marginTop: 4,
    fontFamily: fonts.PoppinsLight,
  },
  senderName: {
    color: '#666',
    fontSize: 9,
    fontFamily: fonts.PoppinsMedium,
    marginBottom: 2,
  },

  pickerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
});

export default ScreenWindows;
