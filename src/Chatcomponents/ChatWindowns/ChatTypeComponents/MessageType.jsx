// Import local DB access for media
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Image,
  Text,
  Linking,
  ActivityIndicator,
} from 'react-native';
// Helper: split string into array of text, emoji, and link parts
function splitTextEmojisAndLinks(str) {
  if (!str) return [];
  const urlRegex = /((https?:\/\/|www\.)[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(mailto:[^\s]+)/gi;
  const emojiRgx = emojiRegex();
  let parts = [];
  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      // Split out emojis in the text before the link
      const before = str.slice(lastIndex, match.index);
      let emojiParts = splitTextAndEmojis(before);
      parts = parts.concat(emojiParts);
    }
    parts.push({ type: 'link', value: match[0] });
    lastIndex = urlRegex.lastIndex;
  }
  if (lastIndex < str.length) {
    let emojiParts = splitTextAndEmojis(str.slice(lastIndex));
    parts = parts.concat(emojiParts);
  }
  return parts;
}
import Video from 'react-native-video';
import React, { useState, memo, useEffect, useCallback } from 'react';
import emojiRegex from 'emoji-regex';
import LottieView from 'lottie-react-native';
import { getLocalMediaPathByMessageId } from '../../../utils/chatSQLite';
import { requestDownloadURL } from '../../../Api/config/chatMediaService';

