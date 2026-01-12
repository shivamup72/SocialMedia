import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeComponents from './HomeComponents';
import ScreenView from '../../../utils/ScreenView';

const Stack = createStackNavigator();

const ScreenHome = ({ navigation }) => {
  return (
    <ScreenView>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          navigation={navigation}
          name="HomeComponents"
          component={HomeComponents}
        />
      </Stack.Navigator>
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
