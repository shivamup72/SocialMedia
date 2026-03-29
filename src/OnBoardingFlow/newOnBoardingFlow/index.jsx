import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Linking,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StatusBar,
  FlatList,
  BackHandler,
  Pressable,
} from 'react-native';
import {
  fonts,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor80,
  DarkColor,
  DarkColor50,
  DarkColor20,
  DarkColor60,
  dullBlack,
  DarkColor90,
  DarkCOlor30,
  mainOrange25,
} from '../../utils/style/fonts';
import { useAuth } from '../../Api/context/AuthContext';
import Toast from '../../Api/context/Toast';
import { useDispatch } from 'react-redux';
const RiggleXLogo = require('../../assets/newOnBoardingAssests/png/splashlogo.webp');
const AstroLogo = require('../../assets/newOnBoardingAssests/png/AstronotLogo.png');
const AuthBackImage = require('../../assets/Png/riggleImage.png');
const EmailImage = require('../../assets/LoginAssets/png/EmailImage.png');
const GoogleImage = require('../../assets/LoginAssets/png/devicon_google.png');
const RocketImageIcon = require('../../assets/newOnBoardingAssests/png/rocketLogoIcon.png');
const CreateHubImage = require('../../assets/Png/CreateHubIcon.png');
import AsyncStorage1 from '../../Api/config/AsyncStorage';
const RocketImage = require('../../assets/LoginAssets/png/rocket_logo17.png');
import DateTimePicker from '@react-native-community/datetimepicker';
import CreateHubScreen from '../CreateHubScreen';
import CheckBox from 'react-native-check-box';
import {
  PostCreateWorkSpaceApi,
  GetWorkSpaceCode,
  GetCreateWorkSpaceApi,
  PostJoinHubByCodeApi,
  PatchUserDetailsapi,
} from '../../Api/config/HomeApi';
import { loginUser } from '../../Api/config/auth';
import { Base_url } from '../../Api/config/apiUrls';
// import AsyncStorage1 from '../../config/AsyncStorage';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import CloseSvg from '../../assets/svg/CloseSvg';
import { setAuthenticated, setLoginData } from '../../redux/slices/authSlice';
import JoinHubScreen from '../JoinHubScreen';
// import {useAuth} from '../../context/AuthContext';
const { height } = Dimensions.get('window');
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { FormatYYYYMMDDToDDMMYYYYY } from '../../utils/CommonUtils';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import CustomText from '../../utils/CustomText';
import { normalize, RfH, RfW } from '../../utils/helper';
import ScreenView from '../../utils/ScreenView';
import { useSettings } from '../../Api/context/SettingsContext.js';
import LinearGradient from 'react-native-linear-gradient';

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

const AuthOptionButton = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.authButtonContainer} onPress={onPress}>
    <Image source={icon} style={styles.authButtonIcon} />
    <CustomText style={styles.authButtonText}>{title}</CustomText>
  </TouchableOpacity>
);

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  labelColor,
  editable = true,
  ...rest
}) => (
  <View style={styles.inputContainer}>
    <CustomText
      style={[
        styles.inputLabel,
        labelColor ? { color: labelColor } : null,
      ]}
    >
      {label}
    </CustomText>

    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={DarkColor50}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      secureTextEntry={secureTextEntry}
      allowFontScaling={false}
      editable={editable}
      maxLength={
        keyboardType === 'number-pad' ||
          keyboardType === 'numeric' ||
          keyboardType === 'phone-pad'
          ? 10
          : undefined
      }
      {...rest}
    />
  </View>
);

