import { StyleSheet } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen1 from './index';
import ContactScreen from './ContactComponents/ContactScreen';
import PrivateChatScreen from './ContactComponents/PrivateChatScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mainWhiteColor } from '../utils/style/fonts';
const Stack = createStackNavigator();

const ScreenChat = ({ navigation, setHideTabBar, hideTabBar }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="ChatMain"
          children={props => <ChatScreen1 {...props} setHideTabBar={setHideTabBar} hideTabBar={hideTabBar} />}
        />
        <Stack.Screen
          name="ContactList"
          component={ContactScreen}
        />
        <Stack.Screen
          name="PrivateChatScreen"
          component={PrivateChatScreen}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default ScreenChat;

const styles = StyleSheet.create({});
