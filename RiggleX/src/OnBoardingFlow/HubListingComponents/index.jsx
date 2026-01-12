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
// Add isDisabled state for button disabling
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
import { useSettings } from '../../Api/context/SettingsContext';
import CustomText from '../../utils/CustomText';
import Loader from '../../utils/Loader/loader';
const { height } = Dimensions.get('window');
const COLORS = {
  primaryOrange: mainOrangeColor,
  white: mainWhiteColor,
  lightGray: '#F8F8F8',
  darkText: '#333333',
  lightText: '#555555',
  borderColor: '#E0E0E0',
};

const SectionTitle = ({
  children,
  style,
  color = DarkColor,
  marginBottom = 10,
  align = 'center',
  size = 24,
}) => (
  <CustomText
    style={[
      {
        fontSize: size,
        fontFamily: fonts.PoppinsSemiBold,
        color,
        marginBottom,
        textAlign: align,
      },
      style,
    ]}>
    {children}
  </CustomText>
);

const Subtitle = ({
  children,
  style,
  color = DarkColor80,
  marginBottom = 30,
  align = 'center',
}) => (
  <CustomText
    style={[
      {
        fontSize: 14,
        fontFamily: fonts.PoppinsLight,
        color,
        marginBottom,
        textAlign: align,
      },
      style,
    ]}>
    {children}
  </CustomText>
);

const HubListingScreen = ({ navigation }) => {
  const RocketImage = require('../../assets/LoginAssets/png/rocket_logo17.png');
  const CreateHubImage = require('../../assets/Png/CreateHubIcon.png');
  const { connect, reconnect } = useWebSocket();
  const [isDisabled, setIsDisabled] = useState(false);
  const { settings, updateSettings, isLoading } = useSettings();

  const [hubList1, setHubList1] = useState([]);
  const [Loader1, setLoader] = useState(false);

  useEffect(() => {
    const FetchData = async () => {
      try {
        setLoader(true);
        const res = await GetCreateWorkSpaceApi({});

        console.log(
          'res Hub Listing -=-=-=-=------>',
          JSON.stringify(res?.results),
          '\n',
          '\n',
          '\n',
        );
        setHubList1(res?.results);
      } catch (error) {
        console.log('error Hub Listing', error);
      } finally {
        setLoader(false);
      }
    };

    FetchData();
  }, []);

  const handleSkipForNow = async () => {
    try {
      await AsyncStorage1.setItem('isLoggedIn', 'true');
      reconnect();
      await new Promise(resolve => setTimeout(resolve, 500));
      navigation.replace('Home');
    } catch (error) {
      console.error('Error in handleSkipForNow:', error);
      // Still navigate even if WebSocket connection fails
      navigation.replace('Home');
    }
  };

  const [disabledHubId, setDisabledHubId] = useState(null);
  const renderHubItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={isDisabled ? 0.6 : 0.8}
      style={styles.hubConatiner}
      disabled={disabledHubId === item.id}
      onPress={async () => {
        setDisabledHubId(item.id);
        setTimeout(() => setDisabledHubId(null), 3000);
        try {
          await Promise.all([
            AsyncStorage1.setItem('HubId', JSON.stringify(item.id)),
            AsyncStorage1.setItem('HubName', JSON.stringify(item.name)),
          ]);

          // Then update the context
          await updateSettings({
            newHubId: item.id.toString(),
          });

          // Then handle the skip/next flow
          await handleSkipForNow();
        } catch (error) {
          console.error('Error selecting hub:', error);
          // Still try to proceed even if there's an error
          await handleSkipForNow();
        }
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderWidth: 1,
          borderColor: DarkColor60,
          borderRadius: 35,
          marginRight: 16,
        }}>
        <Image
          source={item?.logo ? { uri: item?.logo } : RocketImage}
          style={{
            width: 35,
            height: 35,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <CustomText
            style={{
              fontFamily: fonts.PoppinsSemiBold,
              fontSize: 12,
              color: DarkColor,
              paddingRight: 10,
            }}>
            {item?.name}
          </CustomText>
          <CustomText
            style={{
              fontFamily: fonts.PoppinsSemiBold,
              fontSize: 12,
              color: DarkColor,
            }}>
            ({item?.members_count})
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
      <View style={styles.headerCurve} />
      <View style={{ flex: 1, width: '100%' }}>
        <FlatList
          style={{ width: '100%', flex: 1, height: 400 }}
          data={hubList1}
          renderItem={renderHubItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.formContentContainer}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <SectionTitle>Existing Hubs</SectionTitle>
              <Subtitle>
                Join an existing hub or create a new one to get started
              </Subtitle>
            </>
          }
          ListFooterComponent={
            <View style={{ marginVertical: 10 }}>
              <CustomText
                style={{
                  color: DarkColor,
                  fontSize: 12,
                  fontFamily: fonts.PoppinsMedium,
                }}>
                Not the hub you're looking for?
              </CustomText>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  opacity: isDisabled ? 0.6 : 1,
                }}
                disabled={isDisabled}
                onPress={() => {
                  setIsDisabled(true);
                  navigation.navigate('JoinOrCreateHubScreen');
                  setTimeout(() => setIsDisabled(false), 3000);
                }}>
                <Image
                  source={CreateHubImage}
                  style={{
                    height: 35,
                    width: 35,
                    resizeMode: 'contain',
                    marginRight: 10,
                  }}
                />
                <CustomText
                  style={{
                    color: DarkColor,
                    fontSize: 14,
                    fontFamily: fonts.PoppinsMedium,
                  }}>
                  Create Hub or Join Hub
                </CustomText>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Loader status={Loader1} />
    </View>
  );
};

