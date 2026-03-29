import {
  StyleSheet,

  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'; import BackArrowSvg from '../../../assets/svg/BackArrowSvg';
import ThreeVerticalDots from '../../../assets/svg/threeDots';
import ShareIcon from '../../../assets/svg/solar_forward_bold';
import ChatReactionIcon from '../../../assets/svg/fluent_emoji_Svg';
import { useHeaderHeight } from '@react-navigation/elements';
const ProfileImage2 = require('../../../assets/Png/ProfileIcon2.png');
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import ChatInputBar from '../MediaComponents/MediaComponents';
import {
  DarkColor,
  DarkColor60,
  DarkColor80,
  fonts,
  mainOrange50,
  mainOrangeColor,
  mainWhiteColor,
} from '../../../utils/style/fonts';
import Avatar from '../../../components/AvatarComponents/Avatar';
import { MessageStatusModal } from './MessageStatusModal';
import InfoSvg from '../../../assets/svg/InfoIcon';
import ReactionDetailsModal from '../ChatTypeComponents/ReactionComponents/ReactionModal';
import { useIsFocused } from '@react-navigation/native';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import CustomText from '../../../utils/CustomText';
import LottieView from 'lottie-react-native';

import { RfH, RfW } from '../../../utils/helper';
// Emoji unicode mapping for reference:
// 😂: 1f602
// 😮: 1f62e
// 😢: 1f622
// 🙏: 1f64f
// 👍: 1f44d
// 👎: 1f44e
// 🔥: 1f525
const EMOJIS = [
  '😂', // 1f602
  '😮', // 1f62e
  '😢', // 1f622
  '🙏', // 1f64f
  '👍', // 1f44d
  '👎', // 1f44e
  '🔥', // 1f525
];

// Helper: get Lottie URL for emoji unicode
function getLottieForEmoji(emoji) {
  if (!emoji) return null;
  const codePoints = [];
  for (const symbol of [...emoji]) {
    const code = symbol.codePointAt(0).toString(16);
    codePoints.push(code);
  }
  const unicodeStr = codePoints.join('-');
  return { uri: `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json` };
}

// Track failed Lottie emoji loads
function useFailedLottieEmojis() {
  const [failed, setFailed] = useState({});
  const markFailed = emoji => setFailed(prev => ({ ...prev, [emoji]: true }));
  return [failed, markFailed];
}

function isSingleEmoji(str) {
  if (!str) return false;
  const text = String(str).trim();
  const cleaned = text.replace(/[\uFE0F\u200D]/g, '');
  const emojiRegex = /\p{Extended_Pictographic}/u;
  const chars = [...cleaned];
  const onlyEmoji = chars.every(ch => emojiRegex.test(ch));
  return onlyEmoji && chars.length === 1;
}
const ThreadScreen = ({ navigation, route }) => {
  const [emojis, setEmojis] = useState(EMOJIS);
  useEffect(() => {
    if (DataList) {
      console.log('All thread messages:', JSON.stringify(DataList));
    }
  }, [DataList]);
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [User, setUser] = useState(null);
  const [DataList, setDataList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedMessageStatus, setSelectedMessageStatus] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const headerHeight = useHeaderHeight();
  const [EmojiModal, setEmojiModal] = useState(false);
  const [EmojiModalData, setEmojiModalData] = useState([]);
  const [EmojiModalMessage, setEmojiModalMessage] = useState(null);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const IsFocused = useIsFocused();

  // Notify parent of reply count change
  useEffect(() => {
    if (route?.params?.onThreadReplyCountChange && typeof route.params.onThreadReplyCountChange === 'function') {
      route.params.onThreadReplyCountChange(DataList.length);
    }
  }, [DataList.length]);

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

  const PAGE_SIZE = 30;
  const flatListRef = useRef(null);

  const getEmojiSize = (count) => {
    if (count === 1) return 60;
    if (count <= 3) return 40;
    return 24;
  };

  const handlePlusPress = () => {
    setShowEmojiSelector(true);
  };
  // Helper to get Lottie URL for emoji
  function getLottieUrlForEmoji(emoji) {
    if (!emoji) return null;
    const codePoints = [];
    for (const symbol of [...emoji]) {
      const code = symbol.codePointAt(0).toString(16);
      codePoints.push(code);
    }
    const unicodeStr = codePoints.join('-');
    return `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json`;
  }

  // Helper: check if string is only emojis (1 or more)
  function isOnlyEmojis(str) {
    if (!str) return false;
    const text = String(str).trim();
    const cleaned = text.replace(/\s|[\uFE0F\u200D]/g, '');
    const emojiRegex = /\p{Extended_Pictographic}/gu;
    const matches = cleaned.match(emojiRegex);
    return matches && matches.length > 0 && matches.join('') === cleaned;
  }

  // Helper: split string into array of emojis
  function splitEmojis(str) {
    if (!str) return [];
    const emojiRegex = /\p{Extended_Pictographic}/gu;
    return str.match(emojiRegex) || [];
  }

  const handleEmojiSelected = (emoji) => {
    if (!emojis.includes(emoji)) {
      setEmojis(prev => {
        const updated = [...prev, emoji];
        return updated;
      });
    }
    setShowEmojiSelector(false);
    // If not a reaction, send as lottie_emoji url
    if (!emojiPickerState.message) {
      // Send as lottie_emoji url in content
      handleSend({ content: '', lottie_emoji: getLottieUrlForEmoji(emoji) });
    } else {
      // Use the same logic as quick emoji row: send and show emoji for the selected message
      handleSelectEmoji(emoji);
    }
  };

  const loadMessages = useCallback(
    async (pageNum, isInitialLoad = false) => {
      if (!isConnected || !route?.params?.Data?.id || loading) return;
      setLoading(true);

      const action = 'get_threads';
      const payload = {
        action,
        message_id: route?.params?.Data?.id,
        is_group: route?.params?.isGroup,
        page: pageNum,
        page_size: PAGE_SIZE,
      };

      // console.log('payload listing', payload);

      sendMessage(payload);
    },
    [isConnected, route?.params?.Data?.id, sendMessage, loading],
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (!IsFocused) return;
    if (isConnected && route?.params?.Data?.id) {
      setPage(1);
      setHasMore(true);
      setDataList([]); // Clear DataList immediately
      setLoading(true); // Show loading until new messages arrive
      loadMessages(1, true);
    }
  }, [route?.params?.Data?.id, isConnected]);

  useEffect(() => {
    if (page > 0) {
      loadMessages(page);
    }
  }, [page]);

  useEffect(() => {
    if (!lastMessage || !IsFocused) return;

    const action = lastMessage?.action;
    if (
      lastMessage.action === 'receive_new_thread' ||
      lastMessage.action === 'receive_thread_reply'
    ) {
      // Strictly check if this message is for the current thread
      const newReply = lastMessage?.data;
      const threadMessageId = newReply?.message_id || newReply?.thread_message_id;
      const currentThreadId = route?.params?.Data?.id;
      if (!threadMessageId || String(threadMessageId) !== String(currentThreadId)) {
        // Ignore messages for other threads
        return;
      }
      // handleMarkAsDeliver(lastMessage?.data?.id);
      // console.log(lastMessage, '\n');
      const payload = {
        action: 'update_messages_status',
        status: 'delivered',
        message_ids: lastMessage?.data?.message_id,
        conversation_id: lastMessage?.data?.conversation_id,
        is_group: lastMessage?.data?.is_group,
      };
      console.log(
        'payload check data -=-=-=-=-=-=-=-=-=>',
        payload,
        '\n',
        '\n',
        lastMessage,
        '\n',
        '\n',
      );
      sendMessage(payload);
      loadMessages(page);
      return;
    } else if (
      lastMessage?.action === 'receive_message_updated' ||
      action === 'receive_message_updated' ||
      action === 'receive_messages_deleted' ||
      action === 'receive_messages_status_update' ||
      action === 'receive_thread_created' ||
      action === 'receive_thread_reply' ||
      lastMessage?.message === 'Thread created' ||
      action === 'receive_reaction_update' ||
      lastMessage?.message === 'Reaction added' ||
      lastMessage?.message === 'Reaction removed' ||
      lastMessage?.message === 'Message sent' ||
      lastMessage?.message === 'Messages updated successfully'
    ) {
      loadMessages(page);
      return;
    } else if (
      lastMessage?.action === 'receive_thread_created' ||
      lastMessage?.action === 'receive_thread_reply' ||
      lastMessage?.message === 'Thread created'
    ) {
      loadMessages(page);
      return;
    } else if (lastMessage?.data?.action === 'Reply added') {
      loadMessages(page);
      return;
    } else if (
      lastMessage?.action === 'receive_reaction_update' ||
      lastMessage?.message === 'Reaction added' ||
      lastMessage?.message === 'Reaction removed'
    ) {
      // console.log(
      //   'last message action -=-=-=-=-=-=-=-=------->',
      //   lastMessage?.message,
      //   lastMessage?.action,
      //   '\n',
      //   '\n',
      // );
      loadMessages(page);
      return;
    } else if (lastMessage?.data?.action === 'thread_replies') {
      setLoading(false);
      const newMessages = lastMessage?.data?.replies?.messages || [];
      const totalMessages = lastMessage?.data?.replies?.total_messages || 0;

      // Always replace DataList with new thread's messages (never merge)
      const combinedData = (newMessages || []).map(msg => ({
        ...msg,
        reactions: msg.reactions || [],
        status: msg.status || [],
      })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setDataList(combinedData);
      setHasMore(combinedData.length < totalMessages);
    } else if (lastMessage?.data?.action === 'receive_messages_read') {
      loadMessages(page);
      return;
    } else {
      // console.log(
      //   '\n',
      //   '\n',
      //   'lastMessage in thread screen else check -=-=-=-=-=-=-------->',
      //   JSON.stringify(lastMessage),
      //   lastMessage?.data?.replies?.messages,
      //   lastMessage?.data?.replies?.total_messages,
      //   '\n',
      //   '\n',
      // );

      setLoading(false);
    }
  }, [lastMessage, page, loadMessages, DataList.length]);

  const handleMarkAsDeliver = messageIds => {
    const payload = {
      action: 'mark_messages_as_delivered',
      message_ids: messageIds,
    };
    sendMessage(payload);
  };

  const handleSend = useCallback(
    async data => {
      if (!isConnected) {
        Alert.alert(
          'Connection Error',
          "Not connected, can't send message. Please try again. check",
        );
        return;
      }

      let payload = {
        action: 'reply_to_thread',
        message_id: route?.params?.Data?.id,
        is_group: route?.params?.isGroup,
      };

      // If sending from EmojiSelector (data.lottie_emoji), keep as before
      if (data.lottie_emoji) {
        // If sending from EmojiSelector, try to get the emoji character if possible (if you have a mapping)
        // For now, do not send lottie_emoji in payload, just send the emoji character if available
        payload.text = data.emoji || '';
      } else if (isOnlyEmojis(data.content)) {
        // If user typed only emojis from keyboard, send as emoji string
        const emojisArr = splitEmojis(data.content);
        payload.text = emojisArr.join('');
      } else {
        payload.text = data.content;
      }

      console.log('payload sending -=-=-=-=----->', payload);
      sendMessage(payload);
      loadMessages(page);
    },
    [isConnected, sendMessage, route?.params?.isGroup, route?.params?.Data?.id, loadMessages, page],
  );

  const [emojiPickerState, setEmojiPickerState] = useState({
    visible: false,
    positionY: 0,
    message: null,
  });

  const handleEmojiPress = (event, message) => {
    // Only show EmojiPicker if no message is currently selected
    if (!emojiPickerState.visible) {
      const { pageY } = event.nativeEvent;
      const pickerYPosition = pageY - headerHeight - 60;
      setEmojiPickerState({
        visible: true,
        positionY: pickerYPosition,
        message: message,
      });
    } else {
      // Hide EmojiPicker if another message is selected
      setEmojiPickerState({
        visible: false,
        positionY: 0,
        message: null,
      });
    }
  };

  const handleSelectEmoji = emoji => {
    if (!emojiPickerState.message) return;
    setEmojiPickerState({ ...emojiPickerState, visible: false });
    setSelectedMessageId(null); // Unselect the message automatically

    const messageId = emojiPickerState?.message?.id;
    setDataList(prevData => {
      return prevData.map(msg => {
        if (msg?.id === messageId) {
          const existingReactions = msg?.reactions || [];
          const reactionExists = existingReactions.some(
            r => r?.reaction === emoji && r?.user_id === User,
          );
          if (reactionExists) {
            return {
              ...msg,
              reactions: existingReactions.filter(
                r => !(r?.reaction === emoji && r?.user_id === User),
              ),
            };
          } else {
            return {
              ...msg,
              reactions: [
                ...existingReactions,
                {
                  reaction: emoji,
                  user_id: User,
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return msg;
      });
    });

    const payload = {
      action: 'add_reaction',
      message_id: messageId,
      reaction: emoji,
      is_group: route?.params?.isGroup || false,
    };

    sendMessage(payload);
  };

  const handleRemoveReaction = (arg1, arg2) => {
    // Support both (message, reactionEmoji) and ({reaction_id, message_id, ...})
    let messageId, reactionId, reactionEmoji;
    if (typeof arg1 === 'object' && arg1 !== null && arg1.reaction_id) {
      // Called from ReactionDetailsModal with payload
      messageId = arg1.message_id;
      reactionId = arg1.reaction_id;
      // Find the emoji for this reactionId
      let emoji = null;
      setDataList(prevData => {
        return prevData.map(msg => {
          if (msg?.id === messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(r => {
                if (r?.reaction_id === reactionId && r?.user_id === User) {
                  emoji = r.reaction;
                  return false;
                }
                return true;
              }),
            };
          }
          return msg;
        });
      });
      const payload = {
        action: 'remove_reaction',
        message_id: messageId,
        reaction_id: reactionId,
        is_group: route?.params?.isGroup || false,
      };
      sendMessage(payload);
    } else {
      // Called from emoji tap
      const message = arg1;
      reactionEmoji = arg2;
      setDataList(prevData => {
        return prevData.map(msg => {
          if (msg?.id === message?.id) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                r => !(r?.reaction === reactionEmoji && r?.user_id === User)
              ),
            };
          }
          return msg;
        });
      });
      const payload = {
        action: 'remove_reaction',
        message_id: message?.id,
        reaction: reactionEmoji,
        is_group: route?.params?.isGroup || false,
      };
      sendMessage(payload);
    }
  };

  const formatTime = dateString1 => {
    if (!dateString1) return '';
    const date = new Date(dateString1);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowSvg width={16} height={16} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Thread</CustomText>
      </View>

      {selectedMessageId && (
        <TouchableOpacity
          style={{ paddingLeft: 5, marginTop: 6 }}
          onPress={() => {
            const message =
              DataList.find(item => item.id === selectedMessageId) ||
              route?.params?.Data;
            setSelectedMessageStatus(message?.status || []);
            setStatusModalVisible(true);
            setSelectedMessageId(null);
          }}>
          <InfoSvg width="24" height="24" color={mainOrangeColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  const EmojiPicker = ({ visible, positionY, onClose, onSelectEmoji }) => {
    if (!visible) return null;
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
          <View style={[styles.pickerContainer, { top: positionY }]}>
            <View style={styles.pickerRow}>
              {EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => onSelectEmoji(emoji)}
                  style={styles.emojiButton}
                >
                  {getLottieForEmoji(emoji) ? (
                    <LottieView
                      source={getLottieForEmoji(emoji)}
                      autoPlay
                      loop
                      style={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <CustomText style={styles.emoji}>{emoji}</CustomText>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                key="plus"
                onPress={() => {
                  setEmojiPickerState({ ...emojiPickerState, visible: false });
                  handlePlusPress();
                }}
                style={[styles.emojiButton, styles.addButton]}
                accessibilityLabel="Add Reaction"
              >
                <View style={styles.addCircle}>
                  <CustomText style={styles.addPlus}>+</CustomText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const RootMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={e => {
        setSelectedMessageId(item.id);
        handleEmojiPress(e, item);
      }}
      onPressOut={() => {
        setSelectedMessageId(null);
      }}
      activeOpacity={1}
      style={[
        styles.messageContainer,
        selectedMessageId === item.id && { backgroundColor: '#FC8C4D26' },
      ]}>
      {route?.params?.isGroup && (
        <View style={styles.avatarContainer}>
          <Avatar
            avatarUri={item?.sender?.avatar}
            name={item?.senderName || item?.sender?.email}
            email={item?.sender?.email}
            size={30}
            borderRadius={15}
            fontSize={14}
          />
        </View>
      )}

      <View style={styles.messageContent}>
        {String(item?.sender?.id) !== String(User) &&
          route?.params?.isGroup && (
            <CustomText style={styles.senderName}>{item?.senderName}</CustomText>
          )}

        <View
          style={[
            styles.messageBubble,
            ((item.lottie_emoji || (isSingleEmoji(String(item?.content)) && getLottieUrlForEmoji(String(item?.content)))) && {
              backgroundColor: mainWhiteColor,
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
            }),
          ]}
        >
          {/* Show Lottie for all emoji-only messages, with dynamic sizing */}
          {item.lottie_emoji ? (
            <LottieView
              source={{ uri: item.lottie_emoji }}
              autoPlay
              loop
              style={{ width: 60, height: 60, alignSelf: 'center' }}
            />
          ) : Array.isArray(item.lottie_emojis) && item.lottie_emojis.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {item.lottie_emojis.map((url, idx) => (
                <LottieView
                  key={idx}
                  source={{ uri: url }}
                  autoPlay
                  loop
                  style={{ width: item.lottie_emojis.length === 1 ? 60 : 20, height: item.lottie_emojis.length === 1 ? 60 : 20, marginHorizontal: 2 }}
                />
              ))}
            </View>
          ) : isOnlyEmojis(String(item?.content)) && splitEmojis(String(item?.content)).length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
              {splitEmojis(String(item?.content)).map((emoji, idx, arr) => (
                <LottieView
                  key={idx}
                  source={{ uri: getLottieUrlForEmoji(emoji) }}
                  autoPlay
                  loop
                  style={{ width: arr.length === 1 ? 60 : 20, height: arr.length === 1 ? 60 : 20, marginHorizontal: 2 }}
                />
              ))}
            </View>
          ) : (
            // Mixed text and emoji: render text and emojis in order, emojis as Lottie
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', maxWidth: '90%' }}>
              {(() => {
                const emojiRegex = /\p{Extended_Pictographic}/gu;
                const parts = String(item.content).split(emojiRegex);
                const emojis = String(item.content).match(emojiRegex) || [];
                const nodes = [];
                for (let i = 0; i < parts.length; i++) {
                  if (parts[i]) {
                    nodes.push(
                      <CustomText key={`text-${i}`} style={[styles.messageText]}>{parts[i]}</CustomText>
                    );
                  }
                  if (emojis[i]) {
                    nodes.push(
                      <LottieView
                        key={`emoji-${i}`}
                        source={{ uri: getLottieUrlForEmoji(emojis[i]) }}
                        autoPlay
                        loop
                        style={{ width: 28, height: 28, margin: 2 }}
                      />
                    );
                  }
                }
                return nodes;
              })()}
            </View>
          )}
          <CustomText style={[styles.timestamp, { alignSelf: 'flex-end' }]}>{item?.timestamp}</CustomText>
        </View>
        {/* <View style={styles.metaContainer}>
        </View> */}
        <EmojiPicker
          visible={
            emojiPickerState.visible && emojiPickerState.message?.id === item.id
          }
          positionY={emojiPickerState.positionY}
          onClose={() =>
            setEmojiPickerState({ ...emojiPickerState, visible: false })
          }
          onSelectEmoji={handleSelectEmoji}
        />
      </View>
    </TouchableOpacity>
  );

  const ReplySeparator = ({ count }) => (
    <View style={styles.replySeparator}>
      <CustomText style={styles.replyCountText}>
        {count > 1 ? `${count} replies` : `${count} reply`}
      </CustomText>
      <TouchableOpacity>
        <ShareIcon height="22" width="22" />
      </TouchableOpacity>
    </View>
  );

  const handleEmojiModal = item => {
    setEmojiModalData(item?.reactions);
    setEmojiModalMessage(item && typeof item === 'object' ? item : null);
    setEmojiModal(true);
  };

  const ReplyMessage = ({ item }) => (
    <>
      {console.log(item, "here all reply msg")}
      {String(item?.sender?.id) !== String(User) ? (
        <TouchableOpacity
          onLongPress={(e) => {
            setSelectedMessageId(item.id);
            handleEmojiPress(e, item);
          }}
          onPressOut={() => {
            setSelectedMessageId(null);
          }}
          activeOpacity={1}
          style={[
            styles.messageContainer,
            { marginRight: 20 },
            selectedMessageId === item.id && { backgroundColor: '#FC8C4D26' },
          ]}
        >
          {route?.params?.isGroup && (
            <View style={[styles.avatarContainer, {
              width: 20,
              height: 20,
              borderRadius: 10,
            }]}>
              <Avatar
                avatarUri={item?.sender?.avatar}
                name={item?.sender?.name || item?.sender?.email}
                email={item?.sender?.email}
                size={20}
                borderRadius={10}
                fontSize={14}
              />
            </View>
          )}

          <View style={styles.ReceiverMessageContent}>
            <View
              style={[
                styles.ReceiverMessageBubble,
                isOnlyEmojis(String(item?.content)) &&
                splitEmojis(String(item?.content)).length === 1 && {
                  backgroundColor: 'transparent',
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: 0,

                },
                route?.params?.isGroup && { left: -8 },
              ]}
            >
              {String(item?.sender?.id) !== String(User) &&
                route?.params?.isGroup && (
                  <CustomText style={styles.msgsenderName}>
                    {item?.sender?.name || item?.sender?.email}
                  </CustomText>
                )}

              {/* Single Lottie Emoji */}
              {item.lottie_emoji ? (
                <LottieView
                  source={{ uri: item.lottie_emoji }}
                  autoPlay
                  loop
                  style={{ width: 40, height: 40, alignSelf: 'center' }}
                />
              ) : Array.isArray(item.lottie_emojis) && item.lottie_emojis.length > 0 ? (

                /* Multiple Lottie Emoji */
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    maxWidth: '90%',
                  }}
                >
                  {item.lottie_emojis.map((url, idx, arr) => (
                    <LottieView
                      key={idx}
                      source={{ uri: url }}
                      autoPlay
                      loop
                      style={{
                        width: getEmojiSize(arr.length),
                        height: getEmojiSize(arr.length),
                        margin: 2,
                      }}
                    />
                  ))}
                </View>

              ) : isOnlyEmojis(String(item?.content)) &&
                splitEmojis(String(item?.content)).length > 0 ? (

                /* Normal Emoji */
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    maxWidth: '90%',
                  }}
                >
                  {splitEmojis(String(item?.content)).map((emoji, idx, arr) => (
                    <LottieView
                      key={idx}
                      source={{ uri: getLottieUrlForEmoji(emoji) }}
                      autoPlay
                      loop
                      style={{
                        width: getEmojiSize(arr.length),
                        height: getEmojiSize(arr.length),
                        margin: 2,
                      }}
                    />
                  ))}
                </View>


              ) : (
                // Mixed text and emoji: render text and emojis in order, emojis as Lottie
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', maxWidth: '90%' }}>
                  {(() => {
                    const emojiRegex = /\p{Extended_Pictographic}/gu;
                    const parts = String(item.content).split(emojiRegex);
                    const emojis = String(item.content).match(emojiRegex) || [];
                    const nodes = [];
                    for (let i = 0; i < parts.length; i++) {
                      if (parts[i]) {
                        nodes.push(
                          <CustomText key={`text-${i}`} style={styles.messageText}>{parts[i]}</CustomText>
                        );
                      }
                      if (emojis[i]) {
                        nodes.push(
                          <LottieView
                            key={`emoji-${i}`}
                            source={{ uri: getLottieUrlForEmoji(emojis[i]) }}
                            autoPlay
                            loop
                            style={{ width: 20, height: 20, margin: 2 }}
                          />
                        );
                      }
                    }
                    return nodes;
                  })()}
                </View>
              )}

              {/* Timestamp */}
              <CustomText
                style={[
                  styles.timestamp,
                  { alignSelf: 'flex-end' },
                  isOnlyEmojis(String(item?.content)) &&
                  splitEmojis(String(item?.content)).length === 1 && {
                    color: DarkColor80,
                  },
                ]}
              >
                {formatTime(item?.created_at)}
              </CustomText>

            </View>


            {/* Reactions */}
            <View style={styles.metaContainer}>
              {item?.reactions?.length > 0 && (
                <View style={styles.reactionsContainer}>
                  {item.reactions.slice(0, 2).map((reaction, index) => {

                    const isCurrentUserReaction = reaction.user_id === User;
                    const lottieSource = getLottieForEmoji(reaction.reaction);

                    return (
                      <Pressable
                        key={index}
                        style={[
                          styles.reactionBubble,
                          isCurrentUserReaction && styles.currentUserReaction,
                          lottieSource && {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            paddingHorizontal: 0,
                          },
                        ]}
                        onPress={() => handleEmojiModal(item)}
                        android_ripple={{ color: '#eee' }}
                      >

                        {lottieSource ? (
                          <LottieView
                            source={lottieSource}
                            autoPlay
                            loop
                            style={{ width: 20, height: 20 }}
                          />
                        ) : (
                          <CustomText style={styles.reactionEmoji}>
                            {reaction.reaction}
                          </CustomText>
                        )}

                        {reaction.count > 1 && (
                          <CustomText style={styles.reactionCount}>
                            {reaction.count}
                          </CustomText>
                        )}

                      </Pressable>
                    );
                  })}

                  {item.reactions.length > 2 && (
                    <Pressable
                      onPress={() => handleEmojiModal(item)}
                      android_ripple={{ color: '#eee' }}
                    >
                      <CustomText
                        style={[
                          styles.moreReactions,
                          { marginRight: 5, marginLeft: 0 },
                        ]}
                      >
                        +{item.reactions.length - 2}
                      </CustomText>
                    </Pressable>
                  )}

                </View>
              )}
            </View>

          </View>
        </TouchableOpacity>
      ) : (


        <TouchableOpacity
          onLongPress={(e) => {
            setSelectedMessageId(item.id);
            handleEmojiPress(e, item);
          }}
          onPressOut={() => {
            setSelectedMessageId(null);
          }}
          activeOpacity={1}
          style={[
            styles.messageContainer,
            { marginLeft: 15 },
            selectedMessageId === item.id && {
              backgroundColor: '#FC8C4D26',
              marginLeft: 0,
            },
          ]}
        >
          <View style={styles.SenderMessageContent}>

            <View
              style={[
                styles.SenderMessageBubble,
                isOnlyEmojis(String(item?.content)) &&
                splitEmojis(String(item?.content)).length === 1 && {
                  backgroundColor: 'transparent',
                },
              ]}
            >

              {/* Single Lottie Emoji */}
              {item.lottie_emoji ? (
                <LottieView
                  source={{ uri: item.lottie_emoji }}
                  autoPlay
                  loop
                  style={{ width: 60, height: 60, alignSelf: 'center' }}
                />
              ) : Array.isArray(item.lottie_emojis) && item.lottie_emojis.length > 0 ? (

                /* Multiple Lottie Emoji */
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    maxWidth: '90%',
                  }}
                >
                  {item.lottie_emojis.map((url, idx, arr) => (
                    <LottieView
                      key={idx}
                      source={{ uri: url }}
                      autoPlay
                      loop
                      style={{
                        width: getEmojiSize(arr.length),
                        height: getEmojiSize(arr.length),
                        margin: 2,
                      }}
                    />
                  ))}
                </View>

              ) : isOnlyEmojis(String(item?.content)) &&
                splitEmojis(String(item?.content)).length > 0 ? (

                /* Normal Emoji */
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    maxWidth: '90%',
                  }}
                >
                  {splitEmojis(String(item?.content)).map((emoji, idx, arr) => (
                    <LottieView
                      key={idx}
                      source={{ uri: getLottieUrlForEmoji(emoji) }}
                      autoPlay
                      loop
                      style={{
                        width: getEmojiSize(arr.length),
                        height: getEmojiSize(arr.length),
                        margin: 2,
                      }}
                    />
                  ))}
                </View>

              ) : (

                /* Normal Text */
                // <CustomText
                //   style={[
                //     styles.messageText,
                //     { color: mainWhiteColor },
                //   ]}
                // >
                //   {item.content}
                // </CustomText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', maxWidth: '90%' }}>
                  {(() => {
                    const emojiRegex = /\p{Extended_Pictographic}/gu;
                    const parts = String(item.content).split(emojiRegex);
                    const emojis = String(item.content).match(emojiRegex) || [];
                    const nodes = [];
                    for (let i = 0; i < parts.length; i++) {
                      if (parts[i]) {
                        nodes.push(
                          <CustomText key={`text-${i}`} style={[styles.messageText, { color: "#000000" }]}>{parts[i]}</CustomText>
                        );
                      }
                      if (emojis[i]) {
                        nodes.push(
                          <LottieView
                            key={`emoji-${i}`}
                            source={{ uri: getLottieUrlForEmoji(emojis[i]) }}
                            autoPlay
                            loop
                            style={{ width: 20, height: 20, margin: 2 }}
                          />
                        );
                      }
                    }
                    return nodes;
                  })()}
                </View>

              )}

              {/* Timestamp */}
              <CustomText
                style={[
                  styles.timestamp,
                  { alignSelf: 'flex-end', color: "#000000" },
                  isOnlyEmojis(String(item?.content)) &&
                  splitEmojis(String(item?.content)).length === 1 && {
                    color: DarkColor80,
                  },
                ]}
              >
                {formatTime(item?.created_at)}
              </CustomText>

            </View>


            {/* Reactions */}
            <View style={[styles.metaContainer]}>
              {item?.reactions?.length > 0 && (
                <View style={styles.reactionsContainer}>
                  {item.reactions.slice(0, 2).map((reaction, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.reactionBubble,
                        getLottieForEmoji(reaction.reaction) && {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          paddingHorizontal: 0,
                        },
                      ]}
                      android_ripple={{ color: '#eee' }}
                    >
                      {getLottieForEmoji(reaction.reaction) ? (
                        <LottieView
                          source={getLottieForEmoji(reaction.reaction)}
                          autoPlay
                          loop
                          style={{ width: 16, height: 16 }}
                        />
                      ) : (
                        <CustomText style={styles.reactionEmoji}>
                          {reaction.reaction}
                        </CustomText>
                      )}
                    </Pressable>
                  ))}

                  {item.reactions.length > 2 && (
                    <Pressable onPress={() => handleEmojiModal(item)}>
                      <CustomText style={styles.moreReactions}>
                        +{item.reactions.length - 2}
                      </CustomText>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

          </View>
        </TouchableOpacity>
      )}

      <EmojiPicker
        visible={
          emojiPickerState.visible && emojiPickerState.message?.id === item.id
        }
        positionY={emojiPickerState.positionY}
        onClose={() =>
          setEmojiPickerState({ ...emojiPickerState, visible: false })
        }
        onSelectEmoji={handleSelectEmoji}
      />
    </>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={mainOrangeColor} />
        <CustomText style={styles.loadingMoreText}>Loading more messages...</CustomText>
      </View>
    );
  };

  // console.log('\n');
  // console.log(
  //   'EmojiModalData',
  //   JSON.stringify(route?.params?.Data) || [],
  //   '\n',
  // );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar backgroundColor={'#ffffff'} barStyle="dark-content" />
      <Header />
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={DataList}
          key={route?.params?.Data?.id || 'thread-default'}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ReplyMessage item={item} />}
          ListHeaderComponent={
            <>
              <RootMessage item={route?.params?.Data} />
              <ReplySeparator count={DataList?.length} />
            </>
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      <View style={styles.inputContainer}>
        <ChatInputBar onSend={handleSend} />
      </View>

      <MessageStatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        statusList={selectedMessageStatus}
      />

      <EmojiPicker
        visible={emojiPickerState.visible}
        positionY={emojiPickerState.positionY}
        onClose={() =>
          setEmojiPickerState({ ...emojiPickerState, visible: false })
        }
        onSelectEmoji={handleSelectEmoji}
      />

      {EmojiModal && EmojiModalMessage && EmojiModalMessage.id && (
        <ReactionDetailsModal
          isVisible={EmojiModal}
          onClose={() => setEmojiModal(false)}
          reactions={EmojiModalData}
          onRemoveReaction={handleRemoveReaction}
          isGroup={route?.params?.isGroup || false}
          messageItem={EmojiModalMessage}
          filteredReactions={EmojiModalData}
        />
      )}
      <Modal
        visible={showEmojiSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEmojiSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEmojiSelector(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          <EmojiSelector
            onEmojiSelected={handleEmojiSelected}
            showSearchBar={true}
            showSectionTitles={false}
            category={Categories.ALL}
            columns={10}
            emojiSize={18}
            searchBarStyle={styles.searchBar}
            searchBarTextStyle={styles.searchText}
            containerStyle={styles.emojiSelector}
          />
        </View>

      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ThreadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  inputContainer: {
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  pickerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 4,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1000,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center'
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  addButton: {
    marginLeft: 2,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 12,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d1d1',
    alignSelf: 'center',
    marginBottom: 8,
  },

  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  searchText: {
    fontSize: 12,
    color: '#000',
  },
  emojiSelector: {
    flex: 1,
    paddingHorizontal: 8,
  },
  addPlus: {
    color: '#606060',
    fontSize: 22,
    fontWeight: '300',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginLeft: 10,
    marginTop: -5,
  },
  headerInfoText: {
    fontSize: 16,
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },

  listContentContainer: {
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  msgsenderName: {
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: -4,
    fontSize: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarContainer: {
    borderWidth: 1,
    borderColor: mainOrangeColor,
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
  },
  SenderMessageContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  ReceiverMessageContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 4,
  },
  messageBubble: {
    // backgroundColor: '#f0f2f5',
    // paddingHorizontal: 12,
    // paddingVertical: 8,
    // borderRadius: 18,
    // alignSelf: 'flex-start',
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    // justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    minWidth: RfW(110),
    alignSelf: 'flex-start',
  },

  ReceiverMessageBubble: {
    // backgroundColor: '#f0f2f5',
    // paddingHorizontal: 12,
    // paddingVertical: 8,
    // borderRadius: 18,
    // alignSelf: 'flex-start',
    // flexDirection: 'row',
    backgroundColor: '#F2F7FB',
    borderRadius: 15,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    // elevation: 1,
    minWidth: RfW(110),
    maxWidth: '90%',
  },

  SenderMessageBubble: {
    // backgroundColor: mainOrangeColor,
    // paddingHorizontal: 12,
    // paddingVertical: 8,
    // borderRadius: 18,
    // alignSelf: 'flex-end',
    // flexDirection: 'row',
    backgroundColor: mainOrange50,
    borderRadius: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: RfW(100),
    maxWidth: '90%',
  },
  messageText: {
    fontSize: RfH(12),
    color: DarkColor,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: RfH(10),
    color: DarkColor80,
    fontFamily: fonts.PoppinsLight,
  },
  reactionIcon: {
    marginLeft: 12,
  },
  replySeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyCountText: {
    fontSize: RfH(14),
    color: '#65676B',
    fontWeight: '500',
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 8,
    marginTop: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
    position: 'absolute',
    top: '100%', // Position it right below the meta container
    zIndex: 10,
    alignItems: 'center',
  },
  emojiButton: {
    padding: 4,
  },
  emoji: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 8,
    color: DarkColor60,
    fontFamily: fonts.PoppinsLight,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginTop: 2,
  },
  currentUserReaction: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 10,
    color: DarkColor60,
    fontFamily: fonts.PoppinsMedium,
  },
  moreReactions: {
    fontSize: 10,
    color: DarkColor60,
    fontFamily: fonts.PoppinsMedium,
    marginLeft: 2,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    color: DarkColor,
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: DarkColor80,
    fontFamily: fonts.PoppinsMedium,
  },
});