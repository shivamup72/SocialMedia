import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {AppState} from 'react-native';
import {getApiURL1, Base_url} from '../config/apiUrls';
import AsyncStorage1 from '../config/AsyncStorage';
// import {refreshToken} from '../config/auth';
import {
  displayMessageNotification,
  displayIncomingCallNotification,
  displayMissedCallNotification,
} from '../../utils/notificationManager';
import RNRestart from 'react-native-restart';
import {useSettings} from './SettingsContext';
import {getPendingMessages, updateMessageStatus} from '../../utils/chatSQLite';

const WebSocketContext = createContext({
  isConnected: false,
  lastMessage: null,
  sendMessage: message => {},
  connect: () => {},
  reconnect: () => {},
  newMessageTrigger: false,
  manageNewMessageToastChatScreen: null,
  recentThreadMessages: null,
});

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

const MAX_RECONNECT_ATTEMPTS = 6;

export const WebSocketProvider = ({children}) => {
  // ...existing code...
  const lastSentMessageRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [recentThreadMessages, setRecentThreadMessages] = useState(null);
  const [newMessageTrigger, setNewMessageTrigger] = useState(false);
  const [manageNewMessageToastChatScreen, setManageNewMessageToastChatScreen] =
    useState(null);
  const ws = useRef(null);
  const outgoingQueue = useRef([]); // Queue for unsent messages
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  const connecting = useRef(false); // Prevent multiple simultaneous connects

  const {HubId} = useSettings();

  const appState = useRef(AppState.currentState);

  const attemptReconnect = useCallback((immediate = false) => {
    if (
      ws.current?.readyState === WebSocket.OPEN ||
      ws.current?.readyState === WebSocket.CONNECTING
    ) {
      console.log(
        'Reconnect attempt aborted: WebSocket already connected or connecting.',
      );
      return;
    }

    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log(
        'Max reconnection attempts reached. Will retry on app resume.',
      );
      return;
    }
    const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
    reconnectAttempts.current++;
    console.log(
      `Attempting to reconnect in ${delay}ms... (Attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`,
    );

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    reconnectTimeout.current = setTimeout(() => {
      if (connectSocketRef.current) {
        connectSocketRef.current(true);
      }
    }, delay);
  }, []);

  // console.log('Hub Id Websocket -=-=-=------>',HubId,'\n','\n');

  const connectSocket = useCallback(
    async (isReconnect = false, forceReconnect = false) => {
      if (connecting.current) {
        console.log('WebSocket connection already in progress. Skipping.');
        return;
      }
      if (!HubId) {
        console.log('No HubId available, cannot connect WebSocket');
        if (ws.current) {
          ws.current.close();
          ws.current = null;
          setIsConnected(false);
        }
        return;
      }

      if (ws.current?.readyState === WebSocket.OPEN && !forceReconnect) {
        console.log('WebSocket already connected');
        return;
      }

      try {
        const storedData = await AsyncStorage1.getItem('isLoggedIn');
        if (storedData === 'false' || storedData === null) {
          console.log('Not logged in, skipping WebSocket connection');
          if (ws.current) {
            ws.current.close();
            ws.current = null;
            setIsConnected(false);
          }
          return;
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        return;
      }

      if (
        ws.current?.readyState === WebSocket.CONNECTING ||
        ws.current?.readyState === WebSocket.OPEN
      ) {
        console.log(
          'WebSocket connection already in progress or established. Aborting new connect attempt.',
        );
        return;
      }

      if (isReconnect) {
        console.log('Attempting to reconnect WebSocket...');
      }

      connecting.current = true;
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        try {
          ws.current.onmessage = null;
          ws.current.onclose = null;
          ws.current.onerror = null;
        } catch (e) {
          console.warn('Error clearing old WebSocket handlers:', e);
        }
        ws.current.close();
        ws.current = null;
      }

      try {
        const token = await AsyncStorage1.getItem('sessionId');

        if (!token) {
          console.error('No auth token found in AsyncStorage');
          return;
        }

        if (!HubId) {
          console.error('No HubId found from SettingsContext');
          return;
        }

        const cleanToken = token.replace(/^"|"$/g, '');

        try {
          const wsTokenResponse = await fetch(Base_url + 'chats/ws/token/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cleanToken}`,
              'X-Hub-Id': HubId,
            },
          });

          if (!wsTokenResponse.ok) {
            const errorText = await wsTokenResponse.text();
            console.error(
              'Failed to get WebSocket token:',
              wsTokenResponse.status,
              errorText,
            );
            await AsyncStorage1.removeItem('isLoggedIn');
            await AsyncStorage1.removeItem('userLoginResponse');
            await AsyncStorage1.removeItem('is_day_started');
            await AsyncStorage1.removeItem('is_live_on');
            await AsyncStorage1.removeItem('sessionId');
            await AsyncStorage1.removeItem('HubName');
            await AsyncStorage1.removeItem('HubId');
            // RNRestart.Restart();
            return;
          }

          const response = await wsTokenResponse.json();
          const wsToken = response?.data?.socket_token;

          console.log(
            'Retrieved WebSocket token: -=-=-=-=-=--------->',
            wsToken,
          );

          if (!wsToken) {
            console.error('No socket_token found in response:', response);
            throw new Error(
              'No socket_token received from WebSocket token endpoint',
            );

            await AsyncStorage1.removeItem('isLoggedIn');
            await AsyncStorage1.removeItem('userLoginResponse');
            await AsyncStorage1.removeItem('is_day_started');
            await AsyncStorage1.removeItem('is_live_on');
            await AsyncStorage1.removeItem('sessionId');
            await AsyncStorage1.removeItem('HubName');
            await AsyncStorage1.removeItem('HubId');
            RNRestart.Restart();
            return;
          }

          const wsUrl = `wss://r-one.stag.api.riggleapp.in/ws/chat/?token=${encodeURIComponent(
            wsToken,
          )}`;

          // const wsUrl = `wss://r-one.stag.api.riggleapp.in/ws/chat/?token=${encodeURIComponent(
          //   wsToken,
          // )}`;

          console.log(
            'Connecting to WebSocket with URL:',
            wsUrl,
            'for HubId:',
            HubId,
          );

          ws.current = new WebSocket(wsUrl);
          console.log('WebSocket: new connection created');

          ws.current.onopen = () => {
            console.log('WebSocket Connected for HubId:', HubId);
            setIsConnected(true);
            reconnectAttempts.current = 0;
            connecting.current = false;
            // Send any queued messages
            if (outgoingQueue.current.length > 0) {
              outgoingQueue.current.forEach(msg => {
                try {
                  ws.current.send(JSON.stringify(msg));
                  lastSentMessageRef.current = JSON.stringify(msg);
                  console.log(
                    'Sent queued WebSocket message:',
                    JSON.stringify(msg),
                  );
                } catch (e) {
                  console.error('Failed to send queued message:', e);
                }
              });
              outgoingQueue.current = [];
            }
            // Send pending messages from SQLite
            getPendingMessages(async pendingMessages => {
              for (const pending of pendingMessages) {
                try {
                  ws.current.send(JSON.stringify(JSON.parse(pending.content)));
                  updateMessageStatus(pending.id, 'sent');
                  console.log('Sent pending SQLite message:', pending);
                } catch (e) {
                  console.error('Failed to send pending SQLite message:', e);
                }
              }
            });
            if (reconnectTimeout.current) {
              clearTimeout(reconnectTimeout.current);
              reconnectTimeout.current = null;
            }
          };

          ws.current.onmessage = async event => {
            try {
              if (!event || !event.data) {
                console.warn('Received empty WebSocket message');
                return;
              }

              let parsed;
              try {
                parsed = JSON.parse(event.data);
              } catch (e) {
                console.error(
                  'Failed to parse WebSocket message:',
                  event.data,
                  e,
                );
                return;
              }

              if (!parsed || typeof parsed !== 'object') {
                console.warn('Invalid WebSocket message format:', parsed);
                return;
              }

              // Log the full WebSocket response in a web-like format
              // console.log(
              //   '\n================ SOCKET RESPONSE ================\n',
              //   JSON.stringify(parsed, null, 2),
              //   '\n=================================================\n',
              // );
              if (
                parsed?.message !== 'Threads messages retrieved successfully'
              ) {
                setLastMessage({...parsed, _ts: Date.now()});
              }

              try {
                if (
                  parsed?.message == 'Threads messages retrieved successfully'
                ) {
                  setRecentThreadMessages(parsed);
                }
                if (parsed.action === 'receive_new_message' && parsed.data) {
                  setManageNewMessageToastChatScreen(parsed);
                  setTimeout(() => {
                    setManageNewMessageToastChatScreen(null);
                  }, 3000);
                  console.log('parsed action message -=-=-=---->', parsed);
                  if (!parsed.is_muted) {
                    // await displayMessageNotification(parsed.data, 'private');
                  }

                  return;
                } else if (parsed.action === 'receive_thread_reply') {
                  if (!parsed.is_muted) {
                    // await displayMessageNotification(parsed.message, 'group');
                  }

                  return;
                } else if (
                  parsed.action === 'receive_new_group_message' &&
                  parsed.message
                ) {
                  setManageNewMessageToastChatScreen(parsed);
                  setNewMessageTrigger(true);
                  setTimeout(() => {
                    setNewMessageTrigger(false);
                  }, 1000);
                  setTimeout(() => {
                    setManageNewMessageToastChatScreen(null);
                  }, 3000);
                  if (!parsed.is_muted) {
                    // await displayMessageNotification(parsed.message, 'group');
                  }
                  return;
                } else if (parsed.action === 'receive_call' && parsed.data) {
                  if (!parsed.is_muted) {
                    await displayIncomingCallNotification(parsed.data);
                  }
                  return;
                } else if (
                  parsed.action === 'receive_call_missed' &&
                  parsed.data
                ) {
                  if (typeof parsed.data.is_group === 'boolean') {
                    parsed.data.is_group = String(parsed.data.is_group);
                  }
                  if (!parsed.is_muted) {
                    await displayMissedCallNotification(parsed.data);
                  }
                  return;
                } else if (parsed.action === 'call_ended') {
                  console.log('Call ended notification received', '\n', '\n');
                  return;
                }
              } catch (error) {
                console.error('Error handling WebSocket message:', error);
              }
            } catch (e) {
              console.error('Failed to process incoming message:', e);
            }
          };

          ws.current.onerror = error => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
            connecting.current = false;
            attemptReconnect();
          };

          ws.current.onclose = () => {
            console.log('WebSocket Disconnected for HubId:', HubId);
            setIsConnected(false);
            connecting.current = false;
            // Only attempt reconnect if HubId is still available
            if (HubId) {
              attemptReconnect();
            } else {
              console.log(
                'HubId became null/undefined, not attempting reconnect.',
              );
            }
          };
        } catch (error) {
          console.error('Error in WebSocket token or connection setup:', error);
          setIsConnected(false);
          attemptReconnect();
        }
      } catch (error) {
        console.error(
          'Failed to initiate WebSocket connection due to outer error:',
          error,
        );
        setIsConnected(false);
        connecting.current = false;
        attemptReconnect();
      }
    },
    [attemptReconnect, HubId],
  );

  const connectSocketRef = useRef(connectSocket);

  useEffect(() => {
    // Always update the ref when connectSocket changes
    connectSocketRef.current = connectSocket;

    // Set up app state change handler
    const handleAppStateChange = async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App coming to foreground
        reconnectAttempts.current = 0;
        connecting.current = false; // Ensure not blocked
        if (HubId) {
          await connectSocket(true);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        if (ws.current) {
          ws.current.close();
        }
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Initial connection logic
    const initializeConnection = async () => {
      try {
        const storedData = await AsyncStorage1.getItem('isLoggedIn');
        if (storedData === 'false' || storedData === null) {
          if (ws.current) {
            ws.current.close();
            ws.current = null;
            setIsConnected(false);
          }
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
          }
        } else if (
          HubId &&
          !connecting.current &&
          (!ws.current || ws.current.readyState !== WebSocket.OPEN)
        ) {
          connectSocket();
        }
      } catch (error) {
        console.error('Error checking login status on mount:', error);
      }
    };

    initializeConnection();

    return () => {
      subscription.remove();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, [connectSocket, HubId]);

  const sendMessage = useCallback(messageObject => {
    // If socket is open, send immediately
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        setLastMessage(null);
        const messageString = JSON.stringify(messageObject);
        ws.current.send(messageString);
        if (lastSentMessageRef.current !== messageString) {
          console.log('Sent WebSocket message:', messageString);
          lastSentMessageRef.current = messageString;
        }
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      // Queue the message for later
      outgoingQueue.current.push(messageObject);
      // Only attempt to connect if not already connecting/connected
      if (
        HubId &&
        !connecting.current &&
        (!ws.current || ws.current.readyState !== WebSocket.OPEN)
      ) {
        connectSocket(true, true);
      }
      // No more retry warnings or repeated logs
    }
  }, []);

  const reconnect = useCallback(() => {
    setLastMessage(null);
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    connectSocketRef.current?.(false, true);
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        reconnect();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [reconnect]);

  // Disconnect function to close the socket and cleanup
  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
      connecting.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      console.log('WebSocket manually disconnected');
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        sendMessage,
        connect: connectSocketRef.current,
        reconnect,
        disconnect,
        newMessageTrigger,
        manageNewMessageToastChatScreen,
        recentThreadMessages,
      }}>
      {children}
    </WebSocketContext.Provider>
  );
};