const BottomSheet = ({ children }) => (
  <View style={styles.bottomSheetContainer}>
    <View style={styles.bottomSheetHandle} />
    {children}
  </View>
);

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.welcomeContent}>
        <View style={styles.riggleLogo} >
          <Image source={RiggleXLogo}
            style={{ height: '100%', width: '100%', resizeMode: 'contain' }} />
        </View>
        <CustomText style={styles.title}>Riggle X</CustomText>
        <CustomText style={styles.subtitle}>
          Your companion for seamless collaboration
        </CustomText>
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
          <CustomText style={styles.getStartedButtonText}>
            Get Started
          </CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const LoginOptionsScreen = ({
  onSelectEmail,
  toastRef,
  // isChecked,
  // setIsChecked,
  setHubData,
  setCurrentScreen,
  navigation,
}) => {
  const [AuthStatus, setAuthStatus] = useState('');
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleGoogleLogin = async () => {
    // if (!isChecked) {
    //   toastRef.current.show({
    //     type: 'error',
    //     message: 'Please accept the terms and conditions.',
    //   });
    //   return;
    // }
    try {
      const result = await signInWithGoogle(AuthStatus);
      if (result?.success && result?.shouldNavigate) {
        console.log('result --==---->', JSON.stringify(result?.data));
        // connect();
        if (result?.data?.data?.workspace_exists) {
          setHubData(result?.data?.data?.workspaces);
          navigation.navigate('HubListingScreen');
        } else {
          navigation.navigate('JoinOrCreateHubScreen');
        }
      }
    } catch (err) {
      console.log('error in handleGoogleLogin =====> ', err);
    }
  };

  const handleAppleLogin = async () => {
    // if (!isChecked) {
    //   toastRef.current.show({
    //     type: 'error',
    //     message: 'Please accept the terms and conditions',
    //   });
    //   return;
    // }
    try {
      // console.log('handleAppleSignUp --==---->', JSON.stringify(AuthStatus));
      const result = await signInWithApple(AuthStatus);
      if (result?.success && result?.shouldNavigate) {
        // console.log('result --==---->', JSON.stringify(result?.data));
        // connect();
        if (result?.data?.data?.workspace_exists) {
          // console.log('page 8 --==---->');
          setHubData(result?.data?.data?.workspaces);
          // setCurrentScreen('HubLstingScreen');
          navigation.navigate('HubListingScreen');
        } else {
          console.log('page 5 --==---->');
          navigation.navigate('JoinOrCreateHubScreen');
        }
      }
      // const result = await signInWithApple(AuthStatus);
    } catch (err) {
      console.log('error in handleAppleLogin =====> ', err);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screenContainer, { backgroundColor: mainWhiteColor }]}>
      <Image source={AstroLogo} style={styles.astroLogoCentered} />
      <BottomSheet>
        <CustomText style={styles.bottomSheetTitle}>Welcome</CustomText>
        <CustomText style={styles.bottomSheetSubtitle}>
          Choose your preferred login method
        </CustomText>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.methodButton1}
            onPress={handleAppleLogin}>
            <View style={styles.methodButtonIconWrapper}>
              <Image
                source={require('../../assets/Png/App_Image_Logo.png')}
                style={styles.methodButtonIcon}
              />
            </View>
            <View>
              <CustomText allowFontScaling={false} style={styles.methodButtonText}>
                Continue with Apple
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
        {/* <AuthOptionButton
          title="Continue with Google"
          icon={GoogleImage}
          onPress={handleGoogleLogin}
        /> */}
        <AuthOptionButton
          title="Continue with email"
          icon={EmailImage}
          onPress={onSelectEmail}
        />
        <View style={{ alignItems: 'center', marginVertical: 0 }}>
          <CustomText
            style={{
              color: mainWhiteColor,
              fontFamily: fonts.PoppinsRegular,
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 16,
            }}
          >
            By continuing, you agree to our{'\n'}
            <CustomText
              style={{
                color: mainWhiteColor,
                fontFamily: fonts.PoppinsRegular,
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 16,
              }}
              onPress={() => Linking.openURL('https://your-terms-url')}
            >
              Terms of Service
            </CustomText>
            {' '}and{' '}
            <CustomText
              style={{
                color: mainWhiteColor,
                fontFamily: fonts.PoppinsRegular,
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 16,
              }}
              onPress={() => Linking.openURL('https://your-privacy-url')}
            >
              Privacy Policy
            </CustomText>
          </CustomText>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const SignUpScreen = ({
  onLoginMethod,
  toastRef,
  email,
  name,
  dob,
  setEmail,
  setName,
  setDob,
  setIs_new_user,
  is_new_user,
  IsexistUser,
  showDatePicker,
  setShowDatePicker,
  Data,
  handleInternalStore,
  setCurrentScreen,
  navigation,
  dispatch
}) => {
  const [timer, setTimer] = useState(20);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [joining_code, setJoining_code] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otpSent, setOtpSent] = useState(false); // <-- NEW STATE
  // Workspace selection bottomsheet state
  const [workspaceSheetVisible, setWorkspaceSheetVisible] = useState(false);
  // const [workspaceList, setWorkspaceList] = useState([]);
  const { connect } = useWebSocket();
  const { settings, SelectedMembers, updateSettings, HubId } = useSettings();
  useEffect(() => {
    let interval;
    if (showOtpInput && isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, isResendDisabled, timer]);
  // Handler to send OTP (call /users/auth/send_otp/)
  const handleSendOtp = async () => {
    if (!email || email.trim() === '') {
      toastRef.current?.show?.({
        type: 'error',
        message: 'Please enter your email.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      toastRef.current?.show?.({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: normalizedEmail,
        login_type: 'email_verify',
      };

      const response = await fetch(`${Base_url}users/auth/send_otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.success) {
        setOtpSent(true);
        setShowOtpInput(true);
        toastRef.current?.show?.({
          type: 'success',
          message: data?.message,
        });
      } else {
        toastRef.current?.show?.({
          type: 'error',
          message: data?.message,
        });
      }
    } catch (e) {
      toastRef.current?.show?.({
        type: 'error',
        message: e?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler to verify OTP (with real API logic)
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim() === '') {
      toastRef.current?.show?.({
        type: 'error',
        message: 'Please enter the verification code.',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        login_type: 'email_verify',
        verification_code: otpCode,
        joining_code: joining_code?.trim() || undefined,
      };

      const res = await loginUser(payload);
      console.log('OTP Verify Response:', JSON.stringify(res));

      if (!res?.success) {
        toastRef.current?.show?.({
          type: 'error',
          message: res?.message || 'OTP verification failed.',
        });
        return;
      }

      /** ---------------- STORE TOKENS ---------------- */
      const accessToken = res?.data?.tokens?.access?.token;
      if (accessToken) {
        await AsyncStorage1.setItem('token', accessToken);
        await AsyncStorage1.setItem('sessionId', accessToken);
      }
      await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(res));
      /** ---------------- USER FLAGS ---------------- */
      console.log(res?.data?.onboarding?.flow, "=================res after login api==================");
      const profileComplete = res?.data?.onboarding?.flow == null;
      const user = res?.data?.user;
      const onboarding = res?.data?.onboarding;
      const workspaces = res?.data?.workspaces || [];

      const isNewUser = user?.is_new_user === true;
      const isProfileIncomplete = user?.is_profile_complete === false;
      const flow = onboarding?.flow; // admin | member
      const shouldGoToProfile = isNewUser || isProfileIncomplete;
      /** ---------------- WORKSPACE HANDLING ---------------- */
      // If user has multiple workspaces or profile is complete, go to HubListingScreen
      if (workspaces.length > 1 || profileComplete) {
        setCurrentScreen('HubListingScreen');
        return;
      }

      if (workspaces.length === 1) {
        await AsyncStorage1.setItem('HubId', String(workspaces[0].id));
        await AsyncStorage1.setItem('HubName', String(workspaces[0].name));

        updateSettings({ newHubId: workspaces[0].id });
        connect();
      }

      /** ---------------- IMPORTANT FIX ----------------
       * Decide screen FIRST, authenticate AFTER
       */
      if (shouldGoToProfile) {
        setShowOtpInput(false);
        setOtpCode('');

        if (flow === 'member') {
          setCurrentScreen('MemberProfileSetupScreen');
        } else if (flow === 'admin') {
          setCurrentScreen('ProfileSetupScreen');
        } else {
          dispatch(setAuthenticated(true));
          await AsyncStorage1.setItem('isLoggedIn', 'true');
        }
        return; // 🚨 STOP HERE (no Home navigation)
      }

      /** ---------------- HOME FLOW ---------------- */
      // Otherwise, authenticate and continue to Home
      dispatch(setAuthenticated(true));
      await AsyncStorage1.setItem('isLoggedIn', 'true');

      setShowOtpInput(false);
      setOtpCode('');

      toastRef.current?.show?.({
        type: 'success',
        message: 'Login successful!',
      });

      connect();
      navigation.replace('Home');
    } catch (error) {
      console.log('OTP Verify Error:', error);
      toastRef.current?.show?.({
        type: 'error',
        message: error?.message || 'OTP verification failed.',
      });
    } finally {
      setLoading(false);
    }
  };
  // Handler to resend OTP (with real API logic)
  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    setTimer(20);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = { email: normalizedEmail, login_type: 'email_otp' };
      const res = await loginUser(data);
      console.log('OTP Resend Response:', JSON.stringify(res));
      if (!res?.success) {
        toastRef.current?.show?.({ type: 'error', message: res?.message || 'Failed to resend OTP.' });
      } else {
        setTimer(res?.data?.otp_rate_limit_window || 20);
        toastRef.current?.show?.({ type: 'success', message: 'OTP resent successfully.' });
      }
    } catch (e) {
      console.log('OTP Resend Error:', JSON.stringify(e));
      toastRef.current?.show?.({ type: 'error', message: e?.message || 'Failed to resend OTP.' });
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (!IsexistUser) setEmail(''); // Only clear if not existing user
      setCurrentScreen('login');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [setCurrentScreen, IsexistUser]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <View style={{ flex: 1, backgroundColor: mainWhiteColor }}>
        {/* Background Image */}
        <View style={[styles.riggBackImage, { alignSelf: 'flex-end' }]}>
          <Image
            source={AuthBackImage}
            style={{ height: '100%', width: '100%', left: RfH(30) }}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, justifyContent: 'center', height: '76%', position: 'absolute', bottom: RfH(0), width: '100%', }}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              <View
                style={{
                  paddingHorizontal: RfW(30),
                  paddingTop: RfH(40),
                }}
              >
                <CustomText style={styles.signupheading}>
                  Let's get started!
                </CustomText>
                <View style={{ width: '100%' }}>
                  <CustomTextInput
                    label="Email ID / Phone number"
                    placeholder="Enter email or phone"
                    value={email}
                    onChangeText={setEmail}
                    labelColor={DarkColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!otpSent}
                  />
                  {!otpSent && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: mainOrangeColor,
                        width: '80%',
                        alignItems: 'center',
                        borderRadius: 8,
                        justifyContent: 'center',
                        height: RfH(50),
                        marginTop: RfH(20),
                        alignSelf: 'center'
                      }}
                      onPress={handleSendOtp}
                      disabled={loading}
                    >
                      <CustomText style={{ color: mainWhiteColor, fontFamily: fonts.PoppinsSemiBold, fontSize: 14 }}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                      </CustomText>
                    </TouchableOpacity>
                  )}
                  {otpSent && (
                    <View style={{ width: '100%' }}>
                      <CustomText allowFontScaling={false} style={[styles.inputLabel, { color: DarkColor, marginBottom: RfH(8) }]}>Verification Code</CustomText>
                      <TextInput
                        allowFontScaling={false}
                        style={[styles.textInput, { marginBottom: RfH(8) }]}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="numeric"
                        maxLength={6}
                        secureTextEntry={true}
                        placeholder="Enter OTP"
                        placeholderTextColor={DarkColor50}
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: RfH(10), justifyContent: 'space-between' }}>
                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={isResendDisabled}
                        >
                          <CustomText
                            allowFontScaling={false}
                            style={[
                              styles.RedtextStyle,
                              isResendDisabled && styles.disabledText,
                              { marginRight: 12 }
                            ]}
                          >
                            Resend Code
                          </CustomText>
                        </TouchableOpacity>
                        {isResendDisabled && (
                          <CustomText allowFontScaling={false} style={styles.countdownText}>
                            00:{timer < 10 ? `0${timer}` : timer}
                          </CustomText>
                        )}
                      </View>
                      <Pressable style={{ marginBottom: RfH(10) }} onPress={() => setReferralCode(!referralCode)}>
                        <CustomText style={styles.referralText}>Have a joining code?</CustomText>
                      </Pressable>
                      {referralCode && (
                        <CustomTextInput
                          label="Joining Code"
                          placeholder="Enter"
                          value={joining_code}
                          onChangeText={setJoining_code}
                          labelColor={DarkColor}
                        />
                      )}
                    </View>
                  )}
                </View>
                <View style={{ alignItems: 'center' }}>
                  {otpSent && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: mainOrangeColor,
                        width: '80%',
                        alignItems: 'center',
                        borderRadius: 8,
                        justifyContent: 'center',
                        height: RfH(50),
                        marginTop: RfH(20),
                      }}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <CustomText
                          style={{
                            color: mainWhiteColor,
                            fontFamily: fonts.PoppinsSemiBold,
                            fontSize: 14,
                          }}>
                          Loading...
                        </CustomText>
                      ) : (
                        <CustomText
                          style={{
                            color: mainWhiteColor,
                            fontFamily: fonts.PoppinsSemiBold,
                            fontSize: 14,
                            lineHeight: RfH(20),
                          }}>
                          Continue
                        </CustomText>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* <View style={{ top: RfH(10), width: '60%' }}>
                    <CustomText style={styles.termsText1}>By continuing, you agree to our Terms of Service and Privacy Policy</CustomText>
                  </View> */}
                </View>
              </View>

            </ScrollView>
          </View>
          {/* <WorkspaceSelectionSheet
            visible={workspaceSheetVisible}
            workspaceList={workspaceList}
            onSelect={handleWorkspaceSelect}
            onClose={() => setWorkspaceSheetVisible(false)}
          /> */}

        </KeyboardAvoidingView>
        {/* Workspace selection bottomsheet */}
      </View>
    </SafeAreaView >
  );
};



// Profile Setup Screen (matches screenshot)

const ProfileSetupScreen = ({ navigation, dispatch, email }) => {
  const { connect } = useWebSocket();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  // Validation helpers
  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!organisationName.trim()) newErrors.organisationName = 'Organisation name is required.';
    if (!role.trim()) newErrors.role = 'Role is required.';
    if (phoneNumber.trim() && !/^\d{10,15}$/.test(phoneNumber.trim())) newErrors.phoneNumber = 'Enter a valid phone number.';
    return newErrors;
  };

  // API call for profile setup
  const handleProfileSetup = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organisation_name: organisationName.trim(),
        role: role.trim(),
      };
      if (phoneNumber.trim()) payload.phone_number = phoneNumber.trim();
      if (reportingManager.trim()) payload.reporting_manager = reportingManager.trim();
      let token = await AsyncStorage1.getItem('token');

      console.log('Token used in Authorization header:', token);
      const { SetupProfileApi, Base_url } = require('../../Api/config/apiUrls.jsx');
      const res = await fetch(SetupProfileApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      // Prefer workspace.name, fallback to workspaces[0]?.name
      const hubName = data?.data?.workspace?.name || data?.data?.workspaces?.[0]?.name || '';
      console.log(hubName, "------------------");

      await AsyncStorage1.setItem('HubName', String(hubName));

      console.log('Profile setup response:', JSON.stringify(data));
      if (!res.ok) {
        Alert.alert('Error Profile setup', data?.message || 'Profile setup failed.');
      } else {
        if (data?.data?.workspace?.id) {
          const wid = String(data.data.workspace.id);
          await AsyncStorage1.setItem('workspace_id', wid);
          await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(data));
        }
        dispatch(setAuthenticated(true));
        await AsyncStorage1.setItem('isLoggedIn', 'true');
        connect();
        navigation.replace('Home', { flag: 'fromProfileSetup' });
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Profile setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text) => {
    if (text && !/^[6-9]/.test(text)) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: 'Phone number must start from 6 to 9',
      }));

    } else {
      setErrors(prev => ({
        ...prev,
        phoneNumber: '',
      }));
    }

    // allow only numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <View style={[styles.riggBackImage2, { alignSelf: 'flex-end' }]}>
        <Image source={AuthBackImage} style={{ height: '100%', width: '100%', left: RfH(24) }} resizeMode="contain" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          // keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: RfW(30),
            paddingTop: RfH(80),
            paddingBottom: RfH(20),
          }}
        >
          <CustomText style={{
            fontSize: 24,
            fontFamily: fonts.PoppinsSemiBold,
            color: DarkColor,
            marginBottom: RfH(10),
            marginTop: RfH(10),
          }}>
            Set Up Your Profile
          </CustomText>
          <CustomTextInput
            label="Email ID"
            value={email}
            labelColor={DarkColor80}
            editable={false}
            style={[styles.inputField, { color: DarkColor50 }]}

          />
          <CustomTextInput
            label="Phone Number (optional)"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            labelColor={DarkColor}
            keyboardType="phone-pad"
          />

          {errors.phoneNumber && (
            <CustomText style={styles.errormsg}>
              {errors.phoneNumber}
            </CustomText>
          )}
          <CustomTextInput
            label="First Name*"
            value={firstName}
            onChangeText={setFirstName}
            labelColor={DarkColor}
          />
          {errors.firstName && <CustomText style={styles.errormsg}>{errors.firstName}</CustomText>}
          <CustomTextInput
            label="Last Name*"
            value={lastName}
            onChangeText={setLastName}
            labelColor={DarkColor}
          />
          {errors.lastName && <CustomText style={styles.errormsg}>{errors.lastName}</CustomText>}
          <CustomTextInput
            label="Organisation Name*"
            value={organisationName}
            onChangeText={setOrganisationName}
            labelColor={DarkColor}
          />
          {errors.organisationName && <CustomText style={styles.errormsg}>{errors.organisationName}</CustomText>}
          <CustomTextInput
            label="Your Role*"
            value={role}
            onChangeText={setRole}
            labelColor={DarkColor}
          />
          {errors.role && <CustomText style={styles.errormsg}>{errors.role}</CustomText>}

          <CustomTextInput
            label="Reporting Manager"
            value={reportingManager}
            onChangeText={setReportingManager}
            labelColor={DarkColor}
          />
          {errors.reportingManager && <CustomText style={styles.errormsg}>{errors.reportingManager}</CustomText>}
          <TouchableOpacity
            style={{
              backgroundColor: mainOrangeColor,
              width: '100%',
              alignItems: 'center',
              borderRadius: 8,
              justifyContent: 'center',
              height: 48,
              marginTop: RfH(16),
              marginBottom: RfH(8),
            }}
            onPress={handleProfileSetup}
            disabled={loading}
          >
            <CustomText
              style={{
                color: mainWhiteColor,
                fontFamily: fonts.PoppinsSemiBold,
                fontSize: 16,
              }}>
              {loading ? 'Saving...' : 'Lets Go'}
            </CustomText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


// Member Profile Setup Screen (matches screenshot)

const MemberProfileSetupScreen = ({ navigation, dispatch, email }) => {
  const { connect } = useWebSocket();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // yyyy-mm-dd for backend
  const [dobDisplay, setDobDisplay] = useState(''); // dd-mm-yyyy for UI
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [role, setRole] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toastRef = useRef(null);

  // Validation helpers
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!dob.trim()) newErrors.dob = 'Date of birth is required.';
    else {
      // Check if dob is not in the future
      const today = new Date();
      const dobDate = new Date(dob);
      if (dobDate > today) newErrors.dob = 'Date of birth cannot be in the future.';
    }
    if (!organisationName.trim()) newErrors.organisationName = 'Organisation name is required.';
    if (!role.trim()) newErrors.role = 'Role is required.';
    if (phoneNumber.trim() && !/^\d{10,15}$/.test(phoneNumber.trim())) newErrors.phoneNumber = 'Enter a valid phone number.';
    return newErrors;
  };

  // API call for profile setup
  const handleMemberProfileSetup = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      // Split name into first_name and last_name for UI, but send as name in payload
      const payload = {
        name: name.trim(),
        date_of_birth: dob.trim(), // yyyy-mm-dd for backend
        organisation_name: organisationName.trim(),
        role: role.trim(),
      };
      if (phoneNumber.trim()) payload.phone_number = phoneNumber.trim();
      if (reportingManager.trim()) payload.reporting_manager = reportingManager.trim();
      let token = await AsyncStorage1.getItem('token');
      if (token && typeof token === 'object' && token.token) {
        token = token.token;
      }
      if (typeof token !== 'string') {
        token = String(token || '');
      }
      console.log('Token used in Authorization header:', token);
      // Use the correct endpoint for join-team
      const joinTeamApi = require('../../Api/config/apiUrls.jsx').getApiURL1('users/auth/join-team/');
      const res = await fetch(joinTeamApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      // Prefer workspace.name, fallback to workspaces[0]?.name
      const hubName = data?.data?.workspace?.name || data?.data?.workspaces?.[0]?.name || '';
      console.log(hubName, "------------------");

      await AsyncStorage1.setItem('HubName', String(hubName));
      console.log('Team Profile setup response:', data);
      if (!res.ok) {
        Alert.alert('Error Team Profile', data?.message || 'Profile setup failed.');
      } else {
        // Store workspace id in AsyncStorage1 if present
        if (data?.data?.workspace?.id) {
          const wid = String(data.data.workspace.id);
          await AsyncStorage1.setItem('workspace_id', wid);
          await AsyncStorage1.setItem('HubId', wid); // Store as plain string, not JSON
          await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(data));
        }
        // Fallback: if HubId is missing, set it from workspace_id
        let hubId = await AsyncStorage1.getItem('HubId');
        if (!hubId) {
          const wid = await AsyncStorage1.getItem('workspace_id');
          if (wid) await AsyncStorage1.setItem('HubId', wid);
        }
        dispatch(setAuthenticated(true));
        await AsyncStorage1.setItem('isLoggedIn', 'true');
        // Alert.alert('Success', 'Profile setup complete!');
        connect();
        navigation.replace('Home');
      }
    } catch (e) {
      Alert.alert('Error Team Profilemklm', e?.message || 'Profile setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text) => {
    if (text && !/^[6-9]/.test(text)) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: 'Phone number must start from 6 to 9',
      }));

    } else {
      setErrors(prev => ({
        ...prev,
        phoneNumber: '',
      }));
    }

    // allow only numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
      <View style={[styles.riggBackImage2, { alignSelf: 'flex-end' }]}>
        <Image source={AuthBackImage} style={{ height: '100%', width: '100%', left: RfH(24) }} resizeMode="contain" />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: RfW(30),
            paddingTop: RfH(80),
            paddingBottom: RfH(20),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CustomText style={{
            fontSize: 24,
            fontFamily: fonts.PoppinsSemiBold,
            color: DarkColor,
            marginBottom: RfH(10),
            marginTop: RfH(10),
          }}>
            Join your Team
          </CustomText>
          <CustomTextInput
            label="Email ID"
            value={email}
            labelColor={DarkColor80}
            editable={false}
          />
          <CustomTextInput
            label="Phone Number(optional)"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            labelColor={DarkColor}
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && (
            <CustomText style={styles.errormsg}>
              {errors.phoneNumber}
            </CustomText>
          )}
          <CustomTextInput
            label="Name"
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            labelColor={DarkColor}
          />
          {errors.name && <CustomText style={styles.errormsg}>{errors.name}</CustomText>}
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.8}
          >
            <View pointerEvents="none">
              <CustomTextInput
                label="Date of Birth"
                placeholder="dd-mm-yyyy"
                value={dobDisplay}
                onChangeText={() => { }}
                labelColor={DarkColor}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          {errors.dob && <CustomText style={styles.errormsg}>{errors.dob}</CustomText>}
          {showCalendar && (
            <DateTimePicker
              value={calendarDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowCalendar(false);
                if (selectedDate) {
                  setCalendarDate(selectedDate);
                  // Format as yyyy-mm-dd for backend
                  const yyyy = selectedDate.getFullYear();
                  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(selectedDate.getDate()).padStart(2, '0');
                  setDob(`${yyyy}-${mm}-${dd}`);
                  setDobDisplay(`${dd}-${mm}-${yyyy}`);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          <CustomTextInput
            label="Organisation Name"
            placeholder="Khokhar Flour Mills"
            value={organisationName}
            onChangeText={setOrganisationName}
            labelColor={DarkColor}
          />
          {errors.organisationName && <CustomText style={styles.errormsg}>{errors.organisationName}</CustomText>}
          <CustomTextInput
            label="Your Role"
            placeholder="Enter name"
            value={role}
            onChangeText={setRole}
            labelColor={DarkColor}
          />
          {errors.role && <CustomText style={styles.errormsg}>{errors.role}</CustomText>}
          <CustomTextInput
            label="Reporting Manager"
            placeholder="Enter name"
            value={reportingManager}
            onChangeText={setReportingManager}
            labelColor={DarkColor}
          />
          {errors.reportingManager && <CustomText style={styles.errormsg}>{errors.reportingManager}</CustomText>}
          <TouchableOpacity
            style={{
              backgroundColor: mainOrangeColor,
              width: '100%',
              alignItems: 'center',
              borderRadius: 8,
              justifyContent: 'center',
              height: 48,
              marginTop: RfH(16),
              marginBottom: RfH(8),
            }}
            onPress={handleMemberProfileSetup}
            disabled={loading}
          >
            <CustomText
              style={{
                color: mainWhiteColor,
                fontFamily: fonts.PoppinsSemiBold,
                fontSize: 16,
              }}>
              {loading ? 'Saving...' : 'Lets Go'}
            </CustomText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const JoinOrCreateHubScreen = ({ onJoinPress, onCreatePress }) => {
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
        <TouchableOpacity style={styles.joinButton} onPress={onJoinPress}>
          <CustomText style={styles.joinButtonText}>Join a Hub</CustomText>
        </TouchableOpacity>
        <CustomText style={styles.joinOrText}>or</CustomText>
        <TouchableOpacity style={styles.joinButton} onPress={onCreatePress}>
          <CustomText style={styles.joinButtonText}>Create a Hub</CustomText>
        </TouchableOpacity>
      </View>
    </ScreenView>
  );
};

const GradientLoader = () => {
  // Skeleton loader styled like hub list items
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: mainWhiteColor,
      // borderRadius: 5,
      // padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      width: '100%',
    }}>
      {[...Array(2)].map((_, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 5, padding: 12, paddingVertical: 10, marginBottom: 12, width: '100%', opacity: 0.7 }}>
          <View style={{ width: RfW(40), height: RfH(40), borderRadius: 35, backgroundColor: '#e0e0e0', marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <View style={{ width: '60%', height: 16, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: '40%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const HubListingScreen = ({
  HubData,
  setHubData,
  handleSkipForNow,
  setCurrentScreen,
  dispatch,
  navigation,
}) => {
  const { connect, } = useWebSocket();
  const { updateSettings, } = useSettings();
  const [hubList1, setHubList1] = useState([]);
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   const FetchData = async () => {
  //     try {
  //       const res = await GetCreateWorkSpaceApi({});

  //       console.log('res Hub Listing', JSON.stringify(res));
  //       setHubList1(res?.results);
  //     } catch (error) {
  //       console.log('error Hub Listing', error);
  //     }
  //   };

  //   FetchData();
  // }, []);
  useEffect(() => {
    const FetchData = async () => {
      try {
        setLoading(true);
        const res = await GetCreateWorkSpaceApi({});
        console.log('res Hub Listing', JSON.stringify(res));
        setHubList1(res?.results);
      } catch (error) {
        console.log('error Hub Listing', error);
      } finally {
        setLoading(false);
      }
    };

    FetchData();
  }, []);

  const renderHubItem = ({ item }) => {
    if (loading) {
      return <GradientLoader />;
    }

    return (
      <TouchableOpacity
        style={{
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
        }}
        onPress={async () => {
          await AsyncStorage1.setItem('HubId', JSON.stringify(item.id));
          // await AsyncStorage1.setItem('HubName', JSON.stringify(item.name));

          dispatch(setAuthenticated(true));

          updateSettings({
            newHubId: item.id,
          });

          connect();

          await AsyncStorage1.setItem('isLoggedIn', 'true');

          navigation.replace('Home');
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: DarkColor60,
            borderRadius: 35,
            marginRight: 16,
          }}
        >
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
            }}
          >
            <CustomText
              style={{
                fontFamily: fonts.PoppinsSemiBold,
                fontSize: 12,
                color: DarkColor,
              }}
            >
              {item?.name}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenView>
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
          // ListFooterComponent={
          //   <View style={{ marginVertical: 10 }}>
          //     <CustomText
          //       style={{
          //         color: DarkColor,
          //         fontSize: 12,
          //         fontFamily: fonts.PoppinsMedium,
          //       }}>
          //       Not the hub you're looking for?
          //     </CustomText>

          //     <TouchableOpacity
          //       style={{
          //         flexDirection: 'row',
          //         alignItems: 'center',
          //         marginTop: 10,
          //       }}
          //       onPress={() => {
          //         setCurrentScreen('JoinCreateHubScreen');
          //       }}>
          //       <Image
          //         source={CreateHubImage}
          //         style={{
          //           height: 35,
          //           width: 35,
          //           resizeMode: 'contain',
          //           marginRight: 10,
          //         }}
          //       />
          //       <CustomText
          //         style={{
          //           color: DarkColor,
          //           fontSize: 14,
          //           fontFamily: fonts.PoppinsMedium,
          //         }}>
          //         Create Hub
          //       </CustomText>
          //     </TouchableOpacity>
          //   </View>
          // }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenView>
  );
};

const NewLogin = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(20);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [AuthStatus, setAuthStatus] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [is_new_user, setIs_new_user] = useState(null);
  const [IsexistUser, setIsExistUser] = useState(null);
  const [selectedType, setSelectedType] = useState('Personal');
  const [HubName, setHubName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizations, setOrganizations] = useState([{ id: 1, name: '' }]);
  const [HubLogo, setHubLogo] = useState(null);
  const [Hubid, setHubid] = useState('');
  const [HubData, setHubData] = useState([]);
  const [Hubcode, setHubCode] = useState('');
  const [Data, setData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const connect = useWebSocket
  // const {signInWithGoogle, signInWithApple} = useAuth();

  const toastRef = useRef(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleNavigateToJoinHub = async () => {
    await AsyncStorage1.setItem('isLoggedIn', 'true');
    // connect();
    navigation.navigate('JoinHubScreen');
    // setCurrentScreen('JoinHubScreen');
  };

  const handleNavigateToCreateHub = async () => {
    // Check for tokens before allowing hub creation
    const token = await AsyncStorage1.getItem('token');
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'You are not logged in or your session has expired. Please log in again.'
      );
      return;
    }
    await AsyncStorage1.setItem('isLoggedIn', 'true');
    // connect();
    navigation.navigate('CreateHubScreen');
  };

  const requestAllPermissions = async () => {
    let permissions = [];

    if (Platform.OS === 'android') {
      permissions = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, // for Android 13+
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      ];
    } else {
      permissions = [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.NOTIFICATIONS,
      ];
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set') {
      const currentDate = selectedDate || new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1,
      ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      setDob(formattedDate);
    }
  };

  const handleEmailLogin = () => {
    const trimmedEmail = email.trim().toLowerCase();
    setEmail(trimmedEmail);
    try {
      setCurrentScreen('signup');
    } catch (err) {
      console.log('error in handleEmailLogin =====> ', err);
    }
  };
  const toggleOtpModal = () => {
    setOtpModalVisible(!isOtpModalVisible);
    setOtpCode('');
  };

  useEffect(() => {
    let timer;
    if (isOtpModalVisible && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isOtpModalVisible, countdown]);

  const handleSkipForNow = async () => {
    await AsyncStorage1.setItem('isLoggedIn', 'true');
    connect();
    dispatch(setAuthenticated(true));
  };

  const handleInternalStore = async res => {
    try {
      setHubData(res?.data?.workspaces);
      const tokensFromApi = res?.data?.tokens;
      const accessToken = tokensFromApi?.access?.token;
      console.log('Access Token:', accessToken);

      const refreshToken = tokensFromApi?.refresh?.token;

      if (!accessToken) {
        throw new Error('No access token found in response');
      }

      // Store tokens as JSON string
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('token', tokensString);
      requestAllPermissions();

      await AsyncStorage1.setItem('sessionId', accessToken);
      await AsyncStorage1.setItem('Rreferesh_sessionId', refreshToken || '');

      await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(res));

      if (res?.data?.workspace_exists) {
        navigation.navigate('HubListingScreen');
      } else {
        navigation.navigate('JoinOrCreateHubScreen');
      }

      // connect();
    } catch (error) {
      console.error('Error in handleInternalStore:', error);
    }
  };

  const HandleOtpVerification = async () => {
    if (!otpCode || otpCode.trim() === '') {
      toastRef.current.show({
        type: 'error',
        message: 'Please enter the verification code.',
      });
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      let requestData = {
        email: normalizedEmail,
        otp: otpCode,
        login_type: 'email_otp',
        is_new_user,
      };

      const res = await loginUser(requestData);
      if (!res?.success) {
        toastRef.current.show({
          type: 'error',
          message: res?.message,
        });
      } else {
        console.log('res in HandleOtpVerification =====> ', res);
        setOtpCode('');
        if (is_new_user) {
          setOtpModalVisible(false);
          setData(res);
          setIsExistUser(true);
        } else {
          setOtpModalVisible(false);
          if (
            res?.data?.user?.first_name.trim() === '' &&
            res?.data?.user?.last_name.trim() === ''
          ) {
            setIsExistUser(true);
            setData(res);
          } else {
            handleInternalStore(res);
          }
        }
      }
    } catch (error) {
      console.error('Error in OTP verification:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred during verification',
      );
    }
  };

  const emailRejext = email1 => {
    const trimmedEmail = email1.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Reject if .com.com or any double TLD
    const doubleTldRegex = /\.(com|net|org|in|co|edu|gov|info|io|me|ai)\.(com|net|org|in|co|edu|gov|info|io|me|ai|.|)$/i;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || doubleTldRegex.test(trimmedEmail)) {
      toastRef.current.show({
        type: 'error',
        message: 'Please enter a valid email address',
      });
      return false;
    }
    return true;
  };

  const HandleLoginWithOTP = async () => {
    if (!isChecked) {
      toastRef.current.show({
        type: 'error',
        message: 'Please accept the terms and conditions',
      });
      return;
    }

    // console.log('\n');
    // console.log('HandleLoginWithOTP check --=------>', '\n');

    // Always trim and lowercase the email before login
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRejext(normalizedEmail)) return;
    let data = { email: normalizedEmail, login_type: 'email_otp' };
    try {
      const res = await loginUser(data);
      // console.log('res in login with OTP =====> ', res);
      if (!res?.success) {
        toastRef.current.show({
          type: 'error',
          message: res?.message || 'Verification failed',
        });
      } else {
        // console.log('res in check --=-----> ', res);
        setIs_new_user(res?.data?.is_new_user);
        setCountdown(res?.data?.otp_rate_limit_window || 20);
        setIsResendDisabled(true);
        setOtpModalVisible(true);
      }
    } catch (err) {
      console.log('error in login with OTP =====>', err);
      toastRef.current.show({
        type: 'error',
        message: err?.message || 'Verification failed' || err[0].Error,
      });
    }
  };

  const handleResendOtp = () => {
    HandleLoginWithOTP();
    toggleOtpModal();
    toggleOtpModal();
  };

  const renderOtpModal = () => (
    <>
    </>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => setCurrentScreen('login')} />;
      case 'login':
        return (
          <LoginOptionsScreen
            onSelectEmail={handleEmailLogin}
            toastRef={toastRef}
            // isChecked={isChecked}
            // setIsChecked={setIsChecked}
            setHubData={setHubData}
            setCurrentScreen={setCurrentScreen}
            navigation={navigation}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onLoginMethod={HandleLoginWithOTP}
            toastRef={toastRef}
            email={email}
            name={name}
            dob={dob}
            setEmail={setEmail}
            setName={setName}
            setDob={setDob}
            setIs_new_user={setIs_new_user}
            is_new_user={is_new_user}
            IsexistUser={IsexistUser}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            handleInternalStore={handleInternalStore}
            Data={Data}
            navigation={navigation}
            setCurrentScreen={setCurrentScreen}
            dispatch={dispatch}

          />
        );
      case 'ProfileSetupScreen':
        return <ProfileSetupScreen navigation={navigation} dispatch={dispatch} email={email} />;
      case 'MemberProfileSetupScreen':
        return <MemberProfileSetupScreen navigation={navigation} dispatch={dispatch} email={email} />;
      case 'JoinCreateHubScreen':
        return (
          <JoinOrCreateHubScreen
            onJoinPress={handleNavigateToJoinHub}
            onCreatePress={handleNavigateToCreateHub}
            navigation={navigation}
          />
        );
      case 'CreateHubScreen':
        return (
          <CreateHubScreen
            navigation={navigation}
            handleSkipForNow={handleSkipForNow}
            type={'login'}
          />
        );
      case 'JoinHubScreen':
        return <JoinHubScreen navigation={navigation} type={'login'} />;
      case 'HubListingScreen':
        return (
          <HubListingScreen
            setHubData={setHubData}
            HubData={HubData}
            handleSkipForNow={handleSkipForNow}
            setCurrentScreen={setCurrentScreen}
            navigation={navigation}
            dispatch={dispatch}
          />
        );
      default:
        return <WelcomeScreen onGetStarted={() => setCurrentScreen('login')} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      {renderScreen()}
      <Toast ref={toastRef} />
      {renderOtpModal()}

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dob ? new Date(dob) : new Date()}
          mode={'date'}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}>
              {/* Optional: Add a "Done" button for better UX on iOS */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <CustomText style={{ color: mainOrangeColor, fontSize: 16 }}>
                    Done
                  </CustomText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={dob ? new Date(dob) : new Date()}
                mode={'date'}
                display="spinner" // "spinner" is a common and good-looking display for iOS
                onChange={onDateChange}
                maximumDate={new Date()}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default NewLogin;

// All styles are consolidated here
const styles = StyleSheet.create({
  getStartedButton: {
    backgroundColor: mainOrangeColor,
    marginTop: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
  },
  astroLogoCentered: {
    width: RfW(200),
    height: RfH(200),
    resizeMode: 'contain',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  methodButtonIconWrapper: {
    marginRight: 10,
  },
  methodButtonIcon: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  checkboxEmpty: {},
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
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RfW(20),
  },
  riggleLogo: {
    width: RfW(316),
    height: RfH(316),
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
  referralText: {
    // textAlign: 'center',
    fontFamily: fonts.PoppinsRegular,
    color: mainOrangeColor,
    fontSize: normalize(14),
    lineHeight: RfH(20),
  },
  astroLogo: {
    width: RfW(200),
    height: RfH(200),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: RfH(height * 0.05),
  },
  riggBackImage: {
    width: RfW(370),
    height: RfH(210),
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
  },
  riggBackImage2: {
    width: RfW(234),
    height: RfH(137),
    resizeMode: 'contain',
    position: 'absolute',
    // right: RfW(20),
  },
  signupheading: {
    fontSize: normalize(24),
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    lineHeight: RfH(30),
    bottom: RfH(20),
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
  form: { width: '100%', paddingHorizontal: RfW(5) },
  bottomSheetContainer: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: RfW(25),
    paddingTop: RfH(20),
    paddingBottom: Platform.OS === 'ios' ? RfH(30) : RfH(20),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: RfH(height * 0.45),
    // flexGrow: 1,
  },
  errormsg: { color: 'red', marginBottom: 0, bottom: RfH(10), fontSize: 10, fontFamily: fonts.PoppinsRegular },
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
  termsText1: { color: dullBlack, fontSize: 10, textAlign: 'center', lineHeight: RfH(16), fontFamily: fonts.PoppinsRegular },
  linkText1: {
    fontFamily: fonts.PoppinsMedium,
    textDecorationLine: 'underline',
    color: mainWhiteColor,
  },
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
    // paddingHorizontal: RfW(20),
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
  primaryButtonContainer: {
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: RfH(18),
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      default: {
        backgroundColor: COLORS.white,
      },
      welcome: {
        backgroundColor: COLORS.primaryOrange,
      },
    }),
  },
  primaryButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
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
    borderColor: DarkCOlor30,
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
    fontSize: normalize(11),
    color: DarkColor,
  },
  disabledText: { color: 'red', fontSize: normalize(12), fontFamily: fonts.PoppinsMedium },
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
  // Additional styles for HubListingScreen
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: RfH(300),
    maxHeight: RfH(400),
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: RfH(20),
  },
  title: {
    fontSize: normalize(18),
    color: DarkColor,
    fontFamily: fonts.PoppinsSemiBold,
    marginBottom: RfH(10),
    alignSelf: 'center',
  },
  item: {
    paddingVertical: RfH(10),
    borderWidth: 0.2,
    borderColor: DarkColor20,
    borderRadius: 6,
    paddingHorizontal: RfW(20),
    marginBottom: RfH(10),
  },
  itemText: {
    fontSize: normalize(16),
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
  },

});
