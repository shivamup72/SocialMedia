// navigation/RootNavigator.js
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import {useSelector} from 'react-redux';

const RootNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return <>{isAuthenticated ? <MainStack /> : <AuthStack />}</>;
};

export default RootNavigator;