// Dynamically get Noto Emoji Lottie animation URL for a given emoji
function getLottieForEmoji(emoji) {
  if (!emoji) return null;
  const codePoints = [];
  for (const symbol of [...emoji]) {
    const code = symbol.codePointAt(0).toString(16);
    codePoints.push(code);
  }
  const unicodeStr = codePoints.join('-');
  const lottieUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json`;
  return { uri: lottieUrl };
}
function isSingleEmoji(str) {
  if (!str) return false;
  const text = String(str).trim();
  // Remove variation selectors and zero-width joiners
  const cleaned = text.replace(/[\uFE0F\u200D]/g, '');
  const regex = emojiRegex();
  const matches = cleaned.match(regex);
  return matches && matches.length === 1 && cleaned === matches[0];
}
// Helper: check if string contains any emoji
function containsEmoji(str) {
  if (!str) return false;
  const regex = emojiRegex();
  return regex.test(str);
}
// Helper: split string into array of text and emoji parts
function splitTextAndEmojis(str) {
  if (!str) return [];
  const regex = emojiRegex();
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: str.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'emoji', value: match[0] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < str.length) {
    parts.push({ type: 'text', value: str.slice(lastIndex) });
  }
  return parts;
}
import {
  mainOrangeColor,
  mainWhiteColor,
  fonts,
  DarkColor60,
  DarkColor,
  DarkColor50,
  DarkColor20,
  mainOrange20,
  DarkColor90,
  mainOrange50,
} from '../../../utils/style/fonts';
import ReadChatReactionSvg from '../../../assets/svg/ReadChatReactionSvg';
import DeliveredChatReactionSvg from '../../../assets/svg/DeliveredChatReactionSvg';
import NotSendChatReactionSvg from '../../../assets/svg/NotSendChatReactionSvg';
import SendChatRectionSvg from '../../../assets/svg/SendChatRectionSvg';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import ReactionDetailsModal from './ReactionComponents/ReactionModal';
import StarSvgIcon from '../../../assets/svg/StarSvg';
import Avatar from '../../../components/AvatarComponents/Avatar';
import { RfH, RfW } from '../../../utils/helper';
import CalendarHeader from 'react-native-calendars/src/calendar/header';
import CustomText from '../../../utils/CustomText';
import { lottieExistsForEmoji } from '../../../utils/lottieExistsForEmoji';
import EmojiWithLottie from './EmojiWithLottie';
import { Base_url } from '../../../Api/config/apiUrls';
import AudioCallSvgicon from '../../../assets/svg/audioCallSvgicon';


const ReactionsDisplay = memo(
  ({ reactions, isSender, isGroup, item, onRemoveReaction, replies_count }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    console.log(item, "here get all media file");

    useEffect(() => {
      const fetData = async () => {
        try {
          const res = await AsyncStorage1.getItem('userLoginResponse');
          setCurrentUserId(res?.data?.user?.id);
        } catch (err) {
          console.log('Error in useEffect', err);
        }
      };
      fetData();
    }, []);


    if (!reactions || reactions.length === 0) return null;
    const filteredReactions = selectedEmoji
      ? reactions.filter(r => r.reaction === selectedEmoji)
      : reactions;

    const reactionsByEmoji = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = {
          count: 0,
          users: [],
        };
      }
      acc[reaction.reaction].count++;
      if (reaction.user) {
        acc[reaction.reaction].users.push({
          id: reaction.user.id,
          name: reaction.user.name || 'User',
          avatar: reaction.user.chat_avatar,
          email: reaction.user.email,
        });
      }
      return acc;
    }, {});

    // WhatsApp-style: sender reactions above and right-aligned, receiver left-aligned
    const reactionAlignStyle = isSender
      ? {
        bottom: '100%',
        right: -6,
        left: 'auto',
        top: -2
        // marginBottom: 4,
      }
      : {
        bottom: -10,
        left: isGroup ? RfW(28) : 0,
        right: 'auto',
      };

    // console.log('reactionsByEmoj -=-=-=-=--------->', reactionsByEmoji);

    return (
      <>
        <Pressable
          style={[
            styles.reactionsContainer,
            reactionAlignStyle,
            { alignContent: 'flex-start' },
          ]}
          onPress={() => setModalVisible(true)}>
          {Object.entries(reactionsByEmoji)
            .slice(0, 4)
            .map(([emoji, data]) => (
              <EmojiWithLottie
                key={emoji}
                emoji={emoji}
                style={styles.reactionText}
                lottieStyle={{ width: RfW(16), height: RfH(16), marginHorizontal: RfW(1) }}
              />
            ))}
          {Object.entries(reactionsByEmoji).length > 4 && (
            <CustomText
              style={{
                color: DarkColor60,
                fontSize: 10,
                fontFamily: fonts.PoppinsRegular,
                marginTop: 2,
              }}>
              +{Object.entries(reactionsByEmoji).length - 4}
            </CustomText>
          )}
        </Pressable>

        <ReactionDetailsModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          reactions={reactions}
          onRemoveReaction={onRemoveReaction}
          isGroup={isGroup}
          messageItem={item}
          filteredReactions={filteredReactions}
        />
      </>
    );
  },
);

const LINE_STEP = 6;
const INITIAL_LINES = 6;

const MessageType = ({
  // Debug logs for troubleshooting

  item,
  onLongPress,
  isGroup,
  onRemoveReaction,
  navigation,
  setMentionAll,
  StarListing = false,
  handleStarandUnstarMessage,
  pinnedMessage,
  conversation_id,
  onPress,
  onThreadReplyCountChange
}) => {
  // Prefer local_media_path from item, then from extra, then from DB
  const initialLocalPath = item.local_media_path || (item.extra && item.extra.local_media_path) || null;
  const [localMediaPath, setLocalMediaPath] = useState(null);

  const [downloadUrl, setDownloadUrl] = useState(null);
  console.log(localMediaPath, "localMediaPath in message type");

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Only check for local media if there are media_attachments
    if (item.media_attachments && item.media_attachments.length > 0 && item.id) {
      async function checkLocalMedia() {
        console.log('[checkLocalMedia] item.id:', item.id);
        console.log('[checkLocalMedia] initialLocalPath:', initialLocalPath);
        try {
          const path = await getLocalMediaPathByMessageId(item.id);
          console.log('[checkLocalMedia] DB returned path:', path, 'for message id:', item.id);
          if (isMounted && path) {
            setLocalMediaPath(path);
          } else if (isMounted && initialLocalPath) {
            setLocalMediaPath(initialLocalPath);
          }
        } catch (e) {
          console.log('[checkLocalMedia] Error fetching local media path:', e);
          if (isMounted && initialLocalPath) {
            setLocalMediaPath(initialLocalPath);
          }
        }
      }
      checkLocalMedia();
    } else {
      setLocalMediaPath(null);
    }
    return () => { isMounted = false; };
  }, [item.id, initialLocalPath, item.media_attachments]);
  const isPinned = pinnedMessage && item.id === pinnedMessage.id;
  const [currentLines, setCurrentLines] = useState(INITIAL_LINES);
  const [textTotalLines, setTextTotalLines] = useState(0);
  console.log(JSON.stringify(item), "get all item data in message type");

  useEffect(() => {
    // Debug: log item, localMediaPath, and check file existence
    console.log('[MessageType] item:', JSON.stringify(item));
    console.log('[MessageType] localMediaPath:', localMediaPath);
    if (localMediaPath) {
      import('react-native-fs').then(RNFS => {
        const pathToCheck = localMediaPath.replace('file://', '');
        RNFS.default.exists(pathToCheck)
          .then(exists => {
            console.log('[MessageType] File exists:', exists, pathToCheck);
            if (!exists) {
              console.warn('[MessageType] Local file missing, will fallback to remote if available:', pathToCheck);
            }
          })
          .catch(e => console.log('[MessageType] RNFS.exists error:', e));
      });
    } else {
      console.log('[MessageType] No localMediaPath set for item', item?.id);
    }
  }, [localMediaPath, item]);
  const handleLongPress = event => {
    onLongPress(event, item);
  };

  const handleThreathNavigation = () => {
    // Pass onThreadReplyCountChange if provided
    if (typeof onThreadReplyCountChange === 'function') {
      navigation.navigate('ThreadScreen', {
        Data: item,
        isGroup: isGroup,
        onThreadReplyCountChange: (newCount) => {
          // Pass thread message id and new count
          onThreadReplyCountChange(item.id, newCount);
        },
      });
    } else {
      navigation.navigate('ThreadScreen', { Data: item, isGroup: isGroup });
    }
  };

  const handleStarLisingMessageUnstar = messageItem => {
    handleStarandUnstarMessage(messageItem || item);
  };

  // Show all lines at once
  const showMoreLines = () => {
    setCurrentLines(textTotalLines);
  };

  // Collapse to INITIAL_LINES
  const showLessLines = () => {
    setCurrentLines(INITIAL_LINES);
  };

  const onTextLayout = useCallback(
    e => {
      const totalLines = e.nativeEvent.lines.length;
      if (totalLines !== textTotalLines) {
        setTextTotalLines(totalLines);
      }
    },
    [textTotalLines],
  );

  // const isImageFile = (url) => {
  //   return url.match(/\.(jpeg|jpg|png|gif)$/i);
  // };

  const canShowMore = currentLines < textTotalLines;
  const canShowLess = currentLines > INITIAL_LINES;

  // marginBottom: 10 only if reactions exist and no replies
  const showReactionMargin = item?.reactions && item.reactions.length > 0 && (!item?.replies_count || item.replies_count === 0);
  // Helper to check if file is image or video
  const isImageFile = (uri) => uri && uri.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isVideoFile = (uri) => uri && uri.match(/\.(mp4|mov|mkv|avi)$/i);

  // Helper to get best image URI: local_media_path -> media_url -> attachment_url
  const getBestImageUri = () => {
    // 1. Prefer local_media_path (immediate display after send)
    if (localMediaPath && isImageFile(localMediaPath)) {
      console.log('[MessageType] Rendering image from localMediaPath:', localMediaPath);
      return localMediaPath;
    }
    // 2. Fallback to media_attachments[0].media_key/media_url if available
    if (Array.isArray(item.media_attachments) && item.media_attachments.length > 0) {
      const media = item.media_attachments[0];
      // Try media_url
      if (media.media_url && isImageFile(media.media_url)) {
        console.log('[MessageType] Rendering image from media_url:', media.media_url);
        return media.media_url;
      }
      // Try media_key (S3 or server URL)
      if (media.media_key) {
        if (media.media_key.startsWith('http') && isImageFile(media.media_key)) {
          console.log('[MessageType] Rendering image from media_key (http):', media.media_key);
          return media.media_key;
        }
        // If not full URL, prepend S3 base
        const S3_BASE = `${Base_url}`;
        if (isImageFile(media.media_key)) {
          console.log('[MessageType] Rendering image from media_key (S3_BASE):', S3_BASE + media.media_key);
          return S3_BASE + media.media_key;
        }
      }
      // Try attachment_url
      if (media.attachment_url && isImageFile(media.attachment_url)) {
        console.log('[MessageType] Rendering image from attachment_url:', media.attachment_url);
        return media.attachment_url;
      }
    }
    console.log('[MessageType] No image URI found for item', item?.id);
    return null;
  };

  return (
    <View
      style={[
        styles.messageWrapper,
        showReactionMargin ? { marginBottom: RfH(24) } : null
      ]}
    >
      {item?.is_system_message && !StarListing ? (
        // <View style={styles.systemMessageContainer}>
        //   <CustomText allowFontScaling={false} style={styles.systemMessageText}>
        //     {item?.content}
        //   </CustomText>
        // </View>
        null
      ) : item?.is_system_message && StarListing ? (
        <></>
      ) : item?.isSender ? (
        <View style={{ width: '100%', backgroundColor: 'transparent', borderRadius: 10 }}>
          <Pressable
            style={[
              styles.sentMessageContainer,
              item?.isSender ? styles.senderWrapper : styles.receiverWrapper,
            ]}
            onPress={
              StarListing
                ? () => handleStarLisingMessageUnstar(item)
                : onPress // <-- use the onPress prop for selection
            }
            onLongPress={StarListing ? null : handleLongPress}>
            <View style={{ flexDirection: 'row', }}>
              {/* My Message */}
              {(
                (String(item?.content) === "" || item?.content === undefined) &&
                (!item.media_attachments || item.media_attachments.length === 0)
              ) ? (
                <View style={[
                  styles.deletemsgwrapper,
                  item.reactions?.length > 0 && styles.messageBubbleWithReactions,
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <Image source={require('../../../assets/ChatAssets/png/disable.png')} style={{ width: 14, height: 14 }} tintColor={DarkColor60} />
                    <CustomText
                      style={{ fontSize: 14, color: DarkColor60, fontFamily: fonts.PoppinsRegular, top: RfH(1), marginLeft: 4 }}
                      numberOfLines={
                        currentLines === textTotalLines ? undefined : currentLines
                      }
                      onTextLayout={onTextLayout}>
                      You message was deleted.
                    </CustomText>
                  </View>
                  <CustomText allowFontScaling={false} style={[styles.sentTimeText, { color: DarkColor60, }]}>
                    {item?.timestamp}
                  </CustomText>
                </View>
              ) : (
                <View
                  style={[
                    styles.sentMessageBubble,
                    item.reactions?.length > 0 && styles.messageBubbleWithReactions,
                    isSingleEmoji(String(item?.content)) ? { backgroundColor: 'transparent', paddingHorizontal: 0, minWidth: 0 } : {}
                  ]}
                >
                  {/* Prefer local media if present, else fallback to server media */}
                  {(() => {
                    const imageUri = getBestImageUri();
                    if (imageUri) {
                      console.log("Rendering image with URI:", imageUri);

                      return (
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: 180, height: 180, borderRadius: 10, marginBottom: 6 }}
                          resizeMode="cover"
                        />
                      );
                    }
                    // Fallback: render video if localMediaPath is a video
                    if (localMediaPath && isVideoFile(localMediaPath)) {
                      return (
                        <Video
                          source={{ uri: localMediaPath }}
                          style={{ width: 180, height: 180, borderRadius: 10, marginBottom: 6 }}
                          resizeMode="cover"
                          controls
                          paused
                        />
                      );
                    }
                    return null;
                  })()}
                  {/* Always show caption/content below media if both exist */}
                  {item.content ? (
                    <View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        {splitTextEmojisAndLinks(String(item?.content)).map((part, idx, arr) => {
                          if (part.type === 'emoji') {
                            return (
                              <EmojiWithLottie
                                key={`emoji-${idx}`}
                                emoji={part.value}
                                style={[styles.sentMessageText, { paddingBottom: arr.length > 1 ? RfH(6) : 0 }]}
                                lottieStyle={{ width: arr.length > 1 ? RfW(22) : RfW(60), height: arr.length > 1 ? RfH(22) : RfH(60), margin: RfW(2) }}
                              />
                            );
                          } else if (part.type === 'link') {
                            let url = part.value;
                            if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
                              url = 'https://' + url;
                            }
                            return (
                              <Text
                                key={`link-${idx}`}
                                style={[styles.sentMessageText, { color: '#007AFF', textDecorationLine: 'underline' }]}
                                onPress={() => Linking.openURL(url)}
                              >
                                {part.value}
                              </Text>
                            );
                          } else if (part.type === 'text') {
                            return (
                              <View>
                                {part?.value !== "Call completed. Summary is being generated." ? (
                                  <CustomText key={`text-${idx}`} style={styles.sentMessageText}>
                                    {part.value}
                                  </CustomText>
                                ) : (
                                  (() => {
                                    return (
                                      <View
                                        style={{
                                          // alignItems: 'center',
                                          marginLeft: RfW(0),
                                          borderRadius: 6,
                                          paddingTop: RfH(6),
                                          width: RfW(140),
                                        }}
                                      >
                                        {/* Top Row (Icon + Title) */}
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 2,
                                          }}
                                        >
                                          <View
                                            style={{
                                              width: RfW(30),
                                              height: RfW(30),
                                              borderRadius: RfW(15),
                                              backgroundColor: mainWhiteColor,
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              marginRight: 6,
                                            }}
                                          >
                                            <AudioCallSvgicon width="14" height="14" color={mainOrangeColor} />
                                          </View>

                                          <CustomText
                                            style={[
                                              styles.sentMessageText,
                                              { fontSize: 12, fontFamily: fonts.PoppinsRegular, top: RfH(3) },
                                            ]}
                                          >
                                            Voice call
                                          </CustomText>
                                        </View>

                                        {/* Bottom Text */}
                                        {/* <View style={{ paddingTop: RfH(4) }}>
                                          <CustomText style={styles.sentMessageText}>
                                            {part?.value}...
                                          </CustomText>
                                        </View> */}
                                      </View>
                                    );
                                  })()
                                )}
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>
                    </View>
                  ) : null}
                  {/* Read More/Show Less buttons below message content, not overlapping */}
                  <View
                    style={
                      isSingleEmoji(item?.content)
                        ? { backgroundColor: mainOrangeColor, paddingHorizontal: 10, minWidth: 0, paddingVertical: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 6, alignSelf: 'center', marginTop: 4, justifyContent: 'center', alignItems: 'center' }
                        : {}
                    }
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: 2,
                      }}>
                      {canShowMore && (
                        <TouchableOpacity
                          onPress={showMoreLines}
                          style={{ marginRight: 10 }}>
                          <CustomText style={styles.readMoreText}>
                            Read More...
                          </CustomText>
                        </TouchableOpacity>
                      )}
                      {canShowLess && (
                        <TouchableOpacity onPress={showLessLines}>
                          <CustomText style={styles.readMoreText}>Show Less</CustomText>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={[styles.statusAndTimeContainer, {}]}>
                      {(item?.starred || StarListing) && (
                        <View style={{ marginRight: 5, marginTop: 0, marginBottom: 3 }}>
                          <StarSvgIcon width={12} height={10} color={DarkColor} />
                        </View>
                      )}
                      {item?.edited && <CustomText style={styles.editedText}>Edited</CustomText>}
                      {/* my message time */}
                      <CustomText allowFontScaling={false} style={[styles.sentTimeText,]}>
                        {item?.timestamp}
                      </CustomText>
                      {item?.isSender && Array.isArray(item?.status) && item.status.length > 0 && (
                        (() => {
                          const lastStatus = item.status[item.status.length - 1]?.status;
                          return (
                            <View style={styles.statusIcon}>
                              {lastStatus === 'read' ? (
                                <ReadChatReactionSvg width={14} height={14} />
                              ) : lastStatus === 'delivered' ? (
                                <DeliveredChatReactionSvg width={16} height={16} />
                              ) : lastStatus === 'sent' ? (
                                <SendChatRectionSvg width={10} height={10} />
                              ) : (
                                <NotSendChatReactionSvg width={12} height={12} />
                              )}
                            </View>
                          );
                        })()
                      )}
                    </View>
                  </View>
                  <View style={{ alignSelf: 'flex-end', }}>
                    <ReactionsDisplay
                      reactions={item.reactions}
                      isSender={item.isSender}
                      isGroup={isGroup}
                      item={item}
                      onRemoveReaction={onRemoveReaction}
                      replies_count={item?.replies_count}
                    /></View>
                </View>
              )}
            </View>
            {/* Emoji reactions below message bubble */}

            {/* Replies count at the very bottom */}
            {item?.replies_count > 0 && (
              <TouchableOpacity
                style={[
                  styles.repliesCountContainerSender,
                  { marginTop: item?.reactions?.length > 0 ? RfH(20) : RfH(4) }
                ]}
                onPress={handleThreathNavigation}>
                <CustomText
                  allowFontScaling={false}
                  style={[styles.repliesCountText, { alignSelf: 'flex-end', marginRight: RfW(8) }]}>
                  {item?.replies_count}
                  {item?.replies_count === 1 ? ' reply' : ' replies'}
                </CustomText>
              </TouchableOpacity>
            )}
          </Pressable>
        </View >
      ) : (
        <View style={{ width: '96%', backgroundColor: 'transparent', borderRadius: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
          <View
            style={[
              styles.receivedMessageContainer,
              item?.isSender ? styles.senderWrapper : styles.receiverWrapper,
              { width: isGroup ? '76%' : '90%' },
            ]}>
            <Pressable
              onLongPress={StarListing ? null : handleLongPress}
              onPress={
                StarListing
                  ? () => handleStarLisingMessageUnstar(item)
                  : onPress // <-- use the onPress prop for selection
              }>
              <View style={{ flexDirection: 'row', minHeight: 40 }}>
                <View style={{ flexDirection: 'row' }}>
                  {isGroup && (
                    <TouchableOpacity
                      style={{ flexDirection: 'row' }}
                      activeOpacity={0.8}
                      onPress={() => console.log(JSON.stringify(item), 'item---')
                      }
                    >
                      <View style={styles.avatarContainer}>
                        {/* {console.log('chat_name-=-=-=------>', item?.chat_name, '\n')} */}
                        <Avatar
                          avatarUri={item?.avatar}
                          name={item?.senderName}
                          email={item?.senderName}
                          size={20}
                          borderRadius={15}
                          fontSize={8}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  {/* Sender message */}
                  {String(item?.content) === "" || item?.content === undefined ? (
                    Array.isArray(item.media_attachments) && item.media_attachments.length > 0 ? (
                      localMediaPath && isImageFile(localMediaPath) ? (
                        <Image
                          source={{ uri: localMediaPath }}
                          style={{ width: 180, height: 180, borderRadius: 10, marginBottom: 6 }}
                          resizeMode="cover"
                        />
                      ) : downloadUrl ? (
                        <View style={{
                          backgroundColor: '#e0e0e0',
                          opacity: 0.6,
                          minHeight: RfH(200),
                          minWidth: RfW(200),
                          borderRadius: 10,
                          marginBottom: 6,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Image
                            source={{ uri: downloadUrl }}
                            style={{ width: '100%', height: '100%', borderRadius: 10, }}
                            resizeMode="cover"
                          />
                          {downloading && (
                            <ActivityIndicator style={{ position: 'absolute' }} size="large" color="#888" />
                          )}
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={async () => {
                            try {
                              setDownloading(true);
                              const attachmentId = item.media_attachments[0]?.id;
                              const isGroup = !!item.is_group;
                              if (attachmentId) {
                                const result = await requestDownloadURL({ attachmentId, isGroup });
                                if (result && result.download_url) {
                                  setDownloadUrl(result.download_url);
                                  // Download the image to local storage using downloadAndStoreMedia utility
                                  try {
                                    const { downloadAndStoreMedia, getLocalMediaPathByMessageId } = await import('../../../utils/chatSQLite');
                                    const fileName = result.file_name || `media_${attachmentId}.jpg`;
                                    await downloadAndStoreMedia(result.download_url, item, fileName);
                                    // Always fetch the latest local_media_path from DB after download
                                    const updatedPath = await getLocalMediaPathByMessageId(item.id);
                                    if (updatedPath) {
                                      setLocalMediaPath(updatedPath);
                                    }
                                  } catch (err) {
                                    console.log('Error in downloadAndStoreMedia:', err);
                                  }
                                }
                                setDownloading(false);
                              }
                            } catch (e) {
                              setDownloading(false);
                              console.log('Error requesting download URL or downloading:', e);
                            }
                          }}
                        >
                          <View style={{
                            backgroundColor: '#e0e0e0',
                            opacity: 0.6,
                            minHeight: RfH(200),
                            minWidth: RfW(200),
                            borderRadius: 10,
                            marginBottom: 6,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            {downloading ? (
                              <ActivityIndicator size="large" color="#888" />
                            ) : (
                              <Text style={{ color: '#888' }}>Tap to load image</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View style={[styles.deletemsgwrapper, item?.reactions?.length > 0 &&
                        styles.messageBubbleWithReactions,]}>
                        {isGroup && (
                          <CustomText
                            allowFontScaling={false}
                            style={styles.senderName}
                          >
                            {item?.senderName
                              ? item.senderName.split('@')[0]
                              : 'User'}
                          </CustomText>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', top: 1 }}>
                          <Image source={require('../../../assets/ChatAssets/png/disable.png')} style={{ width: 14, height: 14 }} tintColor={DarkColor60} />
                          <CustomText style={{ fontSize: 14, color: DarkColor60, fontFamily: fonts.PoppinsRegular, top: RfH(1), marginLeft: 4 }}>This message was deleted</CustomText>
                        </View>
                        <CustomText allowFontScaling={false} style={[styles.receivedTimeText, { color: DarkColor60, }]}>
                          {item?.timestamp}
                        </CustomText>
                      </View>
                    )
                  ) : (
                    <View
                      style={[styles.receivedMessageBubble,
                      item?.reactions?.length > 0 && styles.messageBubbleWithReactions,
                      isSingleEmoji(String(item?.content)) ? {
                        backgroundColor: 'transparent', paddingHorizontal: 0, minWidth: 0, shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                      } : {}
                      ]}
                    >
                      {/* Show local media if present, using localMediaPath fallback logic */}
                      {localMediaPath
                        ? (isImageFile(localMediaPath)
                          ? <Image source={{ uri: localMediaPath }} style={{ width: RfW(200), height: RfH(200), borderRadius: 10, marginBottom: 6 }} resizeMode="cover" />
                          : isVideoFile(localMediaPath)
                            ? <Video source={{ uri: localMediaPath }} style={{ width: RfW(200), height: RfH(200), borderRadius: 10, marginBottom: 6 }} resizeMode="cover" controls paused />
                            : null)
                        : null
                      }
                      {isGroup && (
                        <CustomText
                          allowFontScaling={false}
                          style={styles.senderName}
                        >
                          {item?.senderName
                            ? item.senderName.split('@')[0]
                            : 'User'}
                        </CustomText>
                      )}

                      {/* If message is only an emoji, show it larger and centered */}
                      {/* If message contains any emoji, render text and emojis as Lottie inline */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        {splitTextEmojisAndLinks(String(item?.content)).map((part, idx, arr) => {
                          if (part.type === 'emoji') {
                            return (
                              <EmojiWithLottie
                                key={`emoji-${idx}`}
                                emoji={part.value}
                                style={styles.receivedMessageText}
                                lottieStyle={{ width: arr.length > 1 ? 22 : 60, height: arr.length > 1 ? 22 : 60, margin: 2 }}
                              />
                            );
                          } else if (part.type === 'link') {
                            let url = part.value;
                            if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
                              url = 'https://' + url;
                            }
                            return (
                              <Text
                                key={`link-${idx}`}
                                style={[styles.receivedMessageText, { color: '#007AFF', textDecorationLine: 'underline' }]}
                                onPress={() => Linking.openURL(url)}
                              >
                                {part.value}
                              </Text>
                            );
                          } else if (part.type === 'text') {
                            return (
                              <View>
                                {part?.value !== "Call completed. Summary is being generated." ? (
                                  <CustomText key={`text-${idx}`} style={styles.sentMessageText}>
                                    {part.value}
                                  </CustomText>
                                ) : (
                                  (() => {
                                    return (
                                      <View
                                        style={{
                                          // alignItems: 'center',
                                          marginLeft: RfW(0),
                                          borderRadius: 6,
                                          paddingTop: RfH(6),
                                          width: RfW(140),
                                        }}
                                      >
                                        {/* Top Row (Icon + Title) */}
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 2,
                                          }}
                                        >
                                          <View
                                            style={{
                                              width: RfW(30),
                                              height: RfW(30),
                                              borderRadius: RfW(15),
                                              backgroundColor: mainWhiteColor,
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              marginRight: 6,
                                            }}
                                          >
                                            <AudioCallSvgicon width="14" height="14" color={mainOrangeColor} />
                                          </View>

                                          <CustomText
                                            style={[
                                              styles.sentMessageText,
                                              { fontSize: 12, fontFamily: fonts.PoppinsRegular, top: RfH(3) },
                                            ]}
                                          >
                                            Voice call
                                          </CustomText>
                                        </View>

                                        {/* Bottom Text */}
                                        {/* <View style={{ paddingTop: RfH(4) }}>
                                          <CustomText style={styles.sentMessageText}>
                                            {part?.value}...
                                          </CustomText>
                                        </View> */}
                                      </View>
                                    );
                                  })()
                                )}
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>


                      {/* Read More / Show Less */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          marginTop: 2,
                        }}
                      >
                        {canShowMore && (
                          <TouchableOpacity
                            onPress={showMoreLines}
                            style={{ marginRight: 10 }}
                          >
                            <CustomText style={styles.readMoreText}>
                              Read More...
                            </CustomText>
                          </TouchableOpacity>
                        )}

                        {canShowLess && (
                          <TouchableOpacity onPress={showLessLines}>
                            <CustomText style={styles.readMoreText}>
                              Show Less
                            </CustomText>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Bottom Row */}
                      <View
                        style={[
                          {
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          },
                          isSingleEmoji(item?.content) && {
                            backgroundColor: '#FFFFFF',
                            borderRadius: 15,
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 2,
                            paddingHorizontal: 16,
                            paddingVertical: 2,
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            elevation: 1,
                          },
                        ]}
                      >
                        {(item?.starred || StarListing) && (
                          <View style={{ marginRight: 4, marginTop: 3 }}>
                            <StarSvgIcon
                              width={12}
                              height={10}
                              color={DarkColor20}
                            />
                          </View>
                        )}

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          {item?.edited && (
                            <CustomText style={styles.editedText}>
                              Edited
                            </CustomText>
                          )}

                          <CustomText
                            allowFontScaling={false}
                            style={styles.receivedTimeText}
                          >
                            {item?.timestamp}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  )}
                  <ReactionsDisplay
                    reactions={item.reactions}
                    isSender={item.isSender}
                    isGroup={isGroup}
                    item={item}
                    onRemoveReaction={onRemoveReaction}
                    replies_count={item?.replies_count}
                  />
                </View>
              </View>

              {item?.replies_count > 0 && (
                <TouchableOpacity
                  style={[
                    styles.repliesCountContainerReceiver,
                    { marginTop: item?.reactions?.length > 0 ? RfH(20) : RfH(4), left: RfW(12) }
                  ]}
                  onPress={handleThreathNavigation}>
                  <CustomText allowFontScaling={false} style={[styles.repliesCountText, { marginRight: 8 }]}>
                    {item.replies_count}
                    {item?.replies_count === 1 ? ' reply' : ' replies'}
                  </CustomText>
                </TouchableOpacity>
              )}

            </Pressable>
            {/* check */}
          </View>
        </View>
      )}
    </View >
  );
};

export default memo(MessageType);

const styles = StyleSheet.create({
  readMoreText: {
    color: "blue", // Or any color you prefer
    marginTop: 0,
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    bottom: 2
  },
  messageWrapper: {
    marginVertical: 2,
    flex: 1,
    // backgroundColor: '#fff',
  },
  senderWrapper: {
    alignSelf: 'flex-end',
    marginRight: 2,
    flex: 1,
  },
  receiverWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
  cardMessageContainer: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardMessageText: {
    fontSize: 13,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
    lineHeight: 20,
  },
  bigEmojiText: {
    fontSize: RfH(32),
    textAlign: 'center',
    // minWidth: 50,
    // minHeight: 50,
    alignSelf: 'center',
    lineHeight: RfH(40),
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
    maxWidth: '86%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemMessageText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    alignSelf: 'center',
  },
  selectedMessageContainer: {
    backgroundColor: '#FC8C4D26',
    marginVertical: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    width: '86%',
  },
  sentMessageContainer: {
    maxWidth: '86%',
    // width:'100%',
    // backgroundColor: 'red',
    // flex: 1,
  },
  receivedMessageContainer: {
    width: '84%',
    alignSelf: 'flex-start'
    // backgroundColor: 'orange',
  },
  statusAndTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -6,
  },
  statusIcon: {
    marginLeft: 4,
  },
  sentMessageBubble: {
    backgroundColor: mainOrange50,
    borderRadius: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: RfW(100),
    // justifyContent: 'center',
  },
  deletemsgwrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: RfW(100),
  },
  receivedMessageBubble: {
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
  },
  messageBubbleWithReactions: {
    paddingBottom: 2,
  },
  sentMessageText: {
    color: "#000000",
    fontSize: RfH(12),
    fontFamily: fonts.PoppinsRegular,
    alignSelf: 'flex-start',
  },
  sentTimeText: {
    color: "#000000",
    fontSize: RfH(8),
    fontFamily: fonts.PoppinsLight,
    marginRight: 4,
    alignSelf: 'flex-end',
  },
  senderName: {
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: -4,
    fontSize: 10,
  },
  receivedMessageText: {
    color: DarkColor,
    fontSize: RfH(12),
  },
  receivedTimeText: {
    color: DarkColor60,
    fontSize: RfH(8),
    textAlign: 'right',
    marginTop: 2,
    fontFamily: fonts.PoppinsLight,
  },
  reactionsContainer: {
    position: 'absolute',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    minWidth: 25,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  reactionText: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 1,
    color: 'red'
  },
  reactionCountBadge: {
    fontSize: 10,
    color: DarkColor,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly less opaque background
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25, // More rounded corners
    borderTopRightRadius: 25,
    maxHeight: '70%', // Slightly smaller max height
    paddingBottom: 25, // More padding at bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the title
    alignItems: 'center',
    paddingVertical: 18, // More vertical padding
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner border
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DarkColor, // Make title color consistent
  },
  closeButton: {
    position: 'absolute', // Position close button
    right: 15,
    top: 15,
  },
  closeButtonText: {
    fontSize: 18,
    color: DarkColor60,
  },
  reactionTabs: {
    paddingVertical: 12,
    paddingHorizontal: 10, // Add horizontal padding
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  reactionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // More rounded chip shape
    backgroundColor: '#f5f5f5', // Lighter background
    marginRight: 8,
  },
  selectedTab: {
    backgroundColor: '#e3f3ff', // Lighter blue for selected tab
    borderColor: '#007AFF', // A subtle blue border
    borderWidth: 1,
  },
  reactionTabEmoji: {
    fontSize: 18, // Slightly larger emoji in tabs
    marginRight: 6,
  },
  reactionTabCount: {
    fontSize: 13,
    color: DarkColor60,
    fontWeight: '600',
  },
  usersList: {
    maxHeight: 'auto', // Let it expand up to modal height
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f5f5f5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 10,
  },
  avatarPlaceholder: {
    // This style is now mostly handled by the Avatar component
    marginRight: 12,
  },
  // The 'avatar' style is now controlled by the Avatar component, you can remove it if not needed for direct Image usage
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: DarkColor,
    marginLeft: 10,
  },
  userReactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userReactionEmoji: {
    fontSize: 20, // Larger emoji for individual reaction
    marginRight: 15,
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#E5E7EB', // Light gray background
  },
  editedText: {
    fontSize: 7,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor50,
    marginRight: 5,
  },
  removeButtonText: {
    color: DarkColor, // A red color for remove
    fontSize: 13,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 2,
  },
  avatarContainer: {
    marginRight: 4,
  },
  systemMessageContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  systemMessageText: {
    color: DarkColor,
    fontSize: 10,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
    top: RfH(1),
  },
  repliesCountContainerSender: {
    marginVertical: 5,
    marginRight: 8, // Align with the message bubble
  },
  repliesCountContainerReceiver: {
    marginVertical: 5,
    marginLeft: 8, // Align with the message bubble
  },
  repliesCountText: {
    color: '#007AFF', // Blue for replies count
    fontSize: 10,
    fontFamily: fonts.PoppinsMedium,
  },
});