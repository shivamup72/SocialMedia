import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Linking,
  Clipboard,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fonts,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor,
  DarkCOlor30,
  DarkColor80,
  DarkColor60,
  mainOrange80,
  DarkColor20,
} from '../utils/style/fonts';
import {
  PostCreateWorkSpaceApi,
  GetWorkSpaceCode,
  PatchUserIDListingApi,
} from '../Api/config/HomeApi';
import BackArrowSvg from '../assets/svg/BackArrowSvg';
import CloseSvg from '../assets/svg/CloseSvg';
import Toast from '../Api/context/Toast';

// Import images
const GoogleImage = require('../assets/LoginAssets/png/devicon_google.png');
const RocketImage = require('../assets/LoginAssets/png/rocket_logo17.png');
const EmailFormIcon = require('../assets/LoginAssets/png/EmailSendImage.png');
const PerosnImage = require('../assets/LoginAssets/png/PersonalImage.png');
const WorkImage = require('../assets/LoginAssets/png/WorkImage.png');
const HubCreateImage = require('../assets/LoginAssets/png/HugCreatedImage.png');
const NullImageHub = require('../assets/LoginAssets/png/Null_image_Hub.png');
const SmsImage = require('../assets/LoginAssets/png/SMSimage.png');
const copyCodeImage = require('../assets/LoginAssets/png/CopyCodeImage.png');
const WhatsAppImage = require('../assets/LoginAssets/png/WhatsappImage.png');
const SelectContainer = require('../assets/Png/SelectedGroupMemberImage.png');
import AsyncStorage1 from '../Api/config/AsyncStorage';
import { useWebSocket } from '../Api/context/WebSocketServices';
import { connect } from 'react-redux';
import { useSettings } from '../Api/context/SettingsContext';
import CustomText from '../utils/CustomText';

import { normalize, RfH, RfW } from '../utils/helper';
import ScreenView from '../utils/ScreenView';

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
        fontSize: normalize(size),
        fontFamily: fonts.PoppinsSemiBold,
        color,
        marginBottom: RfH(marginBottom),
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
        fontSize: normalize(14),
        fontFamily: fonts.PoppinsLight,
        color,
        marginBottom: RfH(marginBottom),
        textAlign: align,
      },
      style,
    ]}>
    {children}
  </CustomText>
);

