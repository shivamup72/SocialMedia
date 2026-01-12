import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  fonts,
  mainOrangeColor,
  mainOrange80,
  mainOrange92,
  DarkColor80,
  DarkColor,
  DarkColor50,
  DarkColor60,
  mainWhiteColor,
  DarkColor20,
} from '../../utils/style/fonts';
import {
  PostCreateWorkSpaceApi,
  GetWorkSpaceCode,
  GetCreateWorkSpaceApi,
  PostJoinHubByCodeApi,
  PatchUserDetailsapi,
} from '../../Api/config/HomeApi';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { useWebSocket } from '../../Api/context/WebSocketServices';
// import Loader from '../../Loader/loader';

const { height } = Dimensions.get('window');

import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../utils/CustomText';
import ScreenView from '../../utils/ScreenView';
import { normalize, RfH, RfW } from '../../utils/helper';

const COLORS = {
  primaryOrange: mainOrangeColor,
  white: mainWhiteColor,
  lightGray: '#F8F8F8',
  darkText: '#333333',
  lightText: '#555555',
  borderColor: '#E0E0E0',
};

const JoinOrCreateHubScreen = ({ navigation }) => {
  const RocketImage = require('../../assets/LoginAssets/png/rocket_logo17.png');
  const CreateHubImage = require('../../assets/Png/CreateHubIcon.png');
  const { connect } = useWebSocket();

  const RocketImageIcon = require('../../assets/newOnBoardingAssests/png/rocketLogoIcon.png');

  const [hubList1, setHubList1] = useState([]);
  const [Loader1, setLoader] = useState(false);

  const handleNavigateToJoinHub = async () => {
    // await AsyncStorage1.setItem('isLoggedIn', 'true');
    // connect();
    navigation.navigate('JoinHubScreen', { type: 'login' });
    // setCurrentScreen('JoinHubScreen');
  };

  const handleNavigateToCreateHub = async () => {
    // await AsyncStorage1.setItem('isLoggedIn', 'true');
    // connect();
    navigation.navigate('CreateHubScreen', { type: 'login' });
    // setCurrentScreen('CreateHubScreen');
  };

  // console.log('hubList1', hubList1);

  return (
    <ScreenView>
      <StatusBar barStyle="dark-content" backgroundColor={'#ffffff'} />

      <View style={styles.joinTopContainer}>
        <Image source={RocketImageIcon} style={styles.joinRocketImage} />
        <CustomText style={styles.joinTitle}>Fuel your workflow.</CustomText>
        <CustomText style={styles.joinSubtitle}>
          It's time to join or create your hub.
        </CustomText>
      </View>

      {/* Bottom Sheet Section */}
      <View style={styles.joinBottomSheet}>
        <View style={styles.joinHandle} />
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleNavigateToJoinHub}>
          <CustomText style={styles.joinButtonText}>Join a Hub</CustomText>
        </TouchableOpacity>
        <CustomText style={styles.joinOrText}>or</CustomText>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleNavigateToCreateHub}>
          <CustomText style={styles.joinButtonText}>Create a Hub</CustomText>
        </TouchableOpacity>
      </View>
    </ScreenView>
  );
};

