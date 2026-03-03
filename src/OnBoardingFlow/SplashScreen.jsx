import React, { useEffect } from 'react';
import { View, Image, Dimensions, StatusBar, Text, StyleSheet } from 'react-native';
import { fonts, mainOrangeColor } from '../utils/style/fonts'
import AsyncStorage1 from '../Api/config/AsyncStorage';
import CustomText from '../utils/CustomText';
import { useDispatch } from 'react-redux';
const SCREEN_Height = Dimensions.get('window').height;



function SplashScreen({ navigation }) {

  const dispatch = useDispatch();

  const checkRoute = async navigation => {
    var isLoggedIn = await AsyncStorage1.getItem('isLoggedIn');
    if (isLoggedIn == "true") {
      dispatch(setAuthenticated(true));
    } else {
      navigation.replace('Login');
    }
  };

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
        <CustomText style={styles.logoText}>RiggleX</CustomText>
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