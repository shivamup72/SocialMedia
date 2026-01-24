
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
  BackHandler,
  Animated,
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Windowsheader from './windowsHeader/Windowsheader';
import ChatInputBar from './MediaComponents/MediaComponents';
import { mainOrangeColor, fonts, mainGrayColor, mainOrange80, mainOrange92, mainOrange20, DarkColor, mainWhiteColor } from '../../utils/style/fonts';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { useHeaderHeight } from '@react-navigation/elements';
import MessageType from './ChatTypeComponents/MessageType';
import ReactionPicker from './ReactionPicker';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Toast from '../../Api/context/Toast';
import ScreenView from '../../utils/ScreenView';
import PinSvg from '../../assets/svg/PinSvg';
import { RfH, RfW } from '../../utils/helper';
import LinearGradient from 'react-native-linear-gradient';

const ScreenWindows = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  console.log(messages, 'messages state');


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
  const isFocused = useIsFocused();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]); // For multiple selection
  const toastRef = useRef(null);
  const [NewMessage, setNewMessage] = useState(false);
  const conversationId = route?.params?.conversationId;
  const PAGE_SIZE = 15;

  // console.log(
  //   'route?.params -=-=-=-=-=---------->',
  //   route?.params,
  //   '\n',
  //   '\n',
  //   '\n',
  // );

  const [reactionPickerState, setReactionPickerState] = useState({
    visible: false,
    message: null,
    positionY: 0,
  });

  const headerHeight = useHeaderHeight();
  const currentPageRef = useRef(1);
  const didMountRef = useRef(false);

  // Reload messages when returning to this screen (e.g., after adding a thread reply)
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
          <Text
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
          </Text>
        </View>
        {/* Message Content */}
        <View style={{ flex: 1 }}>
          {messageData?.message?.conversation?.group_name ? <Text style={{
            color: mainWhiteColor,
            fontFamily: fonts.PoppinsMedium,
            fontSize: RfH(14),
          }}>{messageData?.message?.conversation?.group_name}</Text> : null}
          <Text
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
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: mainWhiteColor,
              fontFamily: fonts.PoppinsRegular,
              fontSize: RfH(10),
              opacity: 0.9,
            }}
          >
            {msg?.content}
          </Text>
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


  useEffect(() => {
    console.log('WebSocket lastMessage:', JSON.stringify(lastMessage));
    const fetData = async () => {
      try {
        const res = await AsyncStorage1.getItem('userLoginResponse');
        setUser(res?.data?.user?.id);
        setCurrentUser(res?.data?.user);
      } catch (err) {
        console.log('Error in useEffect', err);
      }
    };
    fetData();
    didMountRef.current = true;
  }, []);


  useEffect(() => {
    const onBackPress = () => {
      if (
        route?.params?.navigatetype === 'privatenavigate' ||
        route?.params?.navigatetype === 'groupnavigate'
      ) {
        navigation.navigate('Home', {
          screen: 'Chat',
          params: { screen: 'ChatMain' },
        });
      } else {
        navigation.goBack();
      }
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [navigation, route?.params?.navigatetype]);



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


  // console.log("recived new msg okkkkkkkkkk", messages);


  const handleLoadMore = useCallback(() => {

    if (!loading && hasMore && messages.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  }, [loading, hasMore, page, loadMessages, messages.length]);


  useEffect(() => {
    if (isFocused) {
      if (isConnected && conversationId) {
        setPage(1);
        setMessages([]);
        setHasMore(true);
        setInitialLoading(true);
        isScrolledUp.current = false;
        loadMessages(1);
      } else if (!conversationId) {
        setMessages([]);
        setHasMore(true);
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [conversationId, isConnected]);

  // Deduplicate messages by id after loading from backend
  useEffect(() => {
    setMessages(prevMessages => {
      const uniqueMessages = [];
      const seenIds = new Set();
      for (const msg of prevMessages) {
        if (!seenIds.has(msg.id)) {
          uniqueMessages.push(msg);
          seenIds.add(msg.id);
        }
      }
      return uniqueMessages;
    });

  }, [conversationId, isConnected]);


  // console.log(
  //   'lastMessage -=-=-=-=-=------->',
  //   JSON.stringify(lastMessage?.data?.messages),
  //   '\n',
  //   '\n',
  // );

  useEffect(() => {
    if (!lastMessage || !didMountRef.current) return;
    if (lastMessage?.type === 'error') {
      setInitialLoading(false);
      toastRef.current?.current?.show?.({
        type: 'error',
        message: lastMessage?.message,
      });
    } else if (route?.params?.isGroup && newMessageTrigger) {
      setNewMessage(true);
    }

    // previous message

    // const normalizeMessage = msg => ({
    //   id: msg?.id?.toString(),
    //   content: msg?.content || msg?.system_message,
    //   timestamp: new Date(msg?.created_at || Date.now()).toLocaleTimeString(
    //     [],
    //     {
    //       hour: '2-digit',
    //       minute: '2-digit',
    //       hour12: true,
    //     },
    //   ),
    //   isSender: String(msg?.sender?.id) === String(User),
    //   senderName: msg?.sender?.name || msg?.sender?.email,
    //   status: msg?.status,
    //   reactions: msg?.reactions || [],
    //   is_system_message: msg?.is_system_message || false,
    //   is_thread_root: msg?.is_thread_root || false,
    //   replies_count: msg?.replies_count || 0,
    //   avatar: msg?.sender?.avatar || null,
    //   edited: msg?.edited || false,
    //   starred: msg?.starred || false,
    //   optimistic: msg?.optimistic || false,
    //   created_at: msg?.created_at || new Date().toISOString(),
    //   updated_at: msg?.updated_at || new Date().toISOString(),
    // });


    // changes
    const normalizeMessage = msg => {
      const commonFields = {
        id: msg?.id?.toString(),
        content: msg?.content || msg?.system_message,
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
        created_at: msg?.created_at || new Date().toISOString(),
        updated_at: msg?.updated_at || new Date().toISOString(),
      };

      if (msg?.is_system_message) {
        return {
          ...commonFields,
          is_system_message: true,
          systemMessageType: msg?.system_message_type || 'info',
          senderName: null,
          avatar: null,
          isSender: false,
          id: msg?.system_message,
        };
      } else {
        return {
          ...commonFields,
          is_system_message: false,
          isSender: String(msg?.sender?.id) === String(User),
          senderName: msg?.sender?.name || msg?.sender?.email,
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
      // console.log('msgConversationId:', msgConversationId, 'currentConversationId:', currentConversationId, 'msgGroupId:', msgGroupId, 'routeGroupId:', routeGroupId, 'isGroup:', isGroup);

      const shouldAddMessage =
        (!isGroup && String(msgConversationId) === String(currentConversationId)) ||
        (isGroup && String(msgGroupId) === String(routeGroupId));

      if (shouldAddMessage) {
        const normalizedNewMessage = normalizeMessage(msg);

        setMessages(prevMessages => {
          // Remove any optimistic message with the same content and senderName
          const filtered = prevMessages.filter(
            m =>
              !(m.optimistic && m.content === normalizedNewMessage.content && (m.senderName === normalizedNewMessage.senderName || m.senderName === 'You'))
          );
          // Add new message and deduplicate by id
          const allMessages = [normalizedNewMessage, ...filtered];
          const uniqueMessages = [];
          const seenIds = new Set();
          for (const msg of allMessages) {
            if (!seenIds.has(msg.id)) {
              uniqueMessages.push(msg);
              seenIds.add(msg.id);
            }
          }
          return uniqueMessages;
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
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
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
          const updatedMsg = normalizeMessage(messageData);
          return prevMessages.map(msg =>
            msg.id === updatedMsg.id
              ? { ...msg, ...updatedMsg, starred: updatedMsg.starred, edited: true }
              : msg
          );
        });
      } else if (action === 'receive_messages_deleted' && messageData?.message_ids) {
        // console.log('Deleting messages with IDs:', messageData.message_ids);
        setMessages(prevMessages =>
          prevMessages.filter(msg => !messageData.message_ids.includes(String(msg.id)))
        );
      } else if (action === 'receive_messages_status_update' && messageData?.message_ids && messageData?.status) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            messageData.message_ids.includes(msg.id) ? { ...msg, status: messageData.status } : msg
          )
        );
      } else if (action === 'receive_reaction_update' && messageData) {
        // console.log('reaction-update message -=-=-=-=-=------->', messageData, '\n', '\n');

        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === messageData.message_id) {

              // Extract emoji using Unicode property escape to handle all emoji characters
              const emojiMatch = messageData.content.match(/Reacted\s+(\p{Emoji})\s+to/gu);
              const emoji = emojiMatch ? emojiMatch[0].match(/\p{Emoji}/gu)[0] : '❤️';
              console.log('emoji -=-=-=-=-=------->', emoji, '\n', '\n');

              const newReaction = {
                reaction_id: messageData.id,
                reaction: emoji,
                id: messageData.user_id,
                name: messageData.email.split('@')[0],
                email: messageData.email,
                avatar: null,
                created_at: messageData.created_at
              };

              // Check if user already has a reaction on this message
              const existingReactionIndex = msg.reactions?.findIndex(
                r => r.id === messageData.user_id
              );

              const updatedReactions = [...(msg.reactions || [])];

              if (existingReactionIndex > -1) {
                // Update existing reaction
                updatedReactions[existingReactionIndex] = newReaction;
              } else {
                // Add new reaction
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



    if (lastMessage?.data?.messages) {
      const fetchedMessages = lastMessage?.data?.messages?.map(normalizeMessage);
      // console.log('fetchedMessages 1 -=-=-=-------->',JSON.stringify(fetchedMessages),  '\n', '\n');
      setLoading(false);
      setInitialLoading(false);

      if (fetchedMessages?.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (NewMessage) {
        // After reload, do NOT preserve optimistic messages: only show confirmed messages from backend
        setMessages(fetchedMessages);
        setNewMessage(false);
        return;
      } else {
        setMessages(prevMessages => {
          const messageMap = new Map(
            prevMessages
              .filter(msg => !msg.optimistic)
              .map(msg => [msg.id, msg])
          );

          fetchedMessages.forEach(newMsg => {
            const existingMsg = messageMap.get(newMsg.id);
            if (existingMsg) {
              messageMap.set(newMsg.id, {
                ...existingMsg,
                ...newMsg,
                reactions: newMsg.reactions !== undefined ? newMsg.reactions : existingMsg.reactions,
                status: newMsg.status !== undefined ? newMsg.status : existingMsg.status,
                updated_at: newMsg.updated_at || existingMsg.updated_at,
                edited: newMsg.edited !== undefined ? newMsg.edited : existingMsg.edited,
                replies_count: newMsg.replies_count !== undefined ? newMsg.replies_count : existingMsg.replies_count,
              });
            } else {
              messageMap.set(newMsg.id, {
                ...newMsg,
                status: newMsg.status || { status: 'sent' },
                reactions: newMsg.reactions || [],
                replies_count: newMsg.replies_count || 0,
              });
            }
          });

          return Array.from(messageMap.values());
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
        // Don't clear messages - preserve optimistic messages until real message arrives
        // The optimistic message will be replaced when receive_new_message is received
        setHasMore(true);
        isScrolledUp.current = false;
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
  // useEffect(() => {
  //   if (lastMessage?.data?.conversations?.conversation_id === route?.params?.item?.conversation_id) {
  //     setToastMessage(lastMessage?.data?.sender_name);
  //     setToastContent(lastMessage?.data?.content);
  //     setToastVisible(true);
  //     Animated.timing(toastAnim, {
  //       toValue: 0,
  //       duration: 400,
  //       useNativeDriver: true,
  //     }).start();
  //     if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  //     toastTimeoutRef.current = setTimeout(() => {
  //       Animated.timing(toastAnim, {
  //         toValue: -100,
  //         duration: 400,
  //         useNativeDriver: true,
  //       }).start(() => setToastVisible(false));
  //     }, 2000);
  //   }
  //   return () => {
  //     if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  //   };
  // }, [lastMessage]);

  // console.log('Message data check  -=-=-=--------->', JSON.stringify(lastMessage?.action), '\n', '\n');


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


      const tempId = `temp-${Date.now()}`; // Create a temporary ID
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
        setMessages(prevMessages => [optimisticMessage, ...prevMessages]);
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }

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

        // For new chats, don't load messages immediately - wait for "Message sent" response
        // which will provide the conversation_id and trigger loadMessages
        if (route?.params?.type === 'new') {
          setNewMessage(true);
          // Don't call loadMessages here - it will be called when we receive the conversation_id
          // in the "Message sent" response handler
        } else {
          setNewMessage(true);
          loadMessages(1);
        }
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


  const dismissReactionPicker = useCallback(() => {
    if (reactionPickerState.visible) {
      setReactionPickerState({ visible: false, message: null, positionY: 0 });
      setSelectedMessage(null);
    }
  }, [reactionPickerState.visible]);



  const handleLongPressMessage = useCallback(
    (event, message) => {
      // Toggle selection
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
      const { pageY } = event.nativeEvent;
      const pickerYPosition = pageY - headerHeight - insets.top - 60;
      setReactionPickerState({
        visible: true,
        message: message,
        positionY: pickerYPosition,
      });
    },
    [headerHeight, insets.top],
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


      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === message.id) {
            const existingReactionIndex = msg.reactions?.findIndex(
              r => r.reaction === reaction && r.user_id === User,
            );

            if (existingReactionIndex >= 0) {
              const updatedReactions = [...(msg.reactions || [])];
              updatedReactions.splice(existingReactionIndex, 1);
              return {
                ...msg,
                reactions:
                  updatedReactions.length > 0 ? updatedReactions : null,
              };
            } else {
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
        }),
      );


      sendMessage(payload);
      dismissReactionPicker();
      // Hide header and unselect message after picking a reaction
      setSelectedMessages([]);
      setSelectedMessage(null);

      // console.log("lastMessage data handleSelectReaction -=-=-=-=----->", currentUser,'\n','\n');
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
                r => r.reaction_id !== payload.reaction_id,
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
      <View style={styles.pinnedBannerContainer}>
        <View style={styles.pinnedBannerLeft}>
          <PinSvg width="18" height="18" color={mainOrangeColor} />
          <View style={{ flex: 1, left: RfW(5) }}>
            <Text style={styles.pinnedBannerText} numberOfLines={1}>
              {pinnedMessage.content}
            </Text>
            <Text style={styles.pinnedBannerMeta} numberOfLines={1}>
              {pinnedMessage.senderName ? pinnedMessage.senderName : 'You'}
              {pinnedMessage.timestamp ? ` • ${pinnedMessage.timestamp}` : ''}
            </Text>
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
          <Text style={styles.pinnedBannerCloseText}>✕</Text>
        </Pressable>
      </View>
    );
  };

  const renderMessageItem = useCallback(
    ({ item }) => {
      const isSelected = Array.isArray(selectedMessages) && selectedMessages.some(m => m && m.id === item.id);
      return (
        <Pressable
          onLongPress={e => handleLongPressMessage(e, item)}
          onPress={() => {
            if (selectedMessages.length === 0) return;
            setSelectedMessages(prev => {
              let newSelected;
              if (prev.some(m => m.id === item.id)) {
                newSelected = prev.filter(m => m.id !== item.id);
              } else {
                newSelected = [...prev, item];
              }
              console.log(newSelected.length, "newSelected.length=========>");

              if (newSelected.length > 1 || newSelected.length === 0) {
                setReactionPickerState({ visible: false, message: null, positionY: 0 });
              }
              return newSelected;
            });
          }}
          style={[
            item.pinned ? [styles.pinnedMessage, styles.messageWrapper] : styles.messageWrapper,
            isSelected ? { backgroundColor: '#fff4e2ff', borderRadius: 12 } : null,
          ]}
          disabled={item?.is_system_message}
        >
          <MessageType
            item={item}
            onLongPress={handleLongPressMessage}
            isGroup={route?.params?.isGroup}
            onRemoveReaction={handleRemoveReaction}
            navigation={navigation}
            currentUser={currentUser}
            pinnedMessage={pinnedMessage}
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
      selectedMessages
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
    if (messageId && newContent !== undefined) {
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
      message_ids: [selectedMessages[0]?.id],
      star: !selectedMessages[0]?.starred,
      is_group: route?.params?.isGroup || false,
    };

    sendMessage(payload);
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === selectedMessages[0]?.id ? { ...msg, starred: !msg.starred } : msg,
      ),
    );

    setSelectedMessages([]);
  };

  const handleMuteOptions = () => {
    const payload = {
      action: 'toggle_mute_conversation',
      conversation_id: conversationId,
      mute: !route?.params?.muted, // Toggle mute status
      is_group: route?.params?.isGroup || false,
    };
    sendMessage(payload);
    // You might want to update route.params.muted or a local state to reflect the change
    // or trigger a refetch of conversation details.
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
    setSelectedMessage(null);
    setSelectedMessageStatus([]);
  };

  const onScroll = useCallback(event => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    // For an inverted list, a positive scrollOffset means scrolling towards older messages (upwards visually).
    // So, if scrollOffset > 50, the user has scrolled up.
    isScrolledUp.current = scrollOffset > 50;
  }, []);

  const handleDeleteMessage = useCallback(() => {
    if (!selectedMessages) return;

    console.log('Delete message triggered:', selectedMessages[0]);

    const isGroup = route?.params?.isGroup || false;
    sendMessage({
      action: 'delete_message',
      message_ids: String(selectedMessages[0].id), // Send as string
      conversation_id: conversationId,
      is_group: isGroup,
    });

    // Optimistically remove the message from UI
    setMessages(prevMessages =>
      prevMessages.filter(msg => msg.id !== selectedMessages[0].id)
    );

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
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 10, zIndex: 100 }}>
          <Text style={{ flex: 1, color: '#FF8C00', fontFamily: fonts.PoppinsSemiBold }}>{selectedMessages.length} selected</Text>
          <Pressable onPress={handleDeleteSelectedMessages} style={{ marginHorizontal: 10 }}>
            <Text style={{ color: 'red', fontFamily: fonts.PoppinsSemiBold }}>Delete</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedMessages([])} style={{ marginHorizontal: 10 }}>
            <Text style={{ color: '#FF8C00', fontFamily: fonts.PoppinsSemiBold }}>Cancel</Text>
          </Pressable>
        </View>
      )}
      <Windowsheader
        navigation={navigation}
        Condition={selectedMessages?.length === 1}
        name={route?.params?.name}
        setReplyCheck={setReplyCheck}
        isGroup={route?.params?.isGroup}
        GroupId={route?.params?.GroupId}
        selectedMessageStatus={selectedMessageStatus}
        setSelectedMessage={setSelectedMessage}
        handleDeleteMessage={handleDeleteMessage}
        setReactionPickerState={setReactionPickerState}
        data={route?.params}
        selectedMessage={selectedMessages && selectedMessages.length > 0 ? selectedMessages[0] : null}
        handleCopyMessage={handleCopyMessage}
        conversationId={
          route?.params?.type === 'new' ? conversationValue : conversationId
        }
        setEditmessagestatus={setEditmessagestatus}
        loadMessages={loadMessages}
        handleAllDeleteMessage={handleAllDeleteMessage}
        handleStarMessagecheck={handleStarMessage}
        handleMuteOptions={handleMuteOptions}
        handlePinCreateion={handlePinCreateion}
        setMentionAll={setMentionAll}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight + (StatusBar.currentHeight || 0) + insets.top,
          android: headerHeight + (StatusBar.currentHeight || 0) + insets.bottom,
        })}>

        {/* WhatsApp-style pinned message banner */}
        {renderPinnedBanner()}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Pressable style={{ flex: 1 }} onPress={dismissReactionPicker}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => String(item.id)}
                showsVerticalScrollIndicator={false}
                inverted
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                style={styles.messageList}
                contentContainerStyle={styles.messageListContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
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
                    // Apply transform to ListEmptyComponent content
                    <View style={styles.emptyContainerContent}>
                      <Text style={styles.noMessagesText}>No messages yet</Text>
                    </View>
                  ) : null
                }
                initialNumToRender={PAGE_SIZE}
                maxToRenderPerBatch={PAGE_SIZE}
                windowSize={21}
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
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} />

      {reactionPickerState.visible && (
        <View
          style={[styles.pickerWrapper, { top: reactionPickerState.positionY }]}>
          <ReactionPicker onSelectReaction={handleSelectReaction} />
        </View>
      )}
    </ScreenView>
  );
};

const styles = StyleSheet.create({
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
    // When inverted, justifyContent: 'flex-start' means content starts from the bottom
    // justifyContent: 'flex-end', // Use flex-end for inverted list to push content to bottom
  },
  loader: {
    marginVertical: 10,
  },
  // Modified emptyContainer styling for better visibility with inverted FlatList
  emptyContainerContent: {
    flex: 1, // Allow it to take available space
    justifyContent: 'center',
    alignItems: 'center',

    paddingBottom: 50, // Example: ensure it's above the input bar
  },
  noMessagesText: {
    textAlign: 'center',
    color: mainGrayColor,
    fontFamily: fonts.PoppinsRegular,
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
  snackbarContent: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.3,
    fontFamily: fonts.PoppinsRegular,
    // marginLeft: 8,
  },
});

export default ScreenWindows;