export default JoinOrCreateHubScreen;
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  headerCurve: {
    backgroundColor: mainOrangeColor,
    height: RfH(120),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  formContentContainer: {
    flexGrow: 1,
    paddingHorizontal: RfW(18),
    paddingTop: RfH(50),
    marginTop: RfH(120),
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: Platform.OS === 'ios' ? RfH(200) : RfH(100),
  },
  astroImage: {
    width: RfW(143),
    height: RfH(143),
    resizeMode: 'contain',
    marginBottom: RfH(20),
  },
  // Welcome Screen Styles
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RfW(20),
  },
  riggleLogo: {
    width: RfW(200),
    height: RfH(200),
    resizeMode: 'contain',
    marginBottom: RfH(20),
  },
  title: {
    fontSize: normalize(32),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: RfH(10),
  },
  subtitle: {
    fontSize: normalize(16),
    color: DarkColor,
    textAlign: 'center',
    fontFamily: fonts.PoppinsRegular,
  },
  welcomeButtonContainer: {
    padding: RfW(20),
  },
  // Shared Styles for Login/Signup
  astroLogo: {
    width: RfW(200),
    height: RfH(200),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: RfH(height * 0.05),
  },
  continueButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: RfH(12),
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginTop: RfH(10),
  },
  continueButtonText: {
    color: mainWhiteColor,
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsSemiBold,
  },
  // BottomSheet Styles
  form: { width: '100%', paddingHorizontal: RfW(5) },
  bottomSheetContainer: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: RfW(25),
    paddingTop: RfH(20),
    paddingBottom: Platform.OS === 'ios' ? RfH(30) : RfH(20),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: RfH(height * 0.65), // Adjust height as needed
  },
  bottomSheetHandle: {
    width: RfW(40),
    height: RfH(5),
    backgroundColor: COLORS.white,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: RfH(20),
  },
  bottomSheetTitle: {
    fontSize: normalize(28),
    // fontWeight: 'bold',
    fontFamily: fonts.PoppinsSemiBold,
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: RfH(10),
  },
  bottomSheetSubtitle: {
    fontSize: normalize(12),
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: RfH(30),
    fontFamily: fonts.PoppinsMedium,
  },
  termsContainer: {
    flexDirection: 'row',
    marginTop: RfH(10),
  },
  termsText: {
    fontSize: normalize(12),
    color: mainWhiteColor,
    textAlign: 'center',
    flex: 1,
    marginLeft: RfW(10),
  },
  linkText1: {
    fontFamily: fonts.PoppinsMedium,
    textDecorationLine: 'underline',
    color: mainWhiteColor,
  },
  // Auth Button Styles
  authButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: RfH(15),
    paddingHorizontal: RfW(20),
    marginBottom: RfH(15),
    justifyContent: 'center',
  },
  authButtonIcon: {
    width: RfW(20),
    height: RfH(20),
    marginRight: RfW(15),
    resizeMode: 'contain',
  },
  authButtonText: {
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  inputContainer: {
    marginBottom: RfH(15),
    paddingHorizontal: RfW(20),
  },
  inputLabel: {
    fontSize: normalize(12),
    color: mainWhiteColor,
    marginBottom: RfH(8),
    fontFamily: fonts.PoppinsMedium,
  },
  inputField: {
    backgroundColor: mainWhiteColor,
    borderRadius: 6,
    padding: RfW(15),
    paddingVertical: RfH(10),
    fontSize: normalize(13),
    color: DarkColor,
    borderWidth: 1,
    borderColor: DarkColor20,
    fontFamily: fonts.PoppinsRegular,
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RfH(15),
  },
  resendText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#FFFFFF80',
  },
  timerText: {
    color: COLORS.white,
  },
  // Primary Button Styles
  primaryButtonContainer: {
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    // Inverted colors for the bottom sheet version
    ...Platform.select({
      default: {
        // Styles for buttons on the orange background
        backgroundColor: COLORS.white,
      },
      welcome: {
        // Specific styles if needed, otherwise it falls back to default
        backgroundColor: COLORS.primaryOrange,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    // Inverted colors for the bottom sheet version
    ...Platform.select({
      default: {
        color: COLORS.primaryOrange,
      },
      welcome: {
        color: COLORS.white,
      },
    }),
  },

  textInput: {
    backgroundColor: mainWhiteColor,
    borderWidth: 0.5,
    borderColor: DarkColor80,
    borderRadius: 6,
    paddingHorizontal: RfW(15),
    paddingVertical: RfH(10),
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsRegular,
    width: '100%',
    marginBottom: RfH(20),
    color: DarkColor,
  },

  methodButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: RfH(13),
    borderRadius: 8,
    width: '100%',
    marginBottom: RfH(15),
  },

  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: RfH(15),
    borderRadius: 8,
    width: '80%',
    borderWidth: 1,
    borderColor: '#eoeoeo',
    marginBottom: RfH(15),
  },
  methodIcon: { width: RfW(20), height: RfH(20), resizeMode: 'contain', marginRight: RfW(12) },
  methodButtonText: {
    color: DarkColor80,
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: mainWhiteColor,
    padding: RfW(25),
    paddingTop: RfH(30),
    paddingBottom: RfH(40),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 20 : 0,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 20 : 0,
    borderColor: mainOrangeColor,
    alignItems: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: RfH(25),
    paddingHorizontal: RfW(5),
  },
  countdownText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: normalize(14),
    color: DarkColor60,
  },
  disabledText: { color: DarkColor60 },
  optionalText: {
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsLight,
    color: DarkColor60,
  },
  SkipTextStyle: {
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
    textDecorationLine: 'underline',
  },
  regularText: {
    marginTop: RfH(4),
    fontSize: normalize(13),
    color: '#263238',
    marginLeft: RfW(3),
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  linkText: {
    marginTop: RfH(4),
    fontSize: normalize(13),
    color: '#FC8C4D',
    marginHorizontal: RfW(3),
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  RedtextStyle: {
    color: 'red',
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
  },

  dateText: {
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    fontSize: normalize(13),
  },
  datePlaceholder: {
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor50,
    fontSize: normalize(13),
  },

  joinScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  joinTopContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: RfW(20),
    paddingBottom: RfH(height * 0.2),
  },
  joinRocketImage: {
    width: RfW(220),
    height: RfH(220),
    resizeMode: 'contain',
    marginBottom: RfH(20),
  },
  joinTitle: {
    fontSize: normalize(22),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: RfH(8),
  },
  joinSubtitle: {
    fontSize: normalize(16),
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    textAlign: 'center',
  },
  joinBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: mainOrangeColor,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: RfW(30),
    paddingTop: RfH(15),
    paddingBottom: Platform.OS === 'ios' ? RfH(40) : RfH(30),
    alignItems: 'center',
  },
  joinHandle: {
    width: RfW(40),
    height: RfH(5),
    backgroundColor: '#ffffff',
    borderRadius: 2.5,
    marginBottom: RfH(40),
  },
  joinButton: {
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    paddingVertical: RfH(12),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: RfH(45),
  },
  joinButtonText: {
    color: DarkColor80,
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsSemiBold,
  },
  joinOrText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fonts.PoppinsRegular,
    fontSize: normalize(14),
    marginVertical: RfH(15),
  },
});
