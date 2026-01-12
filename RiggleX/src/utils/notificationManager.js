import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {navigationRef} from '../navigation/RootNavigation';

// Track active notifications to prevent duplicates
const activeNotifications = new Map();
const NOTIFICATION_TTL = 5 * 60 * 1000; // 5 minutes TTL for notifications

// Clean up old notifications periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, timestamp] of activeNotifications.entries()) {
    if (now - timestamp > NOTIFICATION_TTL) {
      activeNotifications.delete(id);
      // Also cancel the notification if it's still showing
      notifee.cancelNotification(id).catch(console.error);
    }
  }
}, 60000); // Run cleanup every minute

// Setup notification foreground and background handlers
export function setupNotificationHandlers() {
  // Foreground event handler
  notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS) {
      handleNotificationPress(detail.notification);
    }
  });
}

// Handle notification press
function handleNotificationPress(notification) {
  if (!notification || !notification.data) return;

  const data = notification.data;

  if (data.action === 'open_chat') {
    // Navigate to chat window
    if (navigationRef.isReady()) {
      navigationRef.navigate('ChatWindows', {
        conversationId: data.conversationId,
        isGroup: data.isGroup === 'true',
        GroupId: data.GroupId,
        name: data.name,
        type: 'old',
        navigatetype:
          data.isGroup === 'true' ? 'groupnavigate' : 'privatenavigate',
      });
    }
  }
}
/**
 * Formats an ISO date string into a localized time string (e.g., "6:27 PM").
 * @param {string} isoString - The ISO date string from the server.
 * @returns {string} - The formatted time.
 */
const formatTimestamp = isoString => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Displays a new message notification.
 * @param {object} messageData - The message object from the WebSocket.
 *        e.g., { sender_name, content, created_at, conversation_id, is_group }
 */

export async function displayMessageNotification(messageData, type) {
  // console.log(
  //   'displayMessageNotification -=-=-=-------->',
  //   messageData,
  //   type,
  //   '\n',
  //   '\n',
  // );
  // Generate a unique ID for this notification
  const notificationId = `${type}-${
    messageData.id || messageData.message_id || Date.now()
  }`;

  // Skip if we've already shown this notification
  if (activeNotifications.has(notificationId)) {
    console.log('Skipping duplicate notification:', notificationId);
    return;
  }

  // 1. Request permissions (required for iOS)
  await notifee.requestPermission();

  // 2. Create a channel (required for Android)
  // You can do this multiple times; it only creates the channel if it doesn't exist.
  const channelId = await notifee.createChannel({
    id: 'messages',
    name: 'Messages',
    importance: AndroidImportance.HIGH, // To make the notification pop up
  });

  // Log the incoming message data for debugging
  // console.log(
  //   'Notification data received:',
  //   JSON.stringify(messageData, null, 2),
  // );

  let notificationTitle, notificationData;

  if (type === 'group') {
    // Handle group message structure
    notificationTitle = messageData.conversation?.group_name || 'Group Message';
    const senderName = messageData.sender?.name || 'Someone';
    const messageContent = messageData.content || 'New message';

    notificationData = {
      action: 'open_chat',
      conversationId: messageData.conversation?.id || '',
      isGroup: 'true',
      sender_id: messageData.sender?.id || '',
      name: notificationTitle,
      GroupId: messageData.conversation?.group_id || '',
      group_name: messageData.conversation?.group_name || 'Group',
      sender_name: senderName,
      content: messageContent,
      created_at: messageData.created_at,
    };
    console.log('displayMessageNotification -=-=-=-------->', notificationData);

    // Update the notification title to show both group name and sender
    notificationTitle = `${senderName} in ${notificationTitle}`;
  } else {
    // Handle private message structure
    notificationTitle =
      messageData.sender_name || messageData.senderName || 'New Message';
    notificationData = {
      action: 'open_chat',
      conversationId:
        messageData.conversation_id || messageData.conversationId || '',
      isGroup: String(messageData.is_group || messageData.isGroup || false),
      sender_id: String(messageData.sender_id || messageData.senderId || ''),
      name: String(notificationTitle),
      GroupId: String(messageData.sender_id || messageData.senderId || ''),
      content: messageData.content || 'New message',
      created_at: messageData.created_at,
    };
  }

  // console.log(
  //   'Sending notification with data:',
  //   JSON.stringify(notificationData, null, 2),
  // );

  // Add to active notifications with timestamp
  activeNotifications.set(notificationId, Date.now());

  // Clean up after some time (1 hour)
  setTimeout(() => {
    activeNotifications.delete(notificationId);
  }, 3600000);

  // Display the notification
  await notifee.displayNotification({
    id: notificationId, // Set the ID to prevent duplicates
    title: notificationTitle,
    body: messageData.content || 'You have a new message.',
    data: notificationData,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
      // Show the time as sub-text, just like WhatsApp
      subText: formatTimestamp(messageData.created_at),
      // Optional: Add a quick reply action
      // actions: [
      //   {
      //     title: 'Reply',
      //     pressAction: { id: 'reply' },
      //     input: true, // This enables a text input field
      //   },
      // ],
    },
    ios: {
      // On iOS, the time is usually part of the default notification layout
      // You can add a subtitle if you wish
      subtitle: formatTimestamp(messageData.created_at),
    },
  });
}

