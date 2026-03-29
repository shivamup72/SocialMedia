
// Place this inside the ScreenWindows component, after useWebSocket()
// Real-time message edit handler
// (This code block should be inside the component, not at the top level)

import {
  StyleSheet,
  View,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Clipboard,
  TouchableWithoutFeedback,
  BackHandler,
  Animated,
  SafeAreaView,
  Keyboard,
  Text
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Windowsheader from './windowsHeader/Windowsheader';
import ChatInputBar from './MediaComponents/MediaComponents';
import { mainOrangeColor, fonts, mainGrayColor, mainOrange80, mainOrange92, mainOrange20, DarkColor, mainWhiteColor } from '../../utils/style/fonts';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { insertMessage, getPendingMessages, getMessages, updateMessageContent } from '../../utils/chatSQLite';
import { useHeaderHeight } from '@react-navigation/elements';
import MessageType from './ChatTypeComponents/MessageType';
import ReactionPicker from './ReactionPicker';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Toast from '../../Api/context/Toast';
import ScreenView from '../../utils/ScreenView';
import PinSvg from '../../assets/svg/PinSvg';
import { RfH, RfW } from '../../utils/helper';
import DownArrowSvg from '../../assets/svg/DownArrowSvg';
import CustomText from '../../utils/CustomText';

const ScreenWindows = ({ navigation, route }) => {
  // --- Real-time message edit handler ---
  useEffect(() => {
    if (!lastMessage) return;
    console.log('Edit event:', lastMessage); // Debug log

    if (lastMessage.action === 'receive_message_updated' && lastMessage.data) {
      setMessages(prevMessages => {
        const updated = prevMessages.map(msg =>
          String(msg.id) === String(lastMessage.data.id)
            ? { ...msg, ...lastMessage.data }
            : msg
        );
        // Deduplicate if needed
        const uniqueMessages = [];
        const seenIds = new Set();
        for (const msg of updated) {
          if (!seenIds.has(msg.id)) {
            uniqueMessages.push(msg);
            seenIds.add(msg.id);
          }
        }
        return uniqueMessages;
      });
      // Update SQLite as well
      updateMessageContent(
        lastMessage.data.id,
        lastMessage.data.content,
        lastMessage.data.updated_at || new Date().toISOString()
      );
    }
  }, [lastMessage]);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);


  // Log to check getMessages import and usage
  console.log('getMessages functions:', messages);

  // Returns a formatted date label for message separators
  const getDateLabel = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isToday = msgDate.toDateString() === today.toDateString();
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    // Format as e.g. 'Friday, January 23, 2026'
    return msgDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  // Memoized: Adds date separators to the messages array for display
  const messagesWithSeparators = React.useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const result = [];
    let lastDate = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg?.created_at) {
        result.unshift(msg);
        continue;
      }
      const msgDate = new Date(msg.created_at);
      const dateStr = msgDate.toDateString();
      if (lastDate !== dateStr) {
        result.unshift({
          _id: `date-separator-${dateStr}`,
          type: 'date-separator',
          label: getDateLabel(msg.created_at),
        });
        lastDate = dateStr;
      }
      result.unshift(msg);
    }
    return result;
  }, [messages]);

  // State and refs for chat logic and UI
  // Track if messages have already been loaded for this conversation
  const loadedConversationId = useRef(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { isConnected, lastMessage, sendMessage, connect, reconnect, newMessageTrigger, manageNewMessageToastChatScreen } = useWebSocket();
  const [User, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ReplyCheck, setReplyCheck] = useState(false);
  const [selectedMessageStatus, setSelectedMessageStatus] = useState([]);
  const [conversationValue, setConversations] = useState(null);
  const [Editmessagestatus, setEditmessagestatus] = useState(false);
  const [MentionAll, setMentionAll] = useState([]);
  const flatListRef = useRef(null);
  const isScrolledUp = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isFocused = useIsFocused();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]); // For multiple selection
  const toastRef = useRef(null);
  const [NewMessage, setNewMessage] = useState(false);
  const [localMuted, setLocalMuted] = useState(route?.params?.muted);
  const conversationId = route?.params?.conversationId;
  const PAGE_SIZE = 15;
  const [reactionPickerState, setReactionPickerState] = useState({
    visible: false,
    message: null,
    positionY: 0,
  });
  // Header height and refs for pagination and mount status
  const headerHeight = useHeaderHeight();
  const currentPageRef = useRef(1);
  const didMountRef = useRef(false);
  // Reload messages when returning to this screen (e.g., after adding a thread reply)
  // Refetch messages when returning to this screen
  // useFocusEffect(
  //   useCallback(() => {
  //     if (isConnected && conversationId) {
  //       setPage(1);
  //       setMessages([]);
  //       setHasMore(true);
  //       setInitialLoading(true);
  //       isScrolledUp.current = false;
  //       loadMessages(1);
  //     }
  //   }, [isConnected, conversationId, loadMessages])
  // );

  // Renders the toast message for new incoming messages
  const renderToastMessage = useMemo(() => {
    const messageData = manageNewMessageToastChatScreen;
    if (!messageData) return null;
    if (messageData?.data?.conversation_id === conversationId && !messageData?.message?.is_group) return null;
    if (messageData?.message?.conversation?.group_id == route?.params?.GroupId && messageData?.message?.is_group) return null;

    const msg = messageData?.message?.is_group ? manageNewMessageToastChatScreen?.message : messageData?.data;

    return (
      <View
        style={styles.toastContainer}>
        <View style={styles.avatarCircle}>
          <CustomText
            style={{
              color: mainOrangeColor,
              fontFamily: fonts.PoppinsSemiBold,
              fontSize: RfH(14),
            }}
          >
            {(messageData?.message?.is_group
              ? messageData?.message?.sender?.name
              : msg?.sender_name
            )?.charAt(0)?.toUpperCase()}
          </CustomText>
        </View>
        {/* Message Content */}
        <View style={{ flex: 1 }}>
          {messageData?.message?.conversation?.group_name ? <CustomText style={{
            color: mainWhiteColor,
            fontFamily: fonts.PoppinsMedium,
            fontSize: RfH(14),
          }}>{messageData?.message?.conversation?.group_name}</CustomText> : null}
          <CustomText
            numberOfLines={1}
            style={{
              color: mainWhiteColor,
              fontFamily: fonts.PoppinsMedium,
              fontSize: RfH(10),
            }}
          >
            {messageData?.message?.is_group
              ? messageData?.message?.sender?.name
              : msg?.sender_name}
          </CustomText>
          <CustomText
            numberOfLines={1}
            style={{
              color: mainWhiteColor,
              fontFamily: fonts.PoppinsRegular,
              fontSize: RfH(10),
              opacity: 0.9,
            }}
          >
            {msg?.content}
          </CustomText>
        </View>
      </View>
    );
  }, [manageNewMessageToastChatScreen]);

  // useFocusEffect(
  //   useCallback(() => {
  //     // 🔵 SCREEN FOCUS
  //     // setMessages([]);
  //     setPage(1);
  //     setLoading(false);
  //     setHasMore(true);
  //     setUser(null);
  //     setCurrentUser(null);
  //     setReplyCheck(false);
  //     setSelectedMessageStatus([]);
  //     setConversations(null);
  //     setEditmessagestatus(false);
  //     setMentionAll([]);
  //     setSelectedMessage(null);
  //     setNewMessage(false);
  //     isScrolledUp.current = false;
  //     return () => {
  //       // 🔴 SCREEN BLUR / UNMOUNT (CLEANUP)
  //       // setMessages([]);
  //       setPage(1);
  //       setLoading(false);
  //       setHasMore(true);
  //       setUser(null);
  //       setCurrentUser(null);
  //       setReplyCheck(false);
  //       setSelectedMessageStatus([]);
  //       setConversations(null);
  //       setEditmessagestatus(false);
  //       setMentionAll([]);
  //       setSelectedMessage(null);
  //       setNewMessage(false);
  //       isScrolledUp.current = false;
  //     };
  //   }, [])
  // );

  // On mount: fetch user info from AsyncStorage
  useEffect(() => {
    const fetData = async () => {
      try {
        const res = await AsyncStorage1.getItem('userLoginResponse');
        setUser(res?.data?.user?.id);
        setCurrentUser(res?.data?.user);
      } catch (err) {
        // Handle error
      }
    };
    fetData();
    didMountRef.current = true;
  }, []);

  // Handles Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  // Loads messages from backend (pagination supported)
  const loadMessages = useCallback(
    pageNum => {
      if (!isConnected || (!conversationId && !route?.params?.isGroup)) {
        setLoading(false);
        setInitialLoading(false);
        return;
      }
      if (route?.params?.isGroup && !route?.params?.GroupId) {
        setLoading(false);
        setInitialLoading(false);
        return;
      }
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
      console.log('Payload for message request:', payload);

      if (route?.params?.isGroup) {
        payload.group_id = route?.params?.GroupId;
      }

      // Wrap sendMessage to intercept and sync messages to SQLite
      const originalSendMessage = sendMessage;
      const handleServerMessages = (serverMessages) => {
        // Save all messages to SQLite
        serverMessages.forEach(msg => {
          insertMessage({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            status: msg.status,
            is_group: msg.is_group,
            extra: msg,
          });
        });
        // After saving, fetch all messages for this conversation from SQLite
        getMessages(payload.conversation_id, route?.params?.isGroup, (sqliteMessages) => {
          // Build a map for quick lookup
          const sqliteMap = {};
          sqliteMessages.forEach(m => { sqliteMap[m.id] = m; });
          // Merge: prefer SQLite data if available
          const merged = serverMessages.map(msg =>
            sqliteMap[msg.id] ? { ...msg, ...sqliteMap[msg.id], extra: sqliteMap[msg.id].extra } : msg
          );
          setMessages(deduplicateMessages(merged));
          setLoading(false);
          setInitialLoading(false);
        });
      };

      // Intercept the server response (assumes sendMessage returns a promise or can be hooked)
      // If not, you may need to hook into your websocket or API response handler
      originalSendMessage(payload, handleServerMessages);
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
  // Loads more messages for pagination
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && messages.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  }, [loading, hasMore, page, loadMessages, messages.length]);

  // Helper to deduplicate messages by id
  const deduplicateMessages = useCallback((allMessages) => {
    const uniqueMessages = [];
    const seenIds = new Set();
    for (const msg of allMessages) {
      if (!seenIds.has(msg.id)) {
        uniqueMessages.push(msg);
        seenIds.add(msg.id);
      }
    }
    return uniqueMessages;
  }, []);
  // Only load messages on first mount or when conversationId changes
  useEffect(() => {
    if (
      isConnected &&
      conversationId &&
      loadedConversationId.current !== conversationId
    ) {
      setPage(1);
      setMessages([]);
      setHasMore(true);
      setInitialLoading(true);
      isScrolledUp.current = false;
      loadMessages(1);
      loadedConversationId.current = conversationId;
      // Load all messages from SQLite for this conversation

      // Load pending messages from SQLite and add to UI
      getPendingMessages((pendingMessages) => {
        if (pendingMessages && pendingMessages.length > 0) {
          setMessages(prev => deduplicateMessages([
            ...pendingMessages.map(m => ({
              ...m,
              // Mark as optimistic/pending for UI
              optimistic: true,
              status: [{ status: 'pending' }],
              // Parse content if it's a stringified object
              content: (() => {
                try {
                  const parsed = JSON.parse(m.content);
                  return parsed.content || m.content;
                } catch {
                  return m.content;
                }
              })(),
            })),
            ...prev
          ]));
        }
      });
    } else if (!conversationId) {
      setMessages([]);
      setHasMore(true);
      setLoading(false);
      setInitialLoading(false);
      loadedConversationId.current = null;
    }
    // Do not reload messages on every focus
    // eslint-disable-next-line
  }, [conversationId, isConnected, route?.params?.muted]);
  // Deduplicate messages by id after loading from backend
  useEffect(() => {
    setMessages(prevMessages => deduplicateMessages(prevMessages));

  }, [conversationId, isConnected]);
  // console.log(
  //   'lastMessage -=-=-=-=-=------->',
  //   JSON.stringify(lastMessage?.data?.messages),
  //   '\n',
  //   '\n',
  // );
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage?.type === 'error') {
      setInitialLoading(false);
      toastRef.current?.current?.show?.({
        type: 'error',
        message: lastMessage?.message,
      });
    } else if (route?.params?.isGroup && newMessageTrigger) {
      setNewMessage(true);
    }
    // Handle receive_messages_deleted_for_everyone locally for both sender and receiver
    if (lastMessage?.action === 'receive_messages_deleted_for_everyone' && lastMessage?.message_ids) {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          lastMessage.message_ids.includes(msg.id)
            ? { ...msg, content: '' }
            : msg
        )
      );
      return;
    }
    // changes
    const normalizeMessage = msg => {
      const commonFields = {
        id: msg?.id?.toString(),
        content: msg?.content || msg?.system_message || '',
        timestamp: new Date(msg?.created_at || Date.now()).toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          },
        ),
        status: msg?.status,
        reactions: msg?.reactions || [],
        is_thread_root: msg?.is_thread_root || false,
        replies_count: msg?.replies_count || 0,
        edited: msg?.edited || false,
        starred: typeof msg?.starred === 'boolean' ? msg.starred : false,
        pinned: typeof msg?.pinned === 'boolean' ? msg.pinned : false,
        optimistic: msg?.optimistic || false,
        tempId: msg?.tempId || undefined,
        created_at: msg?.created_at || new Date().toISOString(),
        updated_at: msg?.updated_at || new Date().toISOString(),
        media_attachments: msg?.media_attachments || [],
      };

      if (msg?.is_system_message) {
        return {
          ...commonFields,
          is_system_message: true,
          systemMessageType: msg?.system_message_type || 'info',
          senderName: null,
          avatar: null,
          isSender: false,
          id: msg?.system_message || '',
        };
      } else {
        return {
          ...commonFields,
          is_system_message: false,
          isSender: String(msg?.sender?.id) === String(User),
          senderName: msg?.sender?.name || msg?.sender?.email || '',
          avatar: msg?.sender?.avatar || null,
        };
      }
    };
    const action = lastMessage?.action;
    const messageData = lastMessage?.data;
    const currentConversationId =
      route?.params?.type === 'new' ? conversationValue : conversationId;
    if (
      (action === 'receive_new_message' && messageData) ||
      (action === 'receive_new_group_message' && messageData)
    ) {
      const msg = messageData?.message || messageData;
      const msgConversationId = msg?.conversation?.id || msg?.conversation_id;
      const msgGroupId = msg?.conversation?.group_id || msg?.group_id;
      const routeGroupId = route?.params?.GroupId;
      const isGroup = route?.params?.isGroup;
      // Log all relevant IDs for debugging
      const shouldAddMessage =
        (!isGroup && String(msgConversationId) === String(currentConversationId)) ||
        (isGroup && String(msgGroupId) === String(routeGroupId));

      if (shouldAddMessage) {
        const normalizedNewMessage = normalizeMessage(msg);

        // Save to local DB before updating UI
        try {
          // Save all fields from the server message in 'extra', and main columns for search/sort
          const localMsg = {
            id: msg?.id?.toString() || normalizedNewMessage.id,
            conversation_id: msg?.conversation_id || msg?.conversation?.id || msgGroupId || msgConversationId || '',
            sender_id: msg?.sender_id || msg?.sender?.id || '',
            content: msg?.content || msg?.system_message || '',
            created_at: msg?.created_at || normalizedNewMessage.created_at,
            status: msg?.status || 'received',
            is_group: typeof msg?.is_group === 'boolean' ? msg.is_group : !!isGroup,
            extra: msg, // Store the entire server message object
          };
          insertMessage(localMsg);
          console.log('Incoming message saved to local DB:', localMsg);
        } catch (err) {
          console.log('Error saving incoming message to local DB:', err);
        }

        setMessages(prevMessages => {
          // Remove any optimistic message with the same tempId if present,
          const filtered = prevMessages.filter(m => {
            if (m.optimistic) {
              // Prefer tempId match if both have it
              if (normalizedNewMessage.tempId && m.tempId && m.tempId === normalizedNewMessage.tempId) {
                return false;
              }
              // Fallback: match by content, senderName, and created_at within 3 seconds
              const createdA = new Date(m.created_at).getTime();
              const createdB = new Date(normalizedNewMessage.created_at).getTime();
              const timeDiff = Math.abs(createdA - createdB);
              if (
                m.content === normalizedNewMessage.content &&
                (m.senderName === normalizedNewMessage.senderName || m.senderName === 'You') &&
                timeDiff < 3000
              ) {
                return false;
              }
            }
            // Also filter out if the real message id already exists
            if (m.id === normalizedNewMessage.id) {
              return false;
            }
            return true;
          });
          return deduplicateMessages([normalizedNewMessage, ...filtered]);
        });

        if (navigation.isFocused()) {
          sendMessage({
            action: 'update_messages_status',
            status: 'delivered',
            message_ids: msg?.id,
            conversation_id: msgConversationId,
            is_group: msg?.is_group,
          });
        }

        if (!isScrolledUp.current && flatListRef.current) {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      } else {
        // console.log('Message conversationId/groupId does not match current, not adding to UI.');
      }
      return;
    }

    if (
      action === 'receive_message_updated' ||
      action === 'receive_messages_deleted' ||
      action === 'receive_messages_status_update' ||
      action === 'receive_thread_created' ||
      action === 'receive_thread_reply' ||
      action === 'receive_reaction_update' ||
      lastMessage?.message === 'Thread created' ||
      lastMessage?.message === 'Reaction added' ||
      lastMessage?.message === 'Reaction removed' ||
      lastMessage?.message === 'Messages updated successfully'
    ) {

      if (action === 'receive_message_updated' && messageData) {
        setMessages(prevMessages => {
          // Replace the message with the updated one, matching IDs as strings
          const updated = prevMessages.map(msg =>
            String(msg.id) === String(messageData.id) ? { ...msg, ...messageData } : msg
          );
          // Deduplicate if needed
          const uniqueMessages = [];
          const seenIds = new Set();
          for (const msg of updated) {
            if (!seenIds.has(msg.id)) {
              uniqueMessages.push(msg);
              seenIds.add(msg.id);
            }
          }
          return uniqueMessages;
        });
        // Update SQLite with the edited message content
        updateMessageContent(
          messageData.id,
          messageData.content,
          messageData.updated_at || new Date().toISOString()
        );
        return;
      } else if (action === 'receive_messages_status_update' && messageData?.message_ids && messageData?.status) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            messageData.message_ids.includes(msg.id) ? { ...msg, status: messageData.status } : msg
          )
        );
      } else if (action === 'receive_reaction_update' && messageData) {
        // If the server provides all reactions for the message, use them directly
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === messageData.message_id) {
              // If messageData.reactions exists, use it directly (show all reactions)
              if (Array.isArray(messageData.reactions)) {
                return {
                  ...msg,
                  reactions: messageData.reactions
                };
              }
              // Fallback: legacy single reaction update (keep old logic)
              const emojiMatch = messageData.content.match(/Reacted\s+(\p{Emoji})\s+to/gu);
              const emoji = emojiMatch ? emojiMatch[0].match(/\p{Emoji}/gu)[0] : '❤️';
              const newReaction = {
                reaction_id: messageData.id,
                reaction: emoji,
                id: messageData.user_id,
                name: messageData.email.split('@')[0],
                email: messageData.email,
                avatar: null,
                created_at: messageData.created_at
              };
              // Add or update this reaction (legacy fallback)
              const updatedReactions = [...(msg.reactions || [])];
              const existingReactionIndex = updatedReactions.findIndex(
                r => r.id === messageData.user_id && r.reaction === emoji
              );
              if (existingReactionIndex > -1) {
                updatedReactions[existingReactionIndex] = newReaction;
              } else {
                updatedReactions.push(newReaction);
              }
              return {
                ...msg,
                reactions: updatedReactions
              };
            }
            return msg;
          })
        );
      } else if (action === 'receive_thread_created' && messageData) {
        // console.log('receive_thread_created -=-=-=-=-=------->', lastMessage, '\n', messageData, '\n', '\n');
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === lastMessage?.data?.message_id) {
              return {
                ...msg,
                replies_count: (msg.replies_count || 0) + 1,
              };
            }
            return msg;
          }),
        );
        // console.log('react- update message -=-=-=-=-=------->',lastMessage,'\n', '\n');
        // loadMessages(currentPageRef.current);
      }
      else {
        loadMessages(currentPageRef.current);
      }
      return;
    }
    // Handle full message list
    if (lastMessage?.data?.messages) {
      const fetchedMessages = lastMessage?.data?.messages?.map(normalizeMessage);
      setLoading(false);
      setInitialLoading(false);
      if (fetchedMessages?.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setMessages(prevMessages => {
        // Remove optimistic messages that now have real counterparts from server
        const nonOptimisticMessages = prevMessages.filter(msg => {
          if (!msg.optimistic) return true;
          // Check if a real message with same content exists in fetched messages
          const hasRealMessage = fetchedMessages.some(
            fetched => fetched.content === msg.content && !fetched.optimistic
          );
          return !hasRealMessage;
        });

        const messageMap = new Map();
        nonOptimisticMessages.forEach(msg => messageMap.set(msg.id, msg));
        fetchedMessages.forEach(msg => messageMap.set(msg.id, msg));
        return Array.from(messageMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
      setNewMessage(false);
    }
    // Handle single new message
    if (
      (lastMessage?.action === 'receive_new_message' && lastMessage?.data) ||
      (lastMessage?.action === 'receive_new_group_message' && lastMessage?.message)
    ) {
      const msg = lastMessage?.data?.message || lastMessage?.data || lastMessage?.message;
      // --- Fix: Only add message if it belongs to the current conversation/group ---
      const msgConversationId = msg?.conversation?.id || msg?.conversation_id;
      const msgGroupId = msg?.conversation?.group_id || msg?.group_id;
      const routeGroupId = route?.params?.GroupId;
      const isGroup = route?.params?.isGroup;
      const currentConversationId = route?.params?.type === 'new' ? conversationValue : conversationId;
      const shouldAddMessage =
        (!isGroup && String(msgConversationId) === String(currentConversationId)) ||
        (isGroup && String(msgGroupId) === String(routeGroupId));
      if (msg && shouldAddMessage) {
        const normalizedNewMessage = normalizeMessage(msg);
        setMessages(prevMessages => {
          const exists = prevMessages.some(m => m.id === normalizedNewMessage.id);
          if (exists) return prevMessages;

          // Check if this is our own message (replacing an optimistic message)
          const isOwnMessage = normalizedNewMessage.isSender ||
            String(normalizedNewMessage.senderId) === String(currentUser?.id);

          if (isOwnMessage) {
            // Find and replace the optimistic message with matching content
            const optimisticIndex = prevMessages.findIndex(
              m => m.optimistic && m.content === normalizedNewMessage.content
            );

            if (optimisticIndex !== -1) {
              // Replace optimistic message with real message (which has real ID)
              const newMessages = [...prevMessages];
              newMessages[optimisticIndex] = normalizedNewMessage;
              return newMessages;
            }
          }

          return [normalizedNewMessage, ...prevMessages];
        });
      }
    }

    if (lastMessage?.message === 'Message sent') {
      // Update optimistic message status to "sent"
      // Find the most recent optimistic message (first one in the array since it's inverted)
      setMessages(prevMessages => {
        let foundOptimistic = false;
        return prevMessages.map(msg => {
          // Update the first optimistic message we find (most recent)
          if (!foundOptimistic && msg.optimistic && msg.isSender) {
            foundOptimistic = true;
            return {
              ...msg,
              status: [{ status: 'sent' }],
            };
          }
          return msg;
        });
      });

      // For new chats, update conversationValue and trigger reload
      if (
        route?.params?.type === 'new' &&
        lastMessage?.data?.conversation_id &&
        lastMessage?.data?.conversation_id !== conversationValue
      ) {
        setConversations(lastMessage?.data?.conversation_id);
        setPage(1);
        setHasMore(true);
        isScrolledUp.current = false;
        loadMessages(1);
      } else {
        // For existing chats, also reload to get real message with correct ID
        // This ensures optimistic message is replaced with server message
        loadMessages(1);
      }
      return;
    }
  }, [
    lastMessage,
    conversationId,
    User,
    sendMessage,
    conversationValue,
    route?.params?.type,
    loadMessages,
    navigation,
    isScrolledUp,
    messages.length,
    newMessageTrigger,
  ]);
  // Auto-scroll to bottom when new message arrives and user is not scrolled up
  useEffect(() => {
    if (!isScrolledUp.current && flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);
  // console.log('Message data check  -=-=-=--------->', JSON.stringify(lastMessage?.action), '\n', '\n');
  const dismissReactionPicker = useCallback(() => {
    if (reactionPickerState.visible) {
      setReactionPickerState({ visible: false, message: null, positionY: 0 });
      setSelectedMessage(null);
    }
  }, [reactionPickerState.visible]);

  const handleLongPressMessage = useCallback(
    (event, message) => {
      // Only allow emoji reaction picker if not in multi-select mode
      setSelectedMessages(prev => {
        if (!Array.isArray(prev)) return [message];
        if (prev.some(m => m && m.id === message.id)) {
          return prev.filter(m => m && m.id !== message.id);
        } else {
          return [...prev, message];
        }
      });
      setReplyCheck(false);
      setSelectedMessageStatus(message?.status);
      // Only show emoji picker if this is the only selected message and it is not already hidden
      setTimeout(() => {
        if (
          Array.isArray(selectedMessages)
            ? selectedMessages.length <= 1
            : true
        ) {
          // Only show if not already hidden
          if (!reactionPickerState.visible) {
            const { pageY } = event.nativeEvent;
            const pickerYPosition = pageY - headerHeight - insets.top - 60;
            setReactionPickerState({
              visible: true,
              message: message,
              positionY: pickerYPosition,
            });
          }
        } else {
          setReactionPickerState({ visible: false, message: null, positionY: 0 });
        }
      }, 0);
    },
    [headerHeight, insets.top, selectedMessages, reactionPickerState.visible],
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
      console.log(payload, "Reaction payload -=-=-=-=-=------->");

      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === message.id) {
            // Check if the current user already reacted with this emoji
            const alreadyReacted = (msg.reactions || []).some(
              r => r.reaction === reaction && (r.id === User || r.user_id === User)
            );
            if (alreadyReacted) {
              // Remove only this reaction (not all user's reactions)
              const updatedReactions = (msg.reactions || []).filter(
                r => !(r.reaction === reaction && (r.id === User || r.user_id === User))
              );
              sendMessage({
                action: 'add_reaction',
                message_id: message.id,
                reaction: reaction,
                is_group: route?.params?.isGroup || false,
              });
              sendMessage({
                action: 'get_message_reactions',
                message_id: message.id,
                reaction: reaction,
                is_group: route?.params?.isGroup || false,
              });
              return {
                ...msg,
                reactions: updatedReactions.length > 0 ? updatedReactions : null,
              };
            } else {
              // Add new reaction, allow multiple different reactions per user
              sendMessage({
                action: 'add_reaction',
                message_id: message.id,
                reaction: reaction,
                is_group: route?.params?.isGroup || false,
              });
              sendMessage({
                action: 'get_message_reactions',
                message_id: message.id,
                reaction: reaction,
                is_group: route?.params?.isGroup || false,
              });
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  {
                    id: currentUser?.id,
                    reaction,
                    name: 'You',
                    email: currentUser?.email || 'user@example.com',
                    avatar: currentUser?.profile_picture || null,
                  },
                ],
              };
            }
          }
          return msg;
        })
      );

      dismissReactionPicker();
      setSelectedMessages([]);
      setSelectedMessage(null);
    },
    [
      reactionPickerState,
      sendMessage,
      route?.params?.isGroup,
      dismissReactionPicker,
      User,
      currentUser,
      loadMessages,
    ],
  );

  const handleRemoveReaction = useCallback(
    payload => {
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === payload.message_id) {
            const updatedReactions =
              msg.reactions?.filter(
                r =>
                  !(
                    (r.id === payload.user_id || r.user_id === payload.user_id) &&
                    r.reaction === payload.reaction
                  )
              ) || [];

            return {
              ...msg,
              reactions: updatedReactions,
              reaction_count: Math.max(0, (msg.reaction_count || 0) - 1),
              updated_at: new Date().toISOString(),
            };
          }
          return msg;
        }),
      );

      sendMessage({
        ...payload,
        is_group: route?.params?.isGroup || false,
      });
    },
    [sendMessage, route?.params?.isGroup],
  );

  const handleCopyMessage = () => {
    Clipboard.setString(selectedMessages[0]?.content);
    toastRef.current.show({
      type: 'success',
      message: 'Message copied.',
    });
    setSelectedMessages([]); // Dismiss context menu after action
  };

  // Find the currently pinned message
  const pinnedMessage = messages.find(msg => msg.pinned);

  // WhatsApp-style pinned message banner
  const renderPinnedBanner = () => {
    // console.log(pinnedMessage, "pinnedMessage==========>");
    if (!pinnedMessage) return null;
    return (
      <>
        <View style={styles.pinnedBannerContainer}>
          <View style={styles.pinnedBannerLeft}>
            <PinSvg width="18" height="18" color={mainOrangeColor} />
            <View style={{ flex: 1, left: RfW(5) }}>
              <CustomText style={styles.pinnedBannerText} numberOfLines={1}>
                {pinnedMessage.content}
              </CustomText>
              <CustomText style={styles.pinnedBannerMeta} numberOfLines={1}>
                {pinnedMessage.senderName ? pinnedMessage.senderName : 'You'}
                {pinnedMessage.timestamp ? ` • ${pinnedMessage.timestamp}` : ''}
              </CustomText>
            </View>
          </View>
          <Pressable onPress={() => {
            // Unpin the message
            setMessages(prev => prev.map(msg => msg.id === pinnedMessage.id ? { ...msg, pinned: false } : msg));
            sendMessage({
              action: 'toggle_pin_message',
              message_id: pinnedMessage.id,
              conversation_id: conversationId,
              pin: false,
              is_group: route?.params?.isGroup || false,
            });
          }} style={styles.pinnedBannerClose}>
            <CustomText style={styles.pinnedBannerCloseText}>✕</CustomText>
          </Pressable>
        </View>
      </>
    );
  };

  // Callback to update replies_count for a message
  const handleThreadReplyCountChange = (threadMessageId, newCount) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        String(msg.id) === String(threadMessageId)
          ? { ...msg, replies_count: newCount }
          : msg
      )
    );
  };

  const renderMessageItem = useCallback(
    ({ item }) => {
      if (item.type === 'date-separator') {
        return (
          <View style={styles.dateSeparatorContainer}>
            <CustomText style={styles.dateSeparatorText}>{item.label}</CustomText>
          </View>
        );
      }
      const isSelected = Array.isArray(selectedMessages) && selectedMessages.some(m => m && m.id === item.id);
      let messageStyle = styles.messageWrapper;
      if (item.pinned) {
        messageStyle = [styles.messageWrapper, styles.pinnedMessage];
      }
      if (isSelected) {
        messageStyle = [messageStyle, { backgroundColor: '#FC8C4D26', borderRadius: 12 }];
      }
      const handleMessagePress = () => {
        // Only allow tap selection when already in selection mode
        if (selectedMessages.length === 0) return;

        // Always hide reaction picker when tapping to select/deselect
        setReactionPickerState({ visible: false, message: null, positionY: 0 });

        setSelectedMessages(prev => {
          if (!prev || prev.length === 0) return prev;

          const isAlreadySelected = prev.some(m => m && m.id === item.id);

          if (isAlreadySelected) {
            // Deselecting - if last item, exit selection mode
            return prev.filter(m => m && m.id !== item.id);
          } else {
            // Add to selection
            return [...prev, item];
          }
        });
        setReplyCheck(false);
        setSelectedMessageStatus(item?.status);
      };

      const handleMessageLongPress = (e) => {
        if (selectedMessages.length === 0) {
          // First selection - show reaction picker
          const { pageY } = e.nativeEvent;
          const pickerYPosition = pageY - headerHeight - insets.top - 60;
          setReactionPickerState({
            visible: true,
            message: item,
            positionY: pickerYPosition,
          });
          setSelectedMessages([item]);
        } else {
          // Already in selection mode - toggle selection, hide picker
          setReactionPickerState({ visible: false, message: null, positionY: 0 });
          setSelectedMessages(prev => {
            const isAlreadySelected = prev.some(m => m && m.id === item.id);
            if (isAlreadySelected) {
              return prev.filter(m => m && m.id !== item.id);
            }
            return [...prev, item];
          });
        }
        setReplyCheck(false);
        setSelectedMessageStatus(item?.status);
      };

      return (
        <Pressable
          onLongPress={handleMessageLongPress}
          onPress={handleMessagePress}
          style={messageStyle}
          disabled={item?.is_system_message}
        >
          <MessageType
            item={item}
            onLongPress={handleLongPressMessage}
            onPress={handleMessagePress}
            isGroup={route?.params?.isGroup}
            onRemoveReaction={handleRemoveReaction}
            navigation={navigation}
            currentUser={currentUser}
            pinnedMessage={pinnedMessage}
            onThreadReplyCountChange={handleThreadReplyCountChange}
          />
        </Pressable>
      );
    },
    [
      handleLongPressMessage,
      handleRemoveReaction,
      route?.params?.isGroup,
      navigation,
      currentUser,
      pinnedMessage,
      isFocused,
      selectedMessages,
      headerHeight,
      insets.top,
      setReplyCheck,
      setSelectedMessageStatus,
      setReactionPickerState
    ],
  );

  // Delete selected messages
  const handleDeleteSelectedMessages = () => {
    if (selectedMessages.length === 0) return;
    const ids = selectedMessages.map(m => String(m.id));
    sendMessage({
      action: 'delete_message',
      message_ids: ids,
      conversation_id: conversationId,
      is_group: route?.params?.isGroup || false,
    });
    setMessages(prevMessages => prevMessages.filter(msg => !ids.includes(String(msg.id))));
    setSelectedMessages([]);
  };

  const handleSend = useCallback(
    async data => {
      if (!isConnected) {
        let retryCount = 0;
        const maxRetries = 3;
        const tryReconnect = () => {
          if (retryCount < maxRetries) {
            retryCount++;
            connect();
            reconnect();
            setTimeout(() => {
              if (!isConnected) {
                tryReconnect();
              }
            }, 1000);
          } else {
            Alert.alert(
              'Connection Error',
              "WebSocket not ready. Can't send message after multiple attempts. Please check your connection.",
            );
          }
        };
        tryReconnect();
        return;
      }


      // Create a more unique tempId: userId + timestamp + random string
      const userIdPart = currentUser?.id ? String(currentUser.id) : 'nouser';
      const tempId = `temp-${userIdPart}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const optimisticMessage = {
        id: tempId, // Use the temporary ID
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        isSender: true,
        senderName: currentUser?.first_name || currentUser?.name || 'You',
        status: [{ status: 'no' }],
        optimistic: true,
        avatar: currentUser?.avatar || currentUser?.profile_picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tempId: tempId,
      };


      // Utility to clear selection and hide event header
      const clearSelection = () => {
        setSelectedMessages([]);
        setSelectedMessageStatus([]);
        setReactionPickerState({
          visible: false,
          message: null,
          positionY: 0,
        });
      };

      // Save to local DB before sending
      try {
        // Save all fields from the server message in 'extra', and main columns for search/sort
        const localMsg = {
          id: optimisticMessage.id,
          conversation_id: route?.params?.conversationId || route?.params?.GroupId || '',
          sender_id: currentUser?.id || '',
          content: JSON.stringify(data), // Save the full payload for resend
          created_at: optimisticMessage.created_at,
          status: isConnected ? 'local' : 'pending',
          is_group: !!route?.params?.isGroup,
          extra: optimisticMessage,
        };
        insertMessage(localMsg);
        console.log('Message saved to local DB:', localMsg);
      } catch (err) {
        console.log('Error saving message to local DB:', err);
      }

      if (ReplyCheck) {
        const payload = {
          action: selectedMessages[0]?.is_thread_root ? 'reply_to_thread' : 'create_thread',
          message_id: selectedMessages[0]?.id,
          is_group: route?.params?.isGroup,
          text: data.content,
        };

        // Optimistic update for thread replies
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === payload.message_id) {
              return {
                ...msg,
                replies_count: (msg.replies_count || 0) + 1,
              };
            }
            return msg;
          }),
        );
        // Add optimistic thread reply message to the list (as a regular message for now)
        // setMessages(prevMessages => [optimisticMessage, ...prevMessages]);

        sendMessage(payload);
        setReplyCheck(false);
        setSelectedMessage(null);
        clearSelection();

        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      } else {
        // Optimistic update for regular messages
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }

        // Add optimistic message to state immediately for instant UI feedback
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
        setNewMessage(true);
      }
    },
    [
      sendMessage,
      route?.params?.isGroup,
      route?.params?.GroupId,
      route?.params?.type,
      ReplyCheck,
      selectedMessages,
      currentUser, // Use currentUser here
      isConnected,
      flatListRef,
      loadMessages,
    ],
  );

  const handleEditMessage = editedMessage => {
    // Accept both string (old) and object (new) edit message formats
    let messageId, newContent;
    if (editedMessage && typeof editedMessage === 'object' && editedMessage.messageId && editedMessage.newContent !== undefined) {
      messageId = editedMessage.messageId;
      newContent = editedMessage.newContent;
    } else {
      // fallback for string usage
      messageId = selectedMessage?.id;
      newContent = editedMessage;
    }
    // Find the original message content
    const originalMessage = messages.find(msg => msg.id === messageId);
    const originalContent = originalMessage?.content?.trim() || '';
    const newContentTrimmed = (newContent || '').trim();
    // Only proceed if the content has actually changed
    if (
      messageId &&
      newContent !== undefined &&
      newContentTrimmed !== originalContent
    ) {
      const payload = {
        action: 'edit_message',
        message_id: messageId,
        new_content: newContent,
        conversation_id: conversationId,
        is_group: route?.params?.isGroup || false,
      };
      sendMessage(payload);
      console.log(payload, "edit message payload=========>");
      // Optimistic UI update for edited message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent, edited: true, updated_at: new Date().toISOString() }
            : msg,
        ),
      );
      setEditmessagestatus(false);
      setSelectedMessage(null);
    } else {
      // If no change, just exit edit mode without updating
      setEditmessagestatus(false);
      setSelectedMessage(null);
    }
  };

  const handleAllDeleteMessage = () => {
    const payload = {
      action: 'delete_conversation',
      conversation_id: conversationId,
      is_group: route?.params?.isGroup || false,
    };
    // console.log('Delete payload:', payload);
    sendMessage(payload);
    setMessages([]);
    setHasMore(false);
  };

  const handleStarMessage = () => {
    const payload = {
      action: 'toggle_star_messages',
      message_ids: selectedMessages[0]?.id,
      star: !selectedMessages[0]?.starred,
      is_group: route?.params?.isGroup || false,
    };
    console.log('Star message payload:', payload);
    sendMessage(payload);
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === selectedMessages[0]?.id ? { ...msg, starred: !msg.starred } : msg,
      ),
    );

    setSelectedMessages([]);
  };

  const handleMuteOptions = (dataObj) => {
    // Use provided dataObj or fallback to route params
    const d = dataObj || route?.params || {};
    const newMuted = !d.muted;
    const payload = {
      action: 'toggle_mute_conversation',
      conversation_id: d.conversationId || conversationId,
      mute: newMuted, // Toggle mute status
      is_group: d.isGroup || false,
    };
    console.log('Mute payload:', payload, 'with data:', d);
    sendMessage(payload);
    // Immediate UI update: update both route.params.muted and localMuted
    if (route && route.params) {
      route.params.muted = newMuted;
    }
    setLocalMuted(newMuted);
  };

  // Pin or unpin a message
  const handlePinCreateion = () => {
    if (!selectedMessages.length) return;
    const isPinning = !selectedMessages[0].pinned;
    const payload = {
      action: 'toggle_pin_message',
      message_id: selectedMessages[0].id,
      conversation_id: conversationId,
      pin: isPinning,
      is_group: route?.params?.isGroup || false,
    };
    console.log("pin=========>", payload);

    sendMessage(payload);
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (isPinning) {
          // Pin this message, unpin all others
          return { ...msg, pinned: msg.id === selectedMessages[0].id };
        } else {
          // Unpin all messages
          return { ...msg, pinned: false };
        }
      })
    );
    setSelectedMessages([]);
    setSelectedMessage(null);
    setSelectedMessageStatus([]);
  };

  const onScroll = useCallback(event => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    isScrolledUp.current = scrollOffset > 50;
    setShowScrollToBottom(scrollOffset > 50);
  }, []);

  // Accept deleteType: 'for_me' or 'for_everyone'
  const handleDeleteMessage = useCallback((deleteType = 'for_me') => {
    if (!selectedMessages || selectedMessages.length === 0) return;
    const isGroup = route?.params?.isGroup || false;
    sendMessage({
      action: 'delete_message',
      message_ids: String(selectedMessages[0].id),
      conversation_id: conversationId,
      is_group: isGroup,
      delete_type: deleteType,
    });
    // Optimistically remove the message from UI for 'for_me' only
    if (deleteType === 'for_me') {
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== selectedMessages[0].id)
      );
    } else if (deleteType === 'for_everyone') {
      // For 'for_everyone', immediately blank out the content locally
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === selectedMessages[0].id
            ? { ...msg, content: '' }
            : msg
        )
      );
      // Immediately call the receive_messages_deleted_for_everyone action locally
      sendMessage({
        action: 'receive_messages_deleted_for_everyone',
        conversation_id: conversationId,
        message_ids: [String(selectedMessages[0].id)],
        deleted_by: { id: String(currentUser?.id), name: currentUser?.name || currentUser?.first_name || '' },
        deleted_at: new Date().toISOString(),
      });
    }

    setSelectedMessages([]);
    setSelectedMessageStatus([]);
    setReactionPickerState({
      visible: false,
      message: null,
      positionY: 0,
    });
  }, [selectedMessages, conversationId, route?.params?.isGroup, sendMessage]);

  return (
    <ScreenView>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      {renderToastMessage}
      {/* Multi-select toolbar */}
      {selectedMessages?.length > 1 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FC8C4D26', padding: 10, zIndex: 100 }}>
          <CustomText style={{ flex: 1, color: '#FF8C00', fontFamily: fonts.PoppinsSemiBold }}>{selectedMessages.length} selected</CustomText>
          <Pressable onPress={handleDeleteSelectedMessages} style={{ marginHorizontal: 10 }}>
            <CustomText style={{ color: 'red', fontFamily: fonts.PoppinsSemiBold }}>Delete</CustomText>
          </Pressable>
          <Pressable onPress={() => setSelectedMessages([])} style={{ marginHorizontal: 10 }}>
            <CustomText style={{ color: '#FF8C00', fontFamily: fonts.PoppinsSemiBold }}>Cancel</CustomText>
          </Pressable>
        </View>
      )}
      <Windowsheader
        key={localMuted ? 'muted' : 'unmuted'}
        navigation={navigation}
        Condition={selectedMessages?.length === 1}
        name={route?.params?.name}
        setReplyCheck={setReplyCheck}
        isGroup={route?.params?.isGroup}
        GroupId={route?.params?.GroupId}
        selectedMessageStatus={selectedMessageStatus}
        selectedmsg={selectedMessages}
        setSelectedMessageStatus={setSelectedMessages}
        setSelectedMessage={setSelectedMessage}
        handleDeleteMessage={handleDeleteMessage}
        setReactionPickerState={setReactionPickerState}
        data={{ ...route?.params, muted: localMuted }}
        selectedMessage={selectedMessages && selectedMessages.length > 0 ? selectedMessages[0] : null}
        handleCopyMessage={handleCopyMessage}
        conversationId={
          route?.params?.type === 'new' ? conversationValue : conversationId
        }
        setEditmessagestatus={setEditmessagestatus}
        loadMessages={loadMessages}
        handleAllDeleteMessage={handleAllDeleteMessage}
        handleStarMessagecheck={handleStarMessage}
        handleMuteOptions={(dataObj) => handleMuteOptions(dataObj)}
        handlePinCreateion={handlePinCreateion}
        setMentionAll={setMentionAll}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight + (StatusBar.currentHeight || 0) + insets.top,
          android: headerHeight + (StatusBar.currentHeight || 0) + insets.bottom,
        })}
      >

        {/* WhatsApp-style pinned message banner */}
        {renderPinnedBanner()}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Pressable style={{ flex: 1 }} onPress={dismissReactionPicker}>
              <FlashList
                ref={flatListRef}
                data={messagesWithSeparators}
                renderItem={renderMessageItem}
                keyExtractor={item => item._id || String(item.id)}
                showsVerticalScrollIndicator={false}
                inverted
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                style={styles.messageList}
                contentContainerStyle={styles.messageListContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                extraData={selectedMessages}
                ListFooterComponent={
                  loading && page > 1 ? (
                    <ActivityIndicator
                      size="small"
                      color={mainOrangeColor}
                      style={styles.loader}
                    />
                  ) : null
                }
                ListEmptyComponent={
                  initialLoading && messages.length === 0 ? (
                    // Show skeleton loader during initial load
                    <View style={styles.skeletonContainer}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, index) => (
                        <View key={index} style={[
                          styles.skeletonMessage,
                          index % 2 === 0 && styles.skeletonMessageRight
                        ]}>
                          {index % 2 === 0 ? (
                            // Right side (sent message)
                            <>
                              <View style={styles.skeletonContentRight}>
                                <View style={[styles.skeletonBubble, styles.skeletonBubbleRight]} />
                                <View style={styles.skeletonTimeRight} />
                              </View>
                            </>
                          ) : (
                            // Left side (received message)
                            <>
                              <View style={styles.skeletonAvatar} />
                              <View style={styles.skeletonContent}>
                                <View style={styles.skeletonBubble} />
                                <View style={styles.skeletonTime} />
                              </View>
                            </>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : !loading && messages.length === 0 ? (
                    <View style={[styles.emptyContainerContent, { transform: [{ scaleX: -1 },] }]}>
                      <CustomText style={[styles.noMessagesText, { transform: [{ scaleY: -1 }] }]}>No messages yet</CustomText>
                    </View>
                  ) : null
                }
                estimatedItemSize={70}
                onScrollToIndexFailed={info => {
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  });
                }}
                onContentSizeChange={() => {
                  if (
                    currentPageRef.current === 1 &&
                    !isScrolledUp.current &&
                    messages.length > 0
                  ) {
                    flatListRef.current?.scrollToOffset({
                      offset: 0,
                      animated: false,
                    });
                  }
                }}
                onScroll={onScroll}
              />
            </Pressable>
            {/* Floating Down Arrow Button */}
            {showScrollToBottom && (
              <Pressable
                style={styles.scrollToBottomButton}
                onPress={() => {
                  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                }}
                accessibilityLabel="Scroll to latest message"
              >
                <DownArrowSvg width={22} height={22} color={'#FF8C00'} />
              </Pressable>
            )}
            {/* <View style={{ maxHeight: 120, backgroundColor: 'transparent', minHeight: 140 }}> */}
            <ChatInputBar
              onSend={handleSend}
              selectedMessage={selectedMessages && selectedMessages.length > 0 ? selectedMessages[0] : null}
              ReplyCheck={ReplyCheck}
              setReplyCheck={setReplyCheck}
              isGroup={route?.params?.isGroup}
              GroupId={route?.params?.GroupId}
              setSelectedMessage={setSelectedMessages}
              setEditmessagestatus={setEditmessagestatus}
              editmessagestatus={Editmessagestatus}
              onEditMessage={handleEditMessage}
              onMediaSent={msg => setMessages(prev => [msg, ...prev])}
            />
            {/* </View> */}

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} />

      {/* WhatsApp-style emoji reaction picker overlay */}
      {reactionPickerState.visible && selectedMessages.length === 1 && (
        <View
          style={[
            styles.pickerWrapper,
            { top: reactionPickerState.positionY, alignSelf: 'center', zIndex: 1000 },
          ]}
          pointerEvents="box-none"
        >
          <ReactionPicker
            onSelectReaction={handleSelectReaction}
            currentUserId={currentUser?.id}
            message={reactionPickerState.message}
          />
        </View>
      )}
    </ScreenView>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    position: 'absolute',
    // top is set dynamically
    alignSelf: 'center',
    zIndex: 1000,
    // No width/height: let content size
  },
  pinnedBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mainOrange20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 2,
    marginTop: 2,
    minHeight: 48,
    zIndex: 10,
  },
  pinnedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  pinnedIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#FFB300',
  },
  pinnedBannerText: {
    fontSize: 14,
    color: '#333',
    fontFamily: fonts.PoppinsMedium,
    maxWidth: 220,
  },
  pinnedBannerMeta: {
    fontSize: 11,
    color: '#888',
    fontFamily: fonts.PoppinsRegular,
    marginTop: 2,
    maxWidth: 220,
  },
  pinnedBannerClose: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 12,
  },
  pinnedBannerCloseText: {
    fontSize: 18,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: RfH(50),
    left: RfW(12),
    right: RfW(12),
    zIndex: 1000,
    backgroundColor: mainOrangeColor,
    borderRadius: RfH(12),
    paddingVertical: RfH(10),
    paddingHorizontal: RfW(14),
    flexDirection: 'row',
    alignItems: 'center',

    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  selectedMessage: {
    backgroundColor: 'red',
    borderRadius: 12,
  },
  avatarCircle: {
    width: RfH(36),
    height: RfH(36),
    borderRadius: RfH(18),
    backgroundColor: mainWhiteColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RfW(12),
  },
  pinnedMessage: {
    // backgroundColor: mainOrange20,
    // borderRadius: 10,
    // marginVertical: 2,
    // padding: 2,
  },
  messageWrapper: {
    // Ensures consistent spacing for all messages
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatContainer: {
    flex: 1,
    // backgroundColor: '#f8f9fa',
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
  // Modified emptyContainer styling for better visibility with inverted FlatList
  emptyContainerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    top: RfH(300),
    position: 'absolute',
    alignSelf: 'center'
  },
  noMessagesText: {
    textAlign: 'center',
    color: mainGrayColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 16,
    // Add a higher zIndex if text is getting covered
    zIndex: 1,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  skeletonMessage: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  skeletonMessageRight: {
    justifyContent: 'flex-end',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    maxWidth: '75%',
  },
  skeletonContentRight: {
    flex: 1,
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  skeletonBubble: {
    height: 50,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
    width: '100%',
  },
  skeletonBubbleRight: {
    backgroundColor: '#F0F0F0',
  },
  skeletonTime: {
    height: 10,
    width: 50,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  skeletonTimeRight: {
    alignSelf: 'flex-end',
  },
  // ... rest of your styles remain unchanged ...
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
    bottom: RfH(20),
  },
  snackbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingTop: RfW(40),
  },
  snackbarGradient: {
    borderRadius: 12,
    paddingHorizontal: RfW(12),
    paddingVertical: RfW(8),
    marginTop: RfW(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: RfW(2) },
    shadowOpacity: 0.3,
    shadowRadius: RfW(4),
    elevation: 6,
    minWidth: RfW(240),
  },
  snackbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarIcon: {
    marginRight: RfW(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RfW(20),
    padding: RfW(4),
  },
  snackbarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: fonts.PoppinsMedium,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: RfW(20),
    bottom: RfH(134),
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  snackbarContent: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.3,
    fontFamily: fonts.PoppinsRegular,
    // marginLeft: 8,
  },
  dateSeparatorContainer: {
    alignSelf: 'center',
    backgroundColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginVertical: 8,
    minWidth: 80,
  },
  dateSeparatorText: {
    color: '#555',
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
  },
});

export default ScreenWindows;