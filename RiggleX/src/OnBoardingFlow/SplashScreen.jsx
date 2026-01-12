import React, { useEffect } from 'react';
import { View, Image, Dimensions, StatusBar, Text, StyleSheet } from 'react-native';
import { fonts, mainOrangeColor } from '../utils/style/fonts'
import AsyncStorage1 from '../Api/config/AsyncStorage';
const SCREEN_Height = Dimensions.get('window').height;



const checkRoute = async navigation => {
  var storedData = await AsyncStorage1.getItem('isLoggedIn');


  if (JSON.parse(storedData) === true) {
    navigation.replace('Home');
  } else {
    navigation.replace('Login');
  }
};



function SplashScreen({ navigation }) {


  useEffect(() => {
    const timer = setTimeout(() => {
      checkRoute(navigation);
    }, 200); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [navigation]);



  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E16621" barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>RiggleX</Text>
      </View>
      <View style={styles.orangeBar} />
    </View>
  );
}
export default SplashScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontFamily: fonts.PoppinsSemiBold,
    color: mainOrangeColor,
    textAlign: 'center',
  },
  orangeBar: {
    height: 15,
    backgroundColor: '#FC8C4D',
    width: '100%',
  },
});