import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebSocket, WebSocketProvider } from './src/Api/context/WebSocketServices';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { Provider } from 'react-redux';
import { navigationRef } from './src/navigation/RootNavigation';
import { AuthProvider, useAuth } from './src/Api/context/AuthContext';
import { useWebRTC, WebRTCProvider } from './src/Api/context/WebRTCProvider';
import { SettingsProvider } from './src/Api/context/SettingsContext';
import CallListener from './src/components/CallListener';
import StackNavigation from './src/navigation/StackNavigation';
import { AppState, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import FormData from 'form-data';
import AsyncStorage1 from './src/Api/config/AsyncStorage';
import { PatchFCMTokenApi } from './src/Api/config/HomeApi';
import { setupNotificationHandlers } from './src/utils/notificationManager';


function App() {
  return (
    <SettingsProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <WebSocketProvider>
              <WebRTCProvider>
                <SafeAreaView style={{ flex: 1 }}>
                  <CallListener />
                  <NavigationContainer ref={navigationRef}>
                    <StackNavigation />
                  </NavigationContainer>
                  <AppContent />
                </SafeAreaView>
              </WebRTCProvider>
            </WebSocketProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </SettingsProvider>
  );
}

function AppContent() {
  const { initiateCall, callState, endCall } = useWebRTC();
  const { sendMessage } = useWebSocket();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Call the function to set up notifications
    setupCloudMessaging();
    // Initialize notification handlers
    setupNotificationHandlers();
  }, []);

  const setupCloudMessaging = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const getFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('Your FCM Token is:', fcmToken, '\n', '\n');
        const formData = new FormData();
        formData.append('token', fcmToken);
        formData.append('device_type', Platform.OS);
        console.log('formData app -=-=-=>', formData);
        // var storedData = await AsyncStorage1.getItem('isLoggedIn');
        // if (JSON.parse(storedData) === true) {
        const res = await PatchFCMTokenApi(formData);
        // console.log('res app fcm -=-=-=>', res);
        // }
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      // console.error('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log(
        'A new FCM message arrived in the foreground!',
        JSON.stringify(remoteMessage),
      );

      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        android: {
          channelId: 'default',
        },
      });
    });

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );
        // Navigate to a specific screen based on the message data
        if (remoteMessage.data.screen) {
          navigationRef.current?.navigate(
            remoteMessage.data.screen,
            remoteMessage.data.params || {},
          );
        }
      });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          if (remoteMessage.data.screen) {
            navigationRef.current?.navigate(
              remoteMessage.data.screen,
              remoteMessage.data.params || {},
            );
          }
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App came to foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('App went to background');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const onNotificationEvent = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (type !== EventType.ACTION_PRESS) return;

        const { pressAction, notification } = detail;
        const { data } = notification;

        console.log('Notification action pressed:', pressAction.id, data);

        try {
          if (data.action_type === 'MISSED_CALL') {
            if (pressAction.id === 'call_back') {
              console.log('Call back pressed for missed call');
              await notifee.cancelNotification(notification.id);
              initiateCall(data.initiator.id, data.call_type.includes('video'));
              navigationRef.current?.navigate('CallScreen');
            }
            if (pressAction.id === 'message_back') {
              console.log('Message back pressed for missed call');
              await notifee.cancelNotification(notification.id);
              navigationRef.current?.navigate('ChatWindows', {
                conversationId: data.conversation_id,
                isGroup: data.is_group,
                GroupId: data.initiator.id,
                name: data.initiator.name,
              });
            }
          }

          if (data.action_type === 'INCOMING_CALL') {
            if (pressAction.id === 'decline_call') {
              console.log('Call declined');
              await notifee.cancelNotification(notification.id);
              sendMessage({
                action: 'answer_call',
                call_id: data.call_id,
                answer: false,
              });
            }
            if (pressAction.id === 'accept_call') {
              console.log('Call accepted');
              await notifee.cancelNotification(notification.id);
              navigationRef.current?.navigate('CallScreen', {
                callData: data,
                isIncomingCall: true,
              });
            }
          }
        } catch (error) {
          console.error('Error handling notification action:', error);
        }
      },
    );

    return () => onNotificationEvent();
  }, [initiateCall, sendMessage]);

  return (
    <></>
  );
}
export default App;