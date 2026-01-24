import { StyleSheet, View, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import HeaderComponents from './Header/HeaderComponents';
import ChatListScreen from './ChatListScreen';
import ScreenView from '../utils/ScreenView';
import { mainOrangeColor } from '../utils/style/fonts';
import { RfH, RfW } from '../utils/helper';
import SearchSvg from '../assets/svg/SearchSvg';

const ChatScreen = ({ navigation, setHideTabBar, hideTabBar }) => {
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
        setFilterValue={setFilterValue}
        setSearchValue={setSearchValue}
        searchIcon={<SearchSvg height='14' width='14' />}
        searchIconStyle={styles.searchIconSvg1}
        SearchValue={SearchValue}
        setHideTabBar={setHideTabBar}
        hideTabBar={hideTabBar}
      />
      {/* ChatListScreen receives SearchValue as a prop */}
      <ChatListScreen navigation={navigation} SearchValue={SearchValue} />
    </ScreenView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  searchIconSvg1: { backgroundColor: mainOrangeColor, height: RfH(22), width: RfW(22), borderRadius: 11, justifyContent: 'center', alignItems: 'center', right: RfW(10) },

});
