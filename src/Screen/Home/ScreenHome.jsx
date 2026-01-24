import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import { displayMessageNotification } from '../../utils/notificationManager';
import HomeComponents from '../../components/HomeComponent/HomeComponents';

import ScreenView from '../../utils/ScreenView';

const ScreenHome = ({ navigation, setHideTabBar }) => {
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (
      lastMessage &&
      !lastMessage.is_muted &&
      (
        (lastMessage.action === 'receive_new_message' && lastMessage.data) ||
        (lastMessage.action === 'receive_new_group_message' && lastMessage.message)
      )
    ) {
      if (lastMessage.action === 'receive_new_message') {
        displayMessageNotification(lastMessage.data, 'private');
      } else if (lastMessage.action === 'receive_new_group_message') {
        displayMessageNotification(lastMessage.message, 'group');
      }
    }
  }, [lastMessage]);

  return (
    <ScreenView>
      <HomeComponents navigation={navigation} setHideTabBar={setHideTabBar} />
    </ScreenView>
  );
};

export default ScreenHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B00',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