const CreateWorkSpaceScreen = React.memo(
  ({
    hubName,
    setHubName,
    HubLogo,
    setHubId,
    setIsLoading,
    navigateToStep,
    setHubData,
    companyName,
    setCompanyName,
  }) => {
    const { settings, SelectedMembers, updateSettings } = useSettings();

    const navigation = useNavigation();
    const handleContinue = async () => {
      try {
        if (!hubName || !hubName.trim()) {
          Alert.alert('Error', 'Please enter a Hub name.');
          return;
        }

        setIsLoading(true);
        const formData = new FormData();

        if (HubLogo) {
          formData.append('logo', {
            uri: HubLogo.uri,
            type: HubLogo.type,
            name: HubLogo.fileName,
          });
        }
        formData.append('name', hubName.trim());
        formData.append('company_name', companyName.trim());
        formData.append('type', 'work');
        formData.append('domain', 'riggle');
        // formData.append('workspace_type', 'work');
        console.log('formData -=-=-=-=-=----->kkk', formData);
        const response = await PostCreateWorkSpaceApi(formData);
        console.log('response -=-=-=-=-=----->', response);

        // console.log('slk sk de   -=--==->', response, '\n', '\n');
        setHubData(response);
        const newHubId = response?.data?.workspace_id;
        setHubId(newHubId);
        await AsyncStorage1.setItem('HubId', JSON.stringify(newHubId));
        updateSettings({
          newSettings: null,
          newSelectedMembers: null,
          newHubId: newHubId,
        });
        await AsyncStorage1.setItem('HubName', JSON.stringify(hubName));
        connect();
        navigateToStep(3);
      } catch (error) {
        console.error('Error creating workspace:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to create Hub. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
        <View style={styles.headerCurve} />
        <View style={styles.workspaceOuterContainer}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: RfW(25),
              paddingTop: RfH(50),
              paddingBottom: RfH(20),
            }}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  maxWidth: RfW(500),
                  alignItems: 'center',
                  marginBottom: RfH(10),
                  position: 'relative',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    position: 'absolute',
                    left: RfW(0),
                    top: RfH(0),
                    bottom: RfH(0),
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                      padding: RfW(15),
                      marginLeft: RfW(5),
                    }}
                    activeOpacity={0.7}>
                    <BackArrowSvg />
                  </TouchableOpacity>
                </View>
                <SectionTitle
                  style={{
                    textAlign: 'center',
                    lineHeight: RfH(24),
                    paddingLeft: RfW(50),
                    paddingRight: RfW(40),
                    paddingTop: RfH(20),
                  }}>
                  Almost there!
                </SectionTitle>
              </View>

              <Subtitle>Complete the setup to get started.</Subtitle>

              <CustomText style={styles.inputLabel}>Name</CustomText>
              <TextInput
                style={styles.textInput}
                value={hubName}
                onChangeText={setHubName}
                placeholder="Enter name"
                accessibilityLabel="Hub name input"
                accessibilityHint="Enter your hub name"
                maxLength={18}
                placeholderTextColor={DarkCOlor30}
                allowFontScaling={false}
              />

              <CustomText style={styles.inputLabel}>Company Name</CustomText>
              <TextInput
                style={styles.textInput}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Enter Company name"
                accessibilityLabel="Company name input"
                accessibilityHint="Enter your company name"
                maxLength={18}
                placeholderTextColor={DarkCOlor30}
                allowFontScaling={false}
              />

              <View style={[styles.bottomButtonContainer, { width: '100%' }]}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}>
                  <CustomText style={styles.continueButtonText}>Continue</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  },
);

const SuccessScreen = ({
  hubData,
  code,
  handleCopyLink,
  handleShareOperation,
  handleSkipForNow,
}) => {
  const [displayCode, setDisplayCode] = useState(code);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = new FormData();
        formData.append('workspace_id', hubData?.data?.workspace_id);
        const response = await GetWorkSpaceCode(formData);
        setDisplayCode(response?.data?.code);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (hubData?.data?.workspace_id) {
      fetchData();
    }
  }, [hubData]);

  return (
    <ScreenView>
      <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
      <View style={styles.headerCurve} />
      <ScrollView
        contentContainerStyle={styles.formContentContainer}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.formIconContainer, { marginBottom: RfH(20) }]}>
          <Image source={HubCreateImage} style={styles.formIcon} />
        </View>

        <SectionTitle>All set!</SectionTitle>

        <View>
          <CustomText
            style={{
              color: DarkColor,
              fontSize: normalize(14),
              fontFamily: fonts.PoppinsMedium,
              marginBottom: RfH(10),
            }}>
            Ready to invite crew?
          </CustomText>

          <CustomText
            style={{
              color: mainOrangeColor,
              fontSize: normalize(14),
              fontFamily: fonts.PoppinsMedium,
              textAlign: 'center',
              marginBottom: RfH(10),
            }}>
            Invite code: {displayCode ?? 'Loading...'}
          </CustomText>

          <View style={{ flexDirection: 'row', marginBottom: RfH(15), marginTop: RfH(10) }}>
            <TouchableOpacity
              style={{
                borderColor: mainOrangeColor,
                borderWidth: 1,
                padding: RfW(20),
                paddingVertical: RfH(6),
                marginRight: RfW(15),
                borderRadius: 6,
              }}
              onPress={() => {
                handleCopyLink(displayCode);
              }}>
              <CustomText
                style={{
                  color: mainOrangeColor,
                  fontSize: normalize(12),
                  fontFamily: fonts.PoppinsRegular,
                }}>
                Copy
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderColor: mainOrangeColor,
                borderWidth: 1,
                padding: RfW(20),
                paddingVertical: RfH(6),
                borderRadius: 6,
              }}
              onPress={() => {
                handleShareOperation(displayCode);
              }}>
              <CustomText
                style={{
                  color: mainOrangeColor,
                  fontSize: normalize(12),
                  fontFamily: fonts.PoppinsRegular,
                }}>
                Share
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSkipForNow}>
            <CustomText style={styles.continueButtonText}>GO TO DASHBOARD</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView >
    </ScreenView >
  );
};