export default HubListingScreen;
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
    height: '20%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  hubConatiner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 12,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  formContentContainer: {
    flexGrow: 1,
    // alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 50,
    marginTop: '20%',
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: Platform.OS === 'ios' ? 200 : 100,
  },
  astroImage: {
    width: 143,
    height: 143,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  // Welcome Screen Styles
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  riggleLogo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: DarkColor,
    textAlign: 'center',
    fontFamily: fonts.PoppinsRegular,
  },
  welcomeButtonContainer: {
    padding: 20,
  },
  // Shared Styles for Login/Signup
  astroLogo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: height * 0.05,
  },
  continueButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: 12,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: mainWhiteColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  // BottomSheet Styles
  form: { width: '100%', paddingHorizontal: 5 },
  bottomSheetContainer: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65, // Adjust height as needed
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.white,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 28,
    // fontWeight: 'bold',
    fontFamily: fonts.PoppinsSemiBold,
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: 10,
  },
  bottomSheetSubtitle: {
    fontSize: 12,
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: fonts.PoppinsMedium,
  },
  termsContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginTop: 10,
  },
  termsText: {
    fontSize: 12,
    color: mainWhiteColor,
    textAlign: 'center',
    flex: 1,
    marginLeft: 10,
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    justifyContent: 'center',
  },
  authButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
    resizeMode: 'contain',
  },
  authButtonText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  inputContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: mainWhiteColor,
    marginBottom: 8,
    fontFamily: fonts.PoppinsMedium,
  },
  inputField: {
    backgroundColor: mainWhiteColor,
    borderRadius: 6,
    padding: 15,
    paddingVertical: 10,
    fontSize: 13,
    color: DarkColor,
    borderWidth: 1,
    borderColor: DarkColor20,
    fontFamily: fonts.PoppinsRegular,
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    width: '100%',
    marginBottom: 20,
    color: DarkColor,
  },

  methodButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: 13,
    borderRadius: 8,
    width: '100%',
    // borderWidth: 1,
    // borderColor: '#eoeoeo',
    marginBottom: 15,
  },

  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    borderWidth: 1,
    borderColor: '#eoeoeo',
    marginBottom: 15,
  },
  methodIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 12 },
  methodButtonText: {
    color: DarkColor80,
    fontSize: 12,
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
    padding: 25,
    paddingTop: 30,
    paddingBottom: 40,
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
    marginTop: 25,
    paddingHorizontal: 5,
  },
  countdownText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor60,
  },
  disabledText: { color: DarkColor60 },
  optionalText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsLight,
    color: DarkColor60,
  },
  SkipTextStyle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
    textDecorationLine: 'underline',
  },
  regularText: {
    marginTop: 4,
    fontSize: 13,
    color: '#263238',
    marginLeft: 3,
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  linkText: {
    marginTop: 4,
    fontSize: 13,
    color: '#FC8C4D',
    marginHorizontal: 3,
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  RedtextStyle: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
  },

  dateText: {
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    fontSize: 13,
  },
  datePlaceholder: {
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor50,
    fontSize: 13,
  },

  joinScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  joinTopContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Pushes content up to make room for the bottom sheet
    paddingBottom: height * 0.2,
  },
  joinRocketImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  joinTitle: {
    fontSize: 22,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 8,
  },
  joinSubtitle: {
    fontSize: 16,
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
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Safe area padding for bottom
    alignItems: 'center',
  },
  joinHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ffffff',
    borderRadius: 2.5,
    marginBottom: 40,
  },
  joinButton: {
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
  },
  joinButtonText: {
    color: DarkColor80,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  joinOrText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    marginVertical: 15,
  },
});