export async function displayIncomingCallNotification(callData) {
  try {
    if (!callData || !callData.initiator || !callData.call_id) {
      console.error('Invalid call data for notification:', callData);
      return;
    }

    const notificationId = `call-${callData.call_id}`;

    // Skip if we've already shown this notification
    if (activeNotifications.has(notificationId)) {
      console.log('Skipping duplicate call notification:', notificationId);
      return;
    }

    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'incoming-calls',
      name: 'Incoming Calls',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    const callerName = callData.initiator.name || 'Unknown Caller';

    // Track this notification
    activeNotifications.set(notificationId, Date.now());

    // Display the incoming call notification
    await notifee.displayNotification({
      id: notificationId,
      title: `Incoming ${callData.call_type || 'call'} from ${callerName}`,
      body: callData.call_type === 'video' ? 'Video call...' : 'Voice call...',
      data: {
        action: 'incoming_call',
        callId: callData.call_id,
        callData: JSON.stringify(callData),
      },
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Decline',
            pressAction: {id: 'decline_call'},
          },
          {
            title: 'Accept',
            pressAction: {id: 'accept_call'},
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error displaying incoming call notification:', error);
  }
}
export async function displayMissedCallNotification(callData) {
  try {
    if (!callData || !callData.call_id) {
      console.error('Invalid missed call data for notification:', callData);
      return;
    }

    const notificationId = `missed-call-${callData.call_id}`;

    // Skip if we've already shown this notification
    if (activeNotifications.has(notificationId)) {
      console.log(
        'Skipping duplicate missed call notification:',
        notificationId,
      );
      return;
    }

    const callCount = callData.missed_count || 1;
    const notificationData = {
      action_type: 'MISSED_CALL',
      call_id: String(callData.call_id),
      conversation_id: callData.conversation_id
        ? String(callData.conversation_id)
        : '',
      is_group: String(callData.is_group),
      call_type: callData.call_type || 'call',
      missed_count: callCount,
      initiator: {
        ...callData.initiator,
        id: String(callData.initiator.id),
        name: String(callData.initiator.name || 'Unknown Caller'),
        email: String(callData.initiator.email || ''),
      },
    };

    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'missed-calls',
      name: 'Missed Calls',
      importance: AndroidImportance.HIGH,
    });

    // Track this notification
    activeNotifications.set(notificationId, Date.now());

    await notifee.displayNotification({
      id: notificationId,
      title: callCount > 1 ? `Missed ${callCount} calls` : 'Missed Call',
      body:
        callCount > 1
          ? `${notificationData.initiator.name} called you ${callCount} times`
          : `${notificationData.initiator.name} called you`,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        largeIcon: callData.initiator.avatar || 'ic_launcher',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Call Back',
            pressAction: {id: 'call_back'},
          },
          {
            title: 'Message',
            pressAction: {id: 'message_back'},
          },
        ],
      },
      ios: {
        sound: 'default',
      },
      data: notificationData,
    });
  } catch (error) {
    console.error('Error displaying missed call notification:', error);
  }
}