const CreateHubScreen = ({ type, route }) => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('Personal');
  const [hubName, setHubName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [organizations, setOrganizations] = useState([
    { id: Date.now(), name: '' },
  ]);
  const toastRef = useRef(null);

  const [HubLogo, setHubLogo] = useState(null);
  const [hubId, setHubId] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([1]);
  const [organizationName, setOrganizationName] = useState('');
  const [HubData, setHubData] = useState([]);
  const [Code, setCode] = useState(null);

  const { connect, reconnect } = useWebSocket();

  const navigateToStep = useCallback(step => {
    setHistory(prevHistory => {
      if (prevHistory[prevHistory.length - 1] === step) {
        return prevHistory;
      }
      return [...prevHistory, step];
    });
    setCurrentStep(step);
  }, []);

  const handleSkipForNow = useCallback(async () => {
    if (route?.params?.type === 'login') {
      await AsyncStorage1.setItem('isLoggedIn', 'true');
      const UserLogin = await AsyncStorage1.getItem('userLoginResponse');
      const first_name = await AsyncStorage1.getItem('first_name');
      const last_name = await AsyncStorage1.getItem('last_name');
      const DOB = await AsyncStorage1.getItem('dob');
      const PostData = new FormData();
      PostData.append('first_name', first_name);
      PostData.append('last_name', last_name);
      PostData.append('dob', DOB);

      await PatchUserIDListingApi(UserLogin?.data?.user?.id, PostData);
      // console.log('respons1 -=-=-=-=-=----->', respons1, '\n', '\n', '\n');
      connect();
      navigation.replace('Home');
    } else {
      reconnect();
      setTimeout(() => {
        navigation.navigate('Home');
      }, 100);
    }
  }, [navigation]);

  const handleCopyLink = async pin => {
    try {
      await Clipboard?.setString(pin);
      toastRef.current.show({
        type: 'success',
        message: `${pin} copied.`,
      });
    } catch (err) {
      console.log(' get all the data --=----->', err);
    }
  };

  const handleShareOperation = async pin => {
    try {
      const shareMessage = pin;

      // 3. Use the React Native Share API
      const result = await Share.share({
        message: shareMessage,
        title: 'Join my Riggle Hub',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Content shared successfully');
        }
      } else {
        Alert.alert(
          'Error',
          'Could not retrieve a shareable code. Please try again.',
        );
      }
    } catch (err) {
      console.log('Share Error:', err);
      Alert.alert(
        'An error occurred',
        'Failed to share the code. Please check your connection and try again.',
      );
    }
  };

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <CreateWorkSpaceScreen
            hubName={hubName}
            companyName={companyName}
            setHubName={setHubName}
            setCompanyName={setCompanyName}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            organizations={organizations}
            HubLogo={HubLogo}
            setHubId={setHubId}
            setIsLoading={setIsLoading}
            navigateToStep={navigateToStep}
            setHubData={setHubData}
          />
        );
      case 3:
        return (
          <SuccessScreen
            hubData={HubData}
            code={Code}
            setCode={setCode}
            handleCopyLink={handleCopyLink}
            handleShareOperation={handleShareOperation}
            handleSkipForNow={handleSkipForNow}
          />
        );
      default:
        return (
          <CreateWorkSpaceScreen
            hubName={hubName}
            setHubName={setHubName}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            organizations={organizations}
            HubLogo={HubLogo}
            setHubId={setHubId}
            setIsLoading={setIsLoading}
            navigateToStep={navigateToStep}
            navigation={navigation}
          />
        );
    }
  }, [
    currentStep,
    hubName,
    selectedType,
    organizations,
    HubLogo,
    HubData,
    Code,
    handleCopyLink,
    handleShareOperation,
    handleSkipForNow,
    navigateToStep,
    navigation,
  ]);

  return (
    <>
      {renderCurrentStep()}
      <Toast ref={toastRef} />
    </>
  );
};

