import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HeaderComponents from '../../components/HeaderComponents/HeaderComponents';
import {
  fonts,
  mainWhiteColor,
  DarkColor,
  DarkColor80,
  mainOrangeColor,
  DarkColor60,
  DarkColor50,
} from '../../utils/style/fonts';
import MailOutlineIcon from '../../assets/svg/material_symbols_light_mail_outline';
import MailAddIcon from '../../assets/svg/system_uicons_mail_add';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import RNRestart from 'react-native-restart';

const CreateHubScreensWithAcccount = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState();


  useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await AsyncStorage1.getItem('userLoginResponse');
        setUserEmail(res?.data?.user?.email);
      } catch (err) {
        console.log('err on create hub screen -=-=-=-=-=---->', err);
      }
    };

    FetchData();

    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default behavior (exit app)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);

  const handlecreateHub = () => {
    navigation.navigate('CreateHubScreen');
  };

  const handleCreateHubWithDifferentEmail = async () => {
    await AsyncStorage1.removeItem('userLoginResponse');
    await AsyncStorage1.removeItem('isLoggedIn');
    RNRestart.Restart();
    // navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <HeaderComponents Type="Create a new hub" navigation={navigation} />
      <View style={styles.container}>
        <Text style={styles.title}>Select an email to use</Text>

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={handlecreateHub}>
          <View style={styles.iconContainer}>
            <MailOutlineIcon width={24} height={24} color={DarkColor60} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.emailText}>{userEmail}</Text>
            <Text style={styles.subText}>
              (You are currently logged in with this email)
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={handleCreateHubWithDifferentEmail}>
          <View style={styles.iconContainer}>
            <MailAddIcon width={24} height={24} color={DarkColor50} />
          </View>
          <Text style={styles.emailText}>Use a different email address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateHubScreensWithAcccount;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 5,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    borderColor: mainOrangeColor,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  emailText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  subText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: mainWhiteColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
});
