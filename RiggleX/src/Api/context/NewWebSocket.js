import {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {Base_url} from '../config/apiUrls';
import AsyncStorage1 from '../config/AsyncStorage';

// Create context outside the provider component
const WebSocketContext = createContext();

const WebSocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef(null);

  // --- CENTRALIZED STATE ---
  // These states will be the single source of truth for your chat components.
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messageHandlerRef = useRef();

  const getConversationDetails = useCallback(
    conversationId => {
      if (socket && socket.readyState === WebSocket.OPEN && conversationId) {
        setMessages([]);
        setActiveConversationId(conversationId);
        const payload = {
          action: 'get_private_conversation_details',
          conversation_id: conversationId,
          page: 1,
          page_size: 20,
        };
        socket.send(JSON.stringify(payload));
      } else if (conversationId === null) {
        setMessages([]);
        setActiveConversationId(null);
      }
    },
    [socket],
  );

  const getAllConversations = useCallback(() => {
    console.log('getAllConversationssssssssssssss');
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        action: 'get_all_conversations',
        page: 1,
        page_size: 10,
        days_back: 30,
      };
      socket.send(JSON.stringify(payload));
    }
  }, [socket]);

  const refreshActiveConversation = useCallback(
    conversationId => {
      if (socket && socket.readyState === WebSocket.OPEN && conversationId) {
        // console.log('Refreshing conversation without scrolling...');
        const payload = {
          action: 'get_private_conversation_details',
          conversation_id: conversationId,
          page: 1,
          page_size: 20,
        };
        socket.send(JSON.stringify(payload));
      }
    },
    [socket],
  );

  const getGroupConversationDetails = useCallback(
    (conversationId, chatId) => {
      if (socket && socket.readyState === WebSocket.OPEN && conversationId) {
        const payload = {
          action: 'get_group_conversation_details',
          conversation_id: conversationId,
          group_id: chatId,
          page: 1,
          page_size: 20,
        };
        socket.send(JSON.stringify(payload));
      }
    },
    [socket],
  );

  const handleMessage = useCallback(
    event => {
      try {
        const data = JSON.parse(event.data);

        if (data.message === 'Chat history retrieved') {
          setChatList(data.data.conversations);
          setIsLoading(false);
        } else if (data.message === 'Conversation details retrieved') {
          setMessages(data.data.messages);
          getAllConversations();
        } else if (data.action === 'receive_new_message' && data.data) {
          const newMessage = data.data;
          // If the message belongs to the currently open chat...
          if (
            String(newMessage.conversation_id) === String(activeConversationId)
          ) {
            console.log('✅ Match found! Appending new message to state.');

            // ...add the new message directly to the messages array.
            setMessages(prevMessages => [
              newMessage,
              ...prevMessages.filter(msg => !msg.isSending),
            ]);
          }
          getAllConversations();
          const payload = {
            action: 'mark_messages_as_delivered',
            message_ids: newMessage.id,
          };
          socket.send(JSON.stringify(payload));
        } else if (data.message === 'Message sent') {
          // getAllConversations();
          //  getConversationDetails(activeConversationId);
          if (activeConversationId) {
            refreshActiveConversation(activeConversationId);
          }
        } else if (data.action === 'receive_messages_read') {
          getAllConversations();
          refreshActiveConversation(activeConversationId);
        } else if (
          data.message === 'Successfully marked 1 message(s) as delivered'
        ) {
          getAllConversations();
          refreshActiveConversation(activeConversationId);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message in context:', error);
      }
    },
    [activeConversationId, getAllConversations, getConversationDetails],
  );

  useEffect(() => {
    messageHandlerRef.current = handleMessage;
  }, [handleMessage]);

  const connectWebSocket = useCallback(async () => {
    try {
      const socketToken = AsyncStorage1.getItem('sessionId');
      if (!socketToken) {
        console.error('No socket token available');
        return;
      }
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const newSocket = new WebSocket(
        `wss://r-one.stag.api.riggleapp.in/ws/chat/?token=${encodeURIComponent(
          socketToken,
        )}`,
      );

      newSocket.onopen = () => {
        console.log('WebSocket connection opened');
        setIsConnected(true);
        setReconnectAttempts(0);
        message.success('WebSocket connected successfully');
        getAllConversations(); // Fetch initial chat list on connect
      };

      newSocket.onmessage = event => {
        if (messageHandlerRef.current) {
          messageHandlerRef.current(event);
        }
      };

      newSocket.onclose = event => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setIsConnected(false);
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const reconnectDelay = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            30000,
          );
          console.log(
            `Attempting to reconnect in ${reconnectDelay / 1000} seconds...`,
          );
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(
            () => getSocketToken(),
            reconnectDelay,
          );
        } else if (event.code !== 1000) {
          message.error(
            'Failed to reconnect to chat service. Please refresh the page.',
          );
        }
      };

      newSocket.onerror = error => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        message.error('WebSocket connection error');
      };

      setSocket(newSocket);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [
    handleMessage,
    reconnectAttempts,
    getAllConversations,
    getConversationDetails,
  ]);

  async function refreshToken() {
    try {
      const tokens = AsyncStorage1.getItem('Rreferesh_sessionId');
      // const tokens = JSON.parse(AUTH_TOKEN || '{}');
      // const refreshToken = tokens?.refresh?.token;

      if (!tokens) {
        console.error('No refresh token available');
        return null;
      }

      const response = await fetch(`${Base_url}users/auth/token/refresh/`, {
        method: 'POST',
        body: JSON.stringify({
          refresh: tokens,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.access && data.refresh) {
        AsyncStorage1.setItem(
          'Rreferesh_sessionId',
          JSON.stringify(data.refresh),
        );
        AsyncStorage1.setItem('sessionId', JSON.stringify(data.access));
        return data.access;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  const getSocketToken = useCallback(async () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      return;
    }
    try {
      const tokens = AsyncStorage1.getItem('sessionId');
      // const tokens = JSON.parse(AUTH_TOKEN || '{}');
      // const accessToken = tokens?.access?.token;
      const hub_id = AsyncStorage1.getItem('HubId');

      if (!tokens) return;

      const response = await fetch(`${Base_url}chats/ws/token/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens}`,
          'X-Hub-ID': `${hub_id}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        AsyncStorage1.setItem('socket_token', data.data.socket_token);
        await connectWebSocket();
      } else if (data.code === 'token_not_valid') {
        const newToken = await refreshToken();
        if (newToken) getSocketToken();
      }
    } catch (error) {
      console.error('Error getting socket token:', error);
    }
  }, [connectWebSocket, reconnectAttempts]);

  useEffect(() => {
    getSocketToken();
    return () => {
      if (socket) socket.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const sendMessage = useCallback(
    (payload, tempMessage) => {
      if (socket && isConnected) {
        if (tempMessage) {
          setMessages(prevMessages => [tempMessage, ...prevMessages]);
        }
        socket.send(JSON.stringify(payload));
      } else {
        message.error('Cannot send message. Not connected.');
      }
    },
    [socket, isConnected],
  );

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isLoading,
        chatList,
        messages,
        getAllConversations,
        getConversationDetails,
        getGroupConversationDetails,
        sendMessage,
        setActiveConversationId,
        getSocketToken,
      }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export {WebSocketProvider};