export default CreateHubScreen;

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rocketImage: { width: 40, height: 36, resizeMode: 'contain' },
  subTitle: {
    fontSize: 16,
    color: mainWhiteColor,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: fonts.PoppinsLight,
  },
  getStartedButton: {
    backgroundColor: mainWhiteColor,
    paddingVertical: 12,
    paddingHorizontal: 70,
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: mainOrangeColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  container: { flex: 1, backgroundColor: mainWhiteColor },
  headerCurve: {
    backgroundColor: mainOrangeColor,
    height: '20%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  formContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 50,
    marginTop: '20%',
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: 100,
  },
  astroImage: {
    width: 143,
    height: 143,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: 12,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: mainWhiteColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  secondaryButton: {
    backgroundColor: mainWhiteColor,
    paddingVertical: 12,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: mainOrangeColor,
  },
  secondaryButtonText: {
    color: mainOrangeColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  helperText: {
    marginTop: 20,
    color: DarkColor60,
    fontSize: 12,
    fontFamily: fonts.PoppinsLight,
  },
  createAccountLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E9F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  createAccountImage: { width: 60, height: 60, resizeMode: 'contain' },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mainWhiteColor,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  methodIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 12 },
  methodButtonText: {
    color: DarkColor80,
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
  },
  disclaimerText: {
    marginTop: 20,
    color: DarkColor60,
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: fonts.PoppinsRegular,
  },
  formIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 45,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  formIcon: { width: 37, height: 37, resizeMode: 'contain' },
  form: { width: '100%', paddingHorizontal: 5 },
  inputLabel: {
    fontSize: 12,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    width: '100%',
    marginBottom: 20,
    color: DarkColor,
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
  RedtextStyle: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
  },
  workspaceOuterContainer: {
    flex: 1,
    marginTop: '20%',
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    width: '100%',
    padding: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    marginBottom: 20,
  },
  selectedCard: { borderColor: mainOrange80 },
  cardIcon: { width: 40, height: 40, resizeMode: 'contain', marginRight: 15 },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  imageUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DarkColor20,
    borderStyle: 'dashed',
  },
  hubImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  uploadText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: mainOrangeColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addMoreText: {
    color: mainOrangeColor,
    fontSize: 16,
    marginRight: 8,
  },
  addMoreLabel: {
    color: mainOrangeColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
  },
  cardSubtitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginTop: 2,
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  orText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor60,
    marginVertical: 5,
    marginTop: 30,
  },
  joinButton: {
    width: '70%',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: mainOrangeColor,
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    marginBottom: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: mainOrangeColor,
  },
  bottomButtonContainer: {
    paddingTop: 10,
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
    padding: 25,
    paddingTop: 30,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  hubInfoContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6B0',
    padding: 24,
    marginBottom: 24,
  },
  hubLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  hubLogoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  hubLogoPlaceholderText: {
    color: DarkColor60,
    fontSize: 48,
    fontFamily: fonts.PoppinsBold,
  },
  hubNameText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 18,
    color: DarkColor,
    marginBottom: 4,
    textAlign: 'center',
  },
  hubTypeContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hubTypeText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 12,
    color: DarkColor60,
    textTransform: 'capitalize',
  },
  shareTitle: {
    alignSelf: 'flex-start',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    color: DarkColor,
    marginBottom: 16,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  shareIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  shareText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    color: DarkColor60,
  },
});
