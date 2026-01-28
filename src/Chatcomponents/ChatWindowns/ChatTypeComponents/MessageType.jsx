import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useState, memo, useEffect, useCallback } from 'react';
import {
  mainOrangeColor,
  mainWhiteColor,
  fonts,
  DarkColor60,
  DarkColor,
  DarkColor50,
  DarkColor20,
  mainOrange20,
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


const ReactionsDisplay = memo(
  ({ reactions, isSender, isGroup, item, onRemoveReaction, replies_count }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedEmoji, setSelectedEmoji] = useState(null);

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

    const reactionAlignStyle = {
      right: isSender ? 0 : 'auto',
      left: isSender ? 'auto' : 0,
    };

    // console.log('reactionsByEmoj -=-=-=-=--------->', reactionsByEmoji);

    return (
      <>
        <Pressable
          style={[
            styles.reactionsContainer,
            reactionAlignStyle,
            {
              bottom: -20,
            },
          ]}
          onPress={() => setModalVisible(true)}>
          {Object.entries(reactionsByEmoji)
            .slice(0, 4)
            .map(([emoji, data]) => (
              <Text key={emoji} style={styles.reactionText}>
                {emoji}
              </Text>
            ))}
          {Object.entries(reactionsByEmoji).length > 4 && (
            <Text
              style={{
                color: DarkColor60,
                fontSize: 10,
                fontFamily: fonts.PoppinsRegular,
                marginTop: 2,
              }}>
              +{Object.entries(reactionsByEmoji).length - 4}
            </Text>
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
  item,
  onLongPress,
  isGroup,
  onRemoveReaction,
  navigation,
  setMentionAll,
  StarListing = false,
  handleStarandUnstarMessage,
  pinnedMessage,
}) => {
  const isPinned = pinnedMessage && item.id === pinnedMessage.id;
  const [currentLines, setCurrentLines] = useState(INITIAL_LINES);

  const [textTotalLines, setTextTotalLines] = useState(0);

  const handleLongPress = event => {
    onLongPress(event, item);
  };

  const handleThreathNavigation = () => {
    navigation.navigate('ThreadScreen', { Data: item, isGroup: isGroup });
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

  const canShowMore = currentLines < textTotalLines;
  const canShowLess = currentLines > INITIAL_LINES;

  // marginBottom: 10 only if reactions exist and no replies
  const showReactionMargin = item?.reactions && item.reactions.length > 0 && (!item?.replies_count || item.replies_count === 0);
  return (
    <View
      style={[
        styles.messageWrapper,
        showReactionMargin ? { marginBottom: RfH(24) } : null
      ]}
    >
      {item?.is_system_message && !StarListing ? (
        // <View style={styles.systemMessageContainer}>
        //   <Text allowFontScaling={false} style={styles.systemMessageText}>
        //     {item?.content}
        //   </Text>
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
            onPress={() =>
              StarListing ? handleStarLisingMessageUnstar(item) : null
            }
            onLongPress={StarListing ? null : handleLongPress}>
            <View style={{ flexDirection: 'row', }}>
              <View
                style={[
                  styles.sentMessageBubble,
                  item.reactions?.length > 0 && styles.messageBubbleWithReactions,
                ]}>
                {/* My Message */}
                <View>
                  <Text
                    // allowFontScaling={false}
                    style={styles.sentMessageText}
                    numberOfLines={
                      currentLines === textTotalLines ? undefined : currentLines
                    }
                    onTextLayout={onTextLayout}>
                    {item?.content}
                  </Text>
                </View>
                {/* Read More/Show Less buttons below message content, not overlapping */}
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 2, // positive margin to push buttons below text
                    }}>
                    {canShowMore && (
                      <TouchableOpacity
                        onPress={showMoreLines}
                        style={{ marginRight: 10 }}>
                        <Text style={styles.readMoreText}>
                          Read More...
                        </Text>
                      </TouchableOpacity>
                    )}
                    {canShowLess && (
                      <TouchableOpacity onPress={showLessLines}>
                        <Text style={styles.readMoreText}>Show Less</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.statusAndTimeContainer, {}]}>
                    {(item?.starred || StarListing) && (
                      <View style={{ marginRight: 5, marginTop: 0, marginBottom: 3 }}>
                        <StarSvgIcon width={12} height={10} color={mainWhiteColor} />
                      </View>
                    )}
                    {item?.edited && <Text style={styles.editedText}>Edited</Text>}
                    {/* my message time */}
                    <Text allowFontScaling={false} style={styles.sentTimeText}>
                      {item?.timestamp}
                    </Text>
                    {item?.isSender && item?.status?.[0]?.status && (
                      <View style={styles.statusIcon}>
                        {item?.status[0]?.status === 'read' ? (
                          <ReadChatReactionSvg width={14} height={14} />
                        ) : item?.status[0]?.status === 'delivered' ? (
                          <DeliveredChatReactionSvg width={16} height={16} />
                        ) : item?.status[0]?.status === 'sent' ? (
                          <SendChatRectionSvg width={10} height={10} />
                        ) : (
                          <NotSendChatReactionSvg width={12} height={12} />
                        )}
                      </View>
                    )}
                  </View>
                </View>
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
            {/* Emoji reactions below message bubble */}

            {/* Replies count at the very bottom */}
            {item?.replies_count > 0 && (
              <TouchableOpacity
                style={[
                  styles.repliesCountContainerSender,
                  { marginTop: item?.reactions?.length > 0 ? RfH(20) : RfH(4) }
                ]}
                onPress={handleThreathNavigation}>
                <Text
                  allowFontScaling={false}
                  style={[styles.repliesCountText, { alignSelf: 'flex-end', marginRight: RfW(8) }]}>
                  {item?.replies_count}
                  {item?.replies_count === 1 ? ' reply' : ' replies'}
                </Text>
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
              onPress={() =>
                StarListing ? handleStarLisingMessageUnstar(item) : null
              }>
              <View style={{ flexDirection: 'row', }}>
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
                  <View style={[
                    styles.receivedMessageBubble,
                    item?.reactions?.length > 0 &&
                    styles.messageBubbleWithReactions,
                  ]}>
                    {isGroup && <Text allowFontScaling={false} style={styles.senderName}>
                      {item?.senderName ? item.senderName.split('@')[0] : 'User'}
                    </Text>}
                    <Text
                      allowFontScaling={false}
                      style={[styles.receivedMessageText, { top: isGroup ? 2 : 0 }]}
                      numberOfLines={
                        currentLines === textTotalLines ? undefined : currentLines
                      }
                      onTextLayout={onTextLayout}>
                      {item?.content}
                    </Text>
                    {/* Read More/Show Less buttons below message content, not overlapping */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: 2, // positive margin to push buttons below text
                      }}>
                      {canShowMore && (
                        <TouchableOpacity
                          onPress={showMoreLines}
                          style={{ marginRight: 10 }}>
                          <Text style={styles.readMoreText}>
                            Read More...
                          </Text>
                        </TouchableOpacity>
                      )}
                      {canShowLess && (
                        <TouchableOpacity onPress={showLessLines}>
                          <Text style={styles.readMoreText}>Show Less</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      {(item?.starred || StarListing) && (
                        <View style={{ marginRight: 4, marginTop: 3 }}>
                          <StarSvgIcon width={12} height={10} color={DarkColor20} />
                        </View>
                      )}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        {item?.edited && (
                          <Text style={styles.editedText}>Edited</Text>
                        )}
                        <Text
                          allowFontScaling={false}
                          style={styles.receivedTimeText}>
                          {item?.timestamp}
                        </Text>
                      </View>
                    </View>
                  </View>
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
                  <Text allowFontScaling={false} style={[styles.repliesCountText, { marginRight: 8 }]}>
                    {item.replies_count}
                    {item?.replies_count === 1 ? ' reply' : ' replies'}
                  </Text>
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
    marginRight: 10,
    flex: 1,
  },
  receiverWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 10,
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
    backgroundColor: mainOrangeColor,
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
  receivedMessageBubble: {
    backgroundColor: '#FFFFFF',
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
    elevation: 1,
    minWidth: RfW(110),
  },
  messageBubbleWithReactions: {
    paddingBottom: 5,
  },
  sentMessageText: {
    color: mainWhiteColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    alignSelf: 'flex-start',
  },
  sentTimeText: {
    color: mainWhiteColor,
    fontSize: 8,
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
    fontSize: 14,
  },
  receivedTimeText: {
    color: DarkColor60,
    fontSize: 8,
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
    // padding: 5,
    // paddingHorizontal: 10,
    // borderRadius:/ 25,
    // backgroundColor: '#f0f0f0',
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
    // position: 'relative',
    marginRight: 4,
    // borderWidth: 1,
    // borderColor: mainOrangeColor,
    // borderRadius: 30,
    // width: 51,
    // height: 51,
  },
  systemMessageContainer: {
    backgroundColor: '#E0E0E0', // Lighter grey for system messages
    // padding: 8,
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
    color: DarkColor, // Darker text for system messages
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
    // textDecorationLine: 'underline',
  },
});
