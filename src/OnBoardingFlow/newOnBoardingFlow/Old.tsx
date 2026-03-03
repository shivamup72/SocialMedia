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
} from '../../utils/style/fonts';
import { useAuth } from '../../Api/context/AuthContext';
import Toast from '../../Api/context/Toast';
import { useDispatch } from 'react-redux';
const RiggleXLogo = require('../../assets/newOnBoardingAssests/png/RiggleXLogoRocket.png');
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
// import AsyncStorage1 from '../../config/AsyncStorage';
import { useWebSocket } from '../../Api/context/WebSocketServices';
import CloseSvg from '../../assets/svg/CloseSvg';
import { setLoginData } from '../../redux/slices/authSlice';
import JoinHubScreen from '../JoinHubScreen';
// import {useAuth} from '../../context/AuthContext';
const { height } = Dimensions.get('window');
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { FormatYYYYMMDDToDDMMYYYYY } from '../../utils/CommonUtils';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import CustomText from '../../utils/CustomText';
import { normalize, RfH, RfW } from '../../utils/helper';
import ScreenView from '../../utils/ScreenView';
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
}) => (
    <View style={styles.inputContainer}>
        <CustomText style={[styles.inputLabel, labelColor ? { color: labelColor } : null]}>{label}</CustomText>
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
                <Image source={RiggleXLogo} style={styles.riggleLogo} />
                <CustomText style={styles.title}>Riggle X</CustomText>
                <CustomText style={styles.subtitle}>
                    Your companion for seamless collaboration
                </CustomText>
                <TouchableOpacity
                    style={{
                        backgroundColor: mainOrangeColor,
                        marginTop: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '80%',
                        borderRadius: 8,
                    }}
                    onPress={onGetStarted}>
                    <CustomText
                        style={{
                            color: mainWhiteColor,
                            fontFamily: fonts.PoppinsMedium,
                            fontSize: 14,
                        }}>
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
    isChecked,
    setIsChecked,
    setHubData,
    setCurrentScreen,
    navigation,
}) => {
    const [AuthStatus, setAuthStatus] = useState('');
    const { signInWithGoogle, signInWithApple } = useAuth();
    const { connect } = useWebSocket();

    const handleGoogleLogin = async () => {
        if (!isChecked) {
            toastRef.current.show({
                type: 'error',
                message: 'Please accept the terms and conditions.',
            });
            return;
        }
        try {
            const result = await signInWithGoogle(AuthStatus);
            if (result?.success && result?.shouldNavigate) {
                // console.log('result --==---->', JSON.stringify(result?.data));
                connect();
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
        if (!isChecked) {
            toastRef.current.show({
                type: 'error',
                message: 'Please accept the terms and conditions',
            });
            return;
        }
        try {
            // console.log('handleAppleSignUp --==---->', JSON.stringify(AuthStatus));
            const result = await signInWithApple(AuthStatus);
            if (result?.success && result?.shouldNavigate) {
                // console.log('result --==---->', JSON.stringify(result?.data));
                connect();
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
            <Image source={AstroLogo} style={[styles.astroLogo, { flex: 1, justifyContent: 'center', alignSelf: 'center' }]} />
            <BottomSheet>
                <CustomText style={styles.bottomSheetTitle}>Welcome</CustomText>
                <CustomText style={styles.bottomSheetSubtitle}>
                    Choose your preferred login method
                </CustomText>

                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        style={styles.methodButton1}
                        onPress={handleAppleLogin}>
                        <View style={{ marginRight: 10 }}>
                            <Image
                                source={require('../../assets/Png/App_Image_Logo.png')}
                                style={{ width: 23, height: 23, resizeMode: 'contain' }}
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
                <View style={styles.termsContainer}>
                    <CheckBox
                        style={{}}
                        isChecked={isChecked}
                        onClick={() => setIsChecked(!isChecked)}
                        checkBoxColor={mainWhiteColor}
                    />
                    <CustomText style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <CustomText
                            style={styles.linkText1}
                            onPress={() =>
                                Linking.openURL(
                                    'https://assets.riggleapp.in/static/rigglex-tnc.html',
                                )
                            }>
                            Terms & Conditions
                        </CustomText>{' '}
                        and{' '}
                        <CustomText
                            style={styles.linkText1}
                            onPress={() =>
                                Linking.openURL(
                                    'https://assets.riggleapp.in/static/rigglex-privacy-policy.html',
                                )
                            }>
                            Privacy Policy.
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
}) => {
    const [timer, setTimer] = useState(20);
    const [loading, setLoading] = useState(false);
    const [referralCode, setReferralCode] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    // OTP timer effect
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

    // Handler to trigger OTP send and show input (with real API logic)
    const handleSendOtp = async () => {
        if (!email || email.trim() === '') {
            toastRef.current?.show?.({ type: 'error', message: 'Please enter your email or phone.' });
            return;
        }
        setLoading(true);
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const data = { email: normalizedEmail, login_type: 'email_otp' };
            const res = await loginUser(data);
            if (!res?.success) {
                toastRef.current?.show?.({ type: 'error', message: res?.message || 'Failed to send OTP.' });
            } else {
                setShowOtpInput(true);
                setIsResendDisabled(true);
                setTimer(res?.data?.otp_rate_limit_window || 20);
                toastRef.current?.show?.({ type: 'success', message: 'OTP sent successfully.' });
            }
        } catch (e) {
            toastRef.current?.show?.({ type: 'error', message: e?.message || 'Failed to send OTP.' });
        } finally {
            setLoading(false);
        }
    };

    // Handler to verify OTP (with real API logic)
    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.trim() === '') {
            toastRef.current?.show?.({ type: 'error', message: 'Please enter the verification code.' });
            return;
        }
        setLoading(true);
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const data = { email: normalizedEmail, otp: otpCode, login_type: 'email_otp' };
            const res = await loginUser(data);
            if (!res?.success) {
                toastRef.current?.show?.({ type: 'error', message: res?.message || 'OTP verification failed.' });
            } else {
                setShowOtpInput(false);
                setOtpCode('');
                toastRef.current?.show?.({ type: 'success', message: 'OTP verified. Signup complete!' });
                // Navigate to next screen after successful signup
                if (typeof setCurrentScreen === 'function') {
                    setCurrentScreen('JoinCreateHubScreen');
                } else if (typeof navigation?.navigate === 'function') {
                    navigation.navigate('JoinOrCreateHubScreen');
                }
            }
        } catch (e) {
            toastRef.current?.show?.({ type: 'error', message: e?.message || 'OTP verification failed.' });
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
            if (!res?.success) {
                toastRef.current?.show?.({ type: 'error', message: res?.message || 'Failed to resend OTP.' });
            } else {
                setTimer(res?.data?.otp_rate_limit_window || 20);
                toastRef.current?.show?.({ type: 'success', message: 'OTP resent successfully.' });
            }
        } catch (e) {
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

    const HandleUserDetails = async () => {
        if (name.trim() === '' || dob.trim() === '') {
            toastRef.current.show({
                type: 'Error',
                message: 'Please fill all the details.',
            });
            return;
        }

        try {
            setLoading(true);
            let firstName = '';
            let lastName = '';
            const trimmedName = name.trim();
            const spaceIndex = trimmedName.indexOf(' ');

            if (spaceIndex === -1) {
                firstName = trimmedName;
                lastName = '';
            } else {
                firstName = trimmedName.slice(0, spaceIndex);
                lastName = trimmedName.slice(spaceIndex + 1).trim();
            }

            if (!lastName || lastName.trim() === '') {
                toastRef.current.show({
                    type: 'Error',
                    message: 'Please enter both first and last name.',
                });
                return;
            }

            // console.log('firstName', firstName);
            // console.log('lastName', lastName);

            await AsyncStorage1.setItem('first_name', JSON.stringify(firstName));
            await AsyncStorage1.setItem('last_name', JSON.stringify(lastName));
            await AsyncStorage1.setItem('dob', JSON.stringify(dob));
            await handleInternalStore(Data);
        } catch (error) {
            console.log('error in HandleUserDetails =====> ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: mainWhiteColor }}>
            {/* 
      <KeyboardAvoidingView
        style={{ flexGrow: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: RfW(30), }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
          }}>
            <View>
              <CustomText style={styles.signupheading}>Let's get started!</CustomText>
            </View>
            <CustomTextInput
              label="Email ID/Phone number"
              placeholder="Enter email id"
              value={email}
              onChangeText={text => setEmail(text)}
              labelColor={DarkColor}
              keyboardType='email'
            />
            {referralCode && (
              <CustomTextInput
                label="Referral Code"
                placeholder="Enter"
                labelColor={DarkColor}
              />
            )}
            {IsexistUser && (
              <>
                <CustomTextInput
                  label="Full Name"
                  labelColor={DarkColor}
                  placeholder="Enter name"
                  value={name}
                  onChangeText={setName}
                />
                <View style={styles.inputContainer}>
                  <CustomText style={[styles.inputLabel, { color: DarkColor }]}>Date of Birth</CustomText>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputField}>
                    <CustomText
                      style={dob ? styles.dateText : styles.datePlaceholder}>
                      {dob !== ''
                        ? (() => {
                          const d = new Date(dob);
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = d.getFullYear();
                          return `${day}-${month}-${year}`;
                        })()
                        : 'Select Date of Birth'}
                    </CustomText>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dob ? new Date(dob) : new Date()}
                      mode="date"
                      display="calendar"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (event.type === 'set') {
                          const currentDate = selectedDate || new Date();
                          const formattedDate = `${currentDate.getFullYear()}-${String(
                            currentDate.getMonth() + 1,
                          ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                          setDob(formattedDate);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              </>
            )}

            <View style={{ marginTop: 20 }} />
            <Pressable style={{ alignSelf: 'center', marginBottom: RfH(20) }} onPress={() => setReferralCode(!referralCode)}>
              <CustomText style={styles.referralText}>Have a referral code?</CustomText>
            </Pressable>

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: mainOrangeColor,
                  width: '80%',
                  alignItems: 'center',
                  borderRadius: 8,
                  justifyContent: 'center',
                  height: 50,
                }}
                onPress={IsexistUser ? HandleUserDetails : onLoginMethod}
              // disabled={loading}
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

              <View style={{ top: RfH(10), width: '60%' }}>
                <CustomText style={styles.termsText1}>By continuing, you agree to our Terms of Service and Privacy Policy</CustomText>
              </View>
            </View>
          </ScrollView>

        </View >
      </KeyboardAvoidingView > */}
            <View style={{ flex: 1, backgroundColor: mainWhiteColor }}>
                {/* Background Image */}
                <View style={styles.riggBackImage}>
                    <Image
                        source={AuthBackImage}
                        style={{ height: '100%', width: '100%', left: RfH(30) }}
                        resizeMode="contain"
                    />
                </View>

                {/* Content */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={{ flex: 1, justifyContent: 'center', height: '70%', position: 'absolute', bottom: RfH(0), width: '100%' }}>
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
                                    />
                                    {showOtpInput && (
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
                                                    label="Referral Code"
                                                    placeholder="Enter"
                                                    labelColor={DarkColor}
                                                />
                                            )}


                                            <TouchableOpacity
                                                style={[styles.continueButton, { width: '100%', borderRadius: 10, paddingVertical: 15, marginBottom: RfH(10) }]}
                                                onPress={handleVerifyOtp}
                                            >
                                                <CustomText allowFontScaling={false} style={styles.continueButtonText}>
                                                    Continue
                                                </CustomText>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    {!showOtpInput && (
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: mainOrangeColor,
                                                width: '80%',
                                                alignItems: 'center',
                                                borderRadius: 8,
                                                justifyContent: 'center',
                                                height: 50,
                                                marginTop: 20,
                                            }}
                                            onPress={handleSendOtp}
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

                                    <View style={{ top: RfH(10), width: '60%' }}>
                                        <CustomText style={styles.termsText1}>By continuing, you agree to our Terms of Service and Privacy Policy</CustomText>
                                    </View>
                                </View>
                            </View>

                        </ScrollView>
                    </View>

                </KeyboardAvoidingView>
            </View>
        </SafeAreaView >
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

const HubListingScreen = ({
    HubData,
    setHubData,
    handleSkipForNow,
    setCurrentScreen,
}) => {
    const [hubList1, setHubList1] = useState([]);

    useEffect(() => {
        const FetchData = async () => {
            try {
                const res = await GetCreateWorkSpaceApi({});

                console.log('res Hub Listing', JSON.stringify(res));
                setHubList1(res?.results);
            } catch (error) {
                console.log('error Hub Listing', error);
            }
        };

        FetchData();
    }, []);

    const renderHubItem = ({ item }) => (
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
                await AsyncStorage1.setItem('HubName', JSON.stringify(item.name));
                handleSkipForNow();
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
                        }}>
                        {item?.name}
                    </CustomText>
                    {/* <DropDownSvg 
            width={14} 
            height={14} 
            color="#666" 
            fillOpacity={0.8} 
          /> */}
                </View>
                {/* <View style={{ flexDirection: 'row', marginTop: 4 }}>

          <CustomText style={{
            fontFamily: fonts.PoppinsRegular,
            fontSize: 12,
            color: DarkColor60
          }}>
            {item?.members[0]?.role}
          </CustomText>
        </View> */}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenView>
            <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
            <View style={styles.headerCurve} />
            <View style={{ flex: 1, width: '100%' }}>
                <FlatList
                    style={{ width: '100%', flex: 1, height: 400 }}
                    data={HubData}
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
                                }}
                                onPress={() => {
                                    setCurrentScreen('JoinCreateHubScreen');
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
                                    Create Hub
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenView>
    );
};

const NewLogin = ({ navigation }) => {
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
    const { connect } = useWebSocket();
    // const {signInWithGoogle, signInWithApple} = useAuth();

    const toastRef = useRef(null);
    const [isChecked, setIsChecked] = useState(false);

    const handleNavigateToJoinHub = async () => {
        await AsyncStorage1.setItem('isLoggedIn', 'true');
        connect();
        navigation.navigate('JoinHubScreen');
        // setCurrentScreen('JoinHubScreen');
    };

    const handleNavigateToCreateHub = async () => {
        await AsyncStorage1.setItem('isLoggedIn', 'true');
        connect();
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
        if (!isChecked) {
            toastRef.current.show({
                type: 'error',
                message: 'Please accept the terms and conditions',
            });
            return;
        }
        // Always trim and lowercase the email before proceeding
        const trimmedEmail = email.trim().toLowerCase();
        setEmail(trimmedEmail); // Update state for UI
        // Use trimmedEmail for all checks below
        // Fix: Check existence using trimmedEmail
        // If you have logic that checks for existing user, use trimmedEmail
        // Example:
        // if (checkUserExists(trimmedEmail)) { setIsExistUser(true); } else { setIsExistUser(false); }
        // If you use an API call, pass trimmedEmail
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
        navigation.replace('Home');
    };

    const handleInternalStore = async res => {
        try {
            // console.log('res', res);
            setHubData(res?.data?.workspaces);
            const accessToken = res?.data?.tokens?.access?.token;
            const refreshToken = res?.data?.tokens?.refresh?.token;

            if (!accessToken) {
                throw new Error('No access token found in response');
            }

            // dispatch(setLoginData({
            //   accessToken,
            //   refreshToken,
            //   user: res?.data,
            //   workspaces: res?.data?.workspaces || [],
            // }));

            // Store tokens
            const tokensFromApi = res?.data?.tokens;
            const tokensString = JSON.stringify(tokensFromApi);
            await AsyncStorage1.setItem('token', tokensString);
            requestAllPermissions();

            await AsyncStorage1.setItem('sessionId', JSON.stringify(accessToken));
            await AsyncStorage1.setItem(
                'Rreferesh_sessionId',
                JSON.stringify(refreshToken || ''),
            );

            await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(res));

            if (res?.data?.workspace_exists) {
                // setCurrentScreen('HubListingScreen');
                navigation.navigate('HubListingScreen');
            } else {
                navigation.navigate('JoinOrCreateHubScreen');
            }

            connect();
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
                // console.log('res in HandleOtpVerification =====> ', res);
                setOtpCode('');
                if (is_new_user) {
                    setOtpModalVisible(false);

                    setData(res);
                    setIsExistUser(true);

                    // console.log(
                    //   'res in HandleOtpVerification =====> ',
                    //   JSON.stringify(res),
                    // );
                } else {
                    // console.log(
                    //   'res in false HandleOtpVerification =====> ',
                    //   JSON.stringify(res),
                    // );
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
        // <Modal
        //   visible={isOtpModalVisible}
        //   transparent={true}
        //   animationType="fade"
        //   onRequestClose={toggleOtpModal}>
        //   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        //     <View style={styles.modalContainer}>
        //       {Platform.OS === 'ios' && (
        //         <TouchableOpacity
        //           onPress={toggleOtpModal}
        //           style={{ alignSelf: 'center', marginBottom: 10 }}>
        //           <CloseSvg width={30} height={30} color={'red'} />
        //         </TouchableOpacity>
        //       )}
        //       <View style={styles.modalContent}>
        //         <SectionTitle size={24} marginBottom={10}>
        //           Verify OTP
        //         </SectionTitle>
        //         <View style={styles.form}>
        //           <CustomText allowFontScaling={false} style={styles.inputLabel}>
        //             Verification Code
        //           </CustomText>
        //           <TextInput
        //             allowFontScaling={false}
        //             style={styles.textInput}
        //             value={otpCode}
        //             onChangeText={setOtpCode}
        //             keyboardType="numeric"
        //             maxLength={6}
        //             secureTextEntry={true}
        //           />
        //         </View>
        //         <TouchableOpacity
        //           style={[
        //             styles.continueButton,
        //             { width: '100%', borderRadius: 10, paddingVertical: 15 },
        //           ]}
        //           onPress={HandleOtpVerification}>
        //           <CustomText allowFontScaling={false} style={styles.continueButtonText}>
        //             Verify & Continue
        //           </CustomText>
        //         </TouchableOpacity>
        //         <View style={styles.resendContainer}>
        //           <TouchableOpacity
        //             onPress={handleResendOtp}
        //             disabled={isResendDisabled}>
        //             <CustomText
        //               allowFontScaling={false}
        //               style={[
        //                 styles.RedtextStyle,
        //                 isResendDisabled && styles.disabledText,
        //               ]}>
        //               Resend Code
        //             </CustomText>
        //           </TouchableOpacity>
        //           {isResendDisabled && (
        //             <CustomText allowFontScaling={false} style={styles.countdownText}>
        //               00:{countdown < 10 ? `0${countdown}` : countdown}
        //             </CustomText>
        //           )}
        //         </View>
        //       </View>
        //     </View>
        //   </TouchableWithoutFeedback>
        // </Modal >
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
                        isChecked={isChecked}
                        setIsChecked={setIsChecked}
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
                    />
                );
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
});
