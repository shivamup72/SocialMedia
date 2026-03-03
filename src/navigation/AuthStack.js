// navigation/AuthStack.js
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../OnBoardingFlow/SplashScreen';
import NewLogin from '../OnBoardingFlow/newOnBoardingFlow/index';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Login" component={NewLogin} />
    </Stack.Navigator>
  );
};

export default AuthStack;
