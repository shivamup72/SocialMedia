import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useWebSocket } from '../Api/context/WebSocketServices';
import {
  mainOrangeColor,
  mainWhiteColor,
  RedColor,
  mainOrange80,
  DarkColor,
  DarkColor60,
  DarkCOlor30,
  fonts,
  DarkColor80,
} from '../utils/style/fonts';
import {
  PostJoinHubByCodeApi,
  PatchUserIDListingApi,
  GetCreateWorkSpaceApiId,
} from '../Api/config/HomeApi';
import AsyncStorage1 from '../Api/config/AsyncStorage';
import Toast from '../Api/context/Toast';
import BackArrowSvg from '../assets/svg/BackArrowSvg';
import CustomText from '../utils/CustomText';
import ScreenView from '../utils/ScreenView';

import { normalize, RfH, RfW } from '../utils/helper';

const Subtitle = ({ children, style, marginBottom = 0 }) => (
  <CustomText
    style={[
      {
        fontSize: normalize(14),
        color: DarkCOlor30,
        marginBottom: RfH(marginBottom),
      },
      style,
    ]}>
    {children}
  </CustomText>
);

const JoinHubScreen = ({ navigation, type, route }) => {
  const [selectedType, setSelectedType] = useState('Personal');
  const [hubCode, setHubCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [lineManager, setLineManager] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { connect } = useWebSocket();

  const toastRef = useRef(null);

  const handleSkipForNow = async () => {
    await AsyncStorage1.setItem('isLoggedIn', 'true');
    const UserLogin = await AsyncStorage1.getItem('userLoginResponse');
    const first_name = await AsyncStorage1.getItem('first_name');
    const last_name = await AsyncStorage1.getItem('last_name');
    const DOB = await AsyncStorage1.getItem('dob');
    const PostData = new FormData();
    PostData.append('first_name', first_name);
    PostData.append('last_name', last_name);
    PostData.append('dob', DOB);

    const respons1 = await PatchUserIDListingApi(
      UserLogin?.data?.user?.id,
      PostData,
    );
    console.log('respons1 -=-=-=-=-=----->', respons1, '\n', '\n', '\n');
    connect();
    navigation.replace('Home');
  };

  const handleBackPress = useCallback(() => {
    // console.log('Back button pressed', type);
    if (type === 'login') {
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  }, []);

  const handleJoinHub = async () => {
    if (!hubCode.trim()) {
      toastRef.current.show({
        type: 'error',
        message: 'Please enter a hub code',
      });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('code', hubCode);

      const response = await PostJoinHubByCodeApi(formData);
      // console.log('response -=-=-=-=-=----->', response, '\n');

      if (response.success) {
        // console.log('response -=-=-=-=-=----->', response);
        const res = await GetCreateWorkSpaceApiId(
          response?.data?.workspace_id,
          {},
        );
        // console.log('res -=-=-=-=-=----->', res);
        toastRef.current.show({
          type: 'success',
          message: 'Successfully joined hub',
        });
        await AsyncStorage1.setItem('HubName', JSON.stringify(res?.data?.name));
        await AsyncStorage1.setItem(
          'HubId',
          JSON.stringify(response?.data?.workspace_id),
        );

        if (route?.params?.type === 'login') {
          handleSkipForNow();
          navigation.replace('Home');
        } else {
          navigation.goBack();
        }
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Failed to join hub',
        });
      }
    } catch (error) {
      toastRef.current.show({
        type: 'error',
        message: error.message || 'An error occurred while joining the hub',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenView>
      <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
      <View style={styles.headerCurve} />
      <ScrollView
        contentContainerStyle={[styles.formContentContainer, { paddingTop: 35 }]}
        keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', position: 'relative' }}>
          <View
            style={{
              position: 'absolute',
              left: 10,
              top: 0,
              zIndex: 10,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={handleBackPress}
              activeOpacity={0.7}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <BackArrowSvg width="19" height="19" />
            </TouchableOpacity>
          </View>

          <CustomText
            style={{
              paddingLeft: RfW(5),
              fontSize: normalize(20),
              fontFamily: fonts.PoppinsSemiBold,
              color: DarkColor,
              marginBottom: RfH(10),
              alignSelf: 'center',
            }}>
            Join a Hub
          </CustomText>
        </View>

        <Subtitle marginBottom={10}>
          Enter code or link to join and start collaborating.
        </Subtitle>

        <View style={{ flex: 1, marginTop: RfH(20), width: '100%' }}>
          <CustomText style={styles.inputLabel}>Hub Code</CustomText>
          <TextInput
            style={styles.textInput}
            value={hubCode}
            onChangeText={setHubCode}
            placeholder="Enter Hub code"
            placeholderTextColor={DarkCOlor30}
            autoCapitalize="none"
            allowFontScaling={false}
          />
        </View>

        <View
          style={{
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flex: 1,
          }}>
          <View style={[styles.bottomButtonContainer, { width: '100%' }]}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleJoinHub}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <CustomText style={styles.continueButtonText}>Join</CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Toast ref={toastRef} />
    </ScreenView>
  );
};

export default JoinHubScreen;

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RfW(40),
  },
  logoContainer: {
    width: RfW(80),
    height: RfH(80),
    borderRadius: 60,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RfH(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rocketImage: { width: RfW(40), height: RfH(36), resizeMode: 'contain' },
  subTitle: {
    fontSize: normalize(16),
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: RfH(40),
    fontFamily: fonts.PoppinsLight,
  },
  getStartedButton: {
    backgroundColor: mainWhiteColor,
    paddingVertical: RfH(12),
    paddingHorizontal: RfW(70),
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: mainOrangeColor,
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsSemiBold,
  },
  container: { flex: 1, backgroundColor: mainWhiteColor },
  headerCurve: {
    backgroundColor: mainOrangeColor,
    height: RfH(120), // Approximate 20% of typical device height
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  formContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: RfW(18),
    paddingTop: RfH(50),
    marginTop: RfH(120), // Approximate 20% of device height
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: RfH(100),
  },
  astroImage: {
    width: RfW(143),
    height: RfH(143),
    resizeMode: 'contain',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: RfH(12),
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: RfH(15),
  },
  primaryButtonText: {
    color: mainWhiteColor,
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsSemiBold,
  },
  secondaryButton: {
    backgroundColor: mainWhiteColor,
    paddingVertical: RfH(12),
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: mainOrangeColor,
  },
  secondaryButtonText: {
    color: mainOrangeColor,
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsSemiBold,
  },
  helperText: {
    marginTop: RfH(20),
    color: DarkColor60,
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsLight,
  },
  createAccountLogoContainer: {
    width: RfW(100),
    height: RfH(100),
    borderRadius: 50,
    backgroundColor: '#E9F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  createAccountImage: { width: RfW(60), height: RfH(60), resizeMode: 'contain' },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: RfH(15),
    borderRadius: 8,
    width: '80%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: RfH(15),
  },
  methodIcon: { width: RfW(20), height: RfH(20), resizeMode: 'contain', marginRight: RfW(12) },
  methodButtonText: {
    color: '#666',
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
  },
  disclaimerText: {
    marginTop: RfH(20),
    color: DarkColor60,
    fontSize: normalize(10),
    textAlign: 'center',
    paddingHorizontal: RfW(20),
    fontFamily: fonts.PoppinsRegular,
  },
  formIconContainer: {
    width: RfW(75),
    height: RfH(75),
    borderRadius: 45,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  formIcon: { width: RfW(37), height: RfH(37), resizeMode: 'contain' },
  form: { width: '100%', paddingHorizontal: RfW(5) },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: RfW(4),
    marginBottom: RfH(20),
    marginTop: RfH(10),
  },
  typeButton: {
    flex: 1,
    paddingVertical: RfH(10),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeButton: {
    backgroundColor: mainWhiteColor,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtonText: {
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor60,
  },
  selectedTypeText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  inputLabel: {
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
    alignSelf: 'flex-start',
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
  RedtextStyle: {
    color: RedColor,
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsMedium,
  },
  workspaceOuterContainer: {
    flex: 1,
    marginTop: RfH(120),
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    width: '100%',
    padding: RfW(20),
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    marginBottom: RfH(20),
  },
  selectedCard: { borderColor: mainOrange80 },
  cardIcon: { width: RfW(40), height: RfH(40), resizeMode: 'contain', marginRight: RfW(15) },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    fontSize: normalize(16),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  cardSubtitle: {
    fontSize: normalize(10),
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginTop: RfH(2),
  },
  checkmarkIcon: {
    width: RfW(20),
    height: RfH(20),
    resizeMode: 'contain',
    position: 'absolute',
    top: RfH(10),
    right: RfW(10),
  },
  orText: {
    fontSize: normalize(16),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor60,
    marginVertical: RfH(5),
    marginTop: RfH(30),
  },
  joinButton: {
    width: '70%',
    paddingVertical: RfH(10),
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: mainOrangeColor,
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    marginBottom: RfH(20),
  },
  joinButtonText: {
    fontSize: normalize(16),
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  bottomButtonContainer: {
    paddingTop: RfH(10),
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: mainWhiteColor,
    padding: RfW(25),
    paddingTop: RfH(30),
    paddingBottom: RfH(40),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
});
