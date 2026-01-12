import { StyleSheet, View, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import HeaderComponents from './Header/HeaderComponents';
import ChatListScreen from './ChatListScreen';
import ScreenView from '../utils/ScreenView';

const ChatScreen = ({ navigation }) => {
  // 1. Local State: FilterValue
  const [FilterValue, setFilterValue] = useState('All');

  // 2. Local State: SearchValue
  const [SearchValue, setSearchValue] = useState('');

  return (
    <ScreenView>
      {/* HeaderComponents receives setFilterValue and setSearchValue */}
      <HeaderComponents
        navigation={navigation}
        FilterValue={FilterValue}
        setFilterValue={setFilterValue} // <-- A
        setSearchValue={setSearchValue} // <-- B
        SearchValue={SearchValue}
      />
      {/* ChatListScreen receives SearchValue as a prop */}
      <ChatListScreen navigation={navigation} SearchValue={SearchValue} />
    </ScreenView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
