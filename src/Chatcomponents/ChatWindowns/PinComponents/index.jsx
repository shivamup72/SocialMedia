import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import AsyncStorage1 from '../../../Api/config/AsyncStorage';
import MessageType from '../ChatTypeComponents/MessageType';
import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import { fonts, mainWhiteColor, mainOrangeColor, DarkColor, DarkColor50 } from '../../../utils/style/fonts';
import EmptyListComponents from '../../../components/EmptyListComponents';
import ScreenView from '../../../utils/ScreenView';

const PinListingComponents = ({ navigation, route }) => {
  console.log('Route Params:', route?.params);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AsyncStorage1.getItem('userLoginResponse');
        setCurrentUserId(res?.data?.user?.id);
      } catch (err) {
        console.log('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={mainOrangeColor} />
      </View>
    );
  }

  const pinnedMessage = route?.params?.data?.pinned_message;
  console.log('Pinned Message:', pinnedMessage);
  const isCurrentUser = pinnedMessage?.sender?.id === currentUserId;
  const messageContent = pinnedMessage?.content || '';
  const senderName = pinnedMessage?.sender?.name || 'Unknown';
  const timestamp = pinnedMessage?.timestamp
    ? new Date(pinnedMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <ScreenView>
      <HeaderComponents Type={'Pinned Message'} navigation={navigation} />

      {pinnedMessage ? (
        <View style={styles.messageWrapper}>
          <View style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
          ]}>
            {!isCurrentUser && (
              <View style={styles.senderInfo}>
                <Text style={styles.senderName}>{senderName}</Text>
              </View>
            )}
            <View style={[
              styles.messageBubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
            ]}>
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText
              ]}>
                {messageContent}
              </Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
          </View>
        </View>
      ) : (
        <EmptyListComponents
          text={'No pinned message'}
          marginData={20}
          type={1}
        />
      )}
    </ScreenView>
  );
};

export default PinListingComponents;

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
  messageWrapper: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginTop: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    color: DarkColor50,
    fontFamily: fonts.PoppinsMedium,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: mainOrangeColor,
    borderTopRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.PoppinsRegular,
  },
  currentUserText: {
    color: mainWhiteColor,
  },
  otherUserText: {
    color: DarkColor,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: DarkColor,
  },
});
