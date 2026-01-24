import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import EmptyListComponents from '../../../components/EmptyListComponents';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor50,
  DarkColor60,
} from '../../../utils/style/fonts';
import DropUpSvg from '../../../assets/svg/DropUpSvg';
import DropDownSvgIcon from '../../../assets/svg/DropDownSvg';

const ThreadComponents = ({ navigation, route }) => {
  const { recentThreadMessages, sendMessage } = useWebSocket();
  const [User, setUser] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState({});

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

  const handleConversationStarmsg = useCallback(() => {
    const payload = {
      action: 'get_latest_thread_messages',
      conversation_id: route?.params?.conversationId,
      is_group: route?.params?.data?.isGroup,
    };
    sendMessage(payload);
    setLoading(true);
  }, [
    route?.params?.conversationId,
    route?.params?.data?.isGroup,
    sendMessage,
  ]);

  useEffect(() => {
    if (route?.params?.conversationId) {
      handleConversationStarmsg();
    }
  }, [route?.params?.conversationId, handleConversationStarmsg]);

  useEffect(() => {
    if (
      recentThreadMessages?.message === 'Threads messages retrieved successfully' &&
      recentThreadMessages?.data?.results
    ) {
      setThreadMessages(recentThreadMessages?.data?.results);
      setLoading(false);
    } else if (recentThreadMessages?.message) {
      // Handle other messages if needed, maybe show a toast
      setLoading(false);
    }
  }, [recentThreadMessages]);
  const renderReplyItem = ({ item }) => {
    return (
      <View
        style={[
          styles.replyContainer,
          item.sender_id === User ? styles.myReply : styles.otherReply,
        ]}>
        <Text style={styles.replySender}>{item.sender_name}:</Text>
        <Text style={styles.replyText}>{item.text}</Text>
        <Text style={styles.replyTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const toggleExpand = threadId => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  const renderThreadRoot = ({ item }) => {
    const isMyMessage = item.sender_id === User;
    const isExpanded = !!expandedThreads[item.id];

    return (
      <View style={styles.threadRootContainer}>
        {/* Original Message */}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}>
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Replies Section */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesSection}>
            <TouchableOpacity
              onPress={() => toggleExpand(item.id)}
              style={styles.repliesHeader}>
              <Text style={styles.repliesCount}>
                {item.replies.length === 1
                  ? '1 Reply'
                  : `${item.replies.length} replies`}
              </Text>
              {isExpanded ? (
                <DropUpSvg color={DarkColor} width={15} height={15} />
              ) : (
                <DropDownSvgIcon color={DarkColor} width={15} height={15} />
              )}
            </TouchableOpacity>
            {isExpanded && (
              <FlatList
                data={item.replies}
                keyExtractor={reply => reply.id.toString()}
                renderItem={renderReplyItem}
                inverted // To show latest replies at the bottom
                contentContainerStyle={styles.repliesList}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={mainOrangeColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponents navigation={navigation} Type={'All Thread Messages'} />
      <FlatList
        data={threadMessages.filter(msg => msg.is_thread_root)}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<EmptyListComponents type={1} text={'No Thread Messages Found'} marginData={50} />}
        renderItem={renderThreadRoot}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

export default ThreadComponents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  threadRootContainer: {
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 5,
    elevation: 1, // For a subtle shadow on Android
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: mainOrangeColor,
    borderBottomRightRadius: 2,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  myMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  myMessageTime: {
    color: '#FC8C4D1A', // Darker grey
  },
  otherMessageTime: {
    color: '#FC8C4D1A', // Darker grey
  },
  repliesSection: {
    marginLeft: 30, // Indent replies
    marginRight: 10,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 10,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  repliesCount: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: mainOrangeColor,
  },
  repliesList: {
    paddingBottom: 10,
  },
  replyContainer: {
    maxWidth: '90%',
    padding: 8,
    borderRadius: 10,
    marginTop: 5,
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myReply: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0f7fa', // Light blue for replies from self
  },
  otherReply: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f8e9', // Light green for replies from others
  },
  replySender: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#333',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#000',
  },
  replyTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 3,
    color: '#757575',
  },
});

// in item this text root of the message in side json of the replies it will be like count reply replies.length and drop up and drop down list of message from json ,
