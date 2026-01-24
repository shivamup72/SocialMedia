import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { otpSend, otpVerify, loginUser } from '../Api/config/auth';
import AsyncStorage1 from '../Api/config/AsyncStorage';
import ButtonContainer from '../components/ButtonContainer/ButtonContainer';
import { fonts } from '../utils/style/fonts';
import Loader from '../Loader/loader';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  requestNotifications,
  checkNotifications,
} from 'react-native-permissions';
import NotificationPermissionModal from './NotificationPermissionModal';
import { useWebSocket } from '../Api/context/WebSocketServices';

const LoginTypeArray = ['google', 'apple', 'email_otp', 'normal'];


const LoginPage = ({ navigation }) => {
  const BackGroundImage = require('../assets/LoginAssets/png/BGimage.png');
  const Arrow = require('../assets/LoginAssets/png/ArrowLogo.png');
  const FrontLogo = require('../assets/LoginAssets/png/FrontLogo.png');
  const UncheckLogo = require('../assets/LoginAssets/png/UnCheck_box.png');
  const CheckBoxLogo = require('../assets/LoginAssets/png/Check_box.png');
  const NotResiterUserImage = require('../assets/LoginAssets/png/NotRegisterModal.png');
  const otpSuccImage = require('../assets/LoginAssets/png/otpsuccImage.png');
  const InvalidOtpImage = require('../assets/LoginAssets/png/InvalidotpModalImage.png');
  const FailedAttemptsBanner = require('../assets/LoginAssets/png/ToomanyfailedattemptsBanner.png');
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [TimerStatus, setTimerStatus] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [EditInputStatus, setEditInputStatus] = useState(true);
  const [dropdownOptions, setDropdownOptions] = useState(false);
  const [OtpInput, setOtpInput] = useState('');
  const [OtpStatus, setOtpStatus] = useState(false);
  const [Errormsg, setErrormsg] = useState('');
  const [ErrorStatus, setErrorStatus] = useState(false);
  const [UserNonAxist, setNonUserAxist] = useState(false);
  const [OtpStatuasType, setOtpStatuasType] = useState(false);
  const [CountNumWrong, setCountNumWrong] = useState(0);
  const [showFailedAttemptsModal, setShowFailedAttemptsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ErrorText, setErrorText] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [LoginType, setLoginType] = useState('normal');

  const { connect } = useWebSocket();

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      // This function works perfectly on both iOS and ALL Android versions.
      const { status } = await checkNotifications();

      if (status !== RESULTS.GRANTED) {
        console.log(
          `Notification status is ${status}, showing permission modal.`,
        );
        setShowModal(true);
      } else {
        console.log('✅ Notification permission is already granted.');
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const isButtonDisabled = !(
    phoneNumber.length > 0 &&
    isChecked &&
    (dropdownOptions ? OtpInput.length === 6 : true)
  );

  const handleUserExist = () => {
    setNonUserAxist(true);
  };

  const handleOtpStatus = () => {
    setOtpStatus(true);
  };

  const handleInvalidNumber = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(phoneNumber)) {
      setErrormsg('Invalid Email Format');
      setErrorStatus(true);

      setTimeout(() => {
        setErrormsg('');
        setErrorStatus(false);
      }, 1000);

      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            setEditInputStatus(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setDropdownOptions(false);
      setCanResend(true);
      setEditInputStatus(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Send otp check
  const HandleSendOtp = async (type = 'no') => {
    try {
      setIsLoading(true);
      let data = {
        email: phoneNumber,
        login_type: LoginType,
      };

      await loginUser(data)
        .then(async res => {
          console.log('\n');
          console.log('In res =====>', JSON.stringify(res));
          console.log('\n');
          if (!res?.success) {
            handleOtpStatus();
            setOtpStatuasType(true);
            setErrorText(res?.message);
          } else {
            setDropdownOptions(true);

            const otpExpirySeconds = res?.data?.otp_expiry_minutes * 60;
            setTimer(otpExpirySeconds);
            setCanResend(false);

            setOtpInput('');
            setTimerStatus(true);
            setEditInputStatus(false);
          }
        })
        .catch(err => {
          console.log('error in login =====>', err);
        });
    } catch (err) {
      console.log('error handle HandleSendOtp =====>', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      HandleSendOtp('yes');
    } catch (err) {
      console.log('error resending OTP =====>', err);
    }
  };

  const handleInternalStore = async res => {
    console.log('\n');
    console.log('In res handleInternalStore =====>', JSON.stringify(res));
    console.log('\n');
    try {
      const accessToken = res?.data?.tokens?.access?.token;
      const refreshToken = res?.data?.tokens?.refresh?.token;

      if (!accessToken) {
        throw new Error('No access token found in response');
      }
      const tokensFromApi = res?.data?.tokens;
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('tokens', tokensString);

      await AsyncStorage1.setItem('isLoggedIn', 'true');
      await AsyncStorage1.setItem('sessionId', JSON.stringify(accessToken));
      await AsyncStorage1.setItem(
        'Rreferesh_sessionId',
        JSON.stringify(refreshToken) || '',
      );
      await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(res));

      // console.log('Tokens stored successfully');

      setOtpStatus(false);
      setDropdownOptions(false);

      // Connect to WebSocket before navigating
      try {
        console.log('Attempting to connect WebSocket...');
        await connect();
        console.log('WebSocket connected successfully');
        navigation.replace('Home');
      } catch (connectError) {
        console.error('WebSocket connection failed:', connectError);

        // navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error in handleInternalStore:', error);
    }
  };

  const HandleLoginButton = async () => {
    const check = handleInvalidNumber();
    if (!check) return;
    else {
      if (!dropdownOptions) {
        HandleSendOtp();
      } else {
        try {
          setIsLoading(true);
          let data = {
            email: phoneNumber,
            otp: OtpInput,
            login_type: LoginType,
          };
          const res = await loginUser(data)
            .then(VInres => {
              if (!VInres?.success) {
                handleOtpStatus();
                setOtpStatuasType(true);
                setErrorText(VInres?.message);
              } else {
                console.log('\n');
                console.log('In res =====>', JSON.stringify(VInres));

                handleOtpStatus();
                setTimerStatus(false);
                setTimeout(() => {
                  handleInternalStore(VInres);
                }, 1000);
              }
            })
            .catch(err => {
              if (err.message === 'Invalid OTP') {
                setCountNumWrong(prev => prev + 1);
                if (CountNumWrong >= 3) {
                  setShowFailedAttemptsModal(true);
                } else {
                  handleOtpStatus();
                  setOtpStatuasType(true);
                }
              }
              console.log('error vertifying =====>', err);
            });
        } catch (err) {
          console.log('error in Verify otp =====>', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Image source={BackGroundImage} style={styles.backgroundImage} />
      <View
        style={[
          styles.container,
          {
            marginTop: !dropdownOptions ? 125 : 20,
            borderTopLeftRadius: dropdownOptions ? 0 : 25,
            borderTopRightRadius: dropdownOptions ? 0 : 25,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={FrontLogo} style={styles.logo} resizeMode="contain" />
          <Text allowFontScaling={false} style={styles.subtitle}>
            RIGGLE ONE APP
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label} allowFontScaling={false}>
              Email id
            </Text>
            <Text style={styles.subLabel} allowFontScaling={false}>
              We will send you the confirmation code.
            </Text>
            <View style={styles.phoneInputContainer}>
              {/* <Text style={styles.countryCode} allowFontScaling={false}>
                +91
              </Text>
              <View
                style={{
                  width: 1,
                  backgroundColor: '#26323833',
                  height: '100%',
                  marginRight: 0,
                }}></View> */}
              <TextInput
                allowFontScaling={false}
                style={styles.phoneInput}
                value={phoneNumber}
                placeholder="Enter your email"
                placeholderTextColor={'#26323880'}
                onChangeText={setPhoneNumber}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={EditInputStatus}
                autoCorrect={false}
              />
            </View>
            {TimerStatus && (
              <View style={styles.timerContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendText} allowFontScaling={false}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerStyle} allowFontScaling={false}>
                    Resend in{' '}
                    {`${Math.floor(timer / 60)}:${(timer % 60)
                      .toString()
                      .padStart(2, '0')}`}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
              <Image
                source={isChecked ? CheckBoxLogo : UncheckLogo}
                style={styles.checkbox}
              />
            </TouchableOpacity>

            <Text style={styles.termsText} allowFontScaling={false}>
              I agree to the{' '}
              <Text
                allowFontScaling={false}
                style={styles.linkText}
                onPress={() =>
                  Linking.openURL('https://assets.riggleapp.in/static/tnc.html')
                }>
                Terms and Conditions
              </Text>{' '}
              and{' '}
              <Text
                allowFontScaling={false}
                style={styles.linkText}
                onPress={() =>
                  Linking.openURL(
                    'https://assets.riggleapp.in/static/privacy-policy.html',
                  )
                }>
                Privacy Policy.
              </Text>
            </Text>
          </View>

          {dropdownOptions && (
            <View>
              <Text style={styles.label} allowFontScaling={false}>
                OTP
              </Text>
              <TextInput
                allowFontScaling={false}
                style={[
                  styles.OtpInput,
                  {
                    borderWidth: OtpInput.length === 6 ? 1 : 0,
                    borderColor: '#FC8C4D',
                  },
                ]}
                value={OtpInput}
                onChangeText={setOtpInput}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={true}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={HandleLoginButton}
            disabled={isButtonDisabled}>
            <Image
              source={Arrow}
              style={[
                styles.arrowIcon,
                {
                  opacity: isButtonDisabled ? 0.5 : 1,
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Error message code */}
        {ErrorStatus && (
          <View
            style={{
              marginTop: 10,
              marginBottom: 10,
              position: 'absolute',
              backgroundColor: 'red',
              paddingHorizontal: 15,
              paddingVertical: 10,
              bottom: 20,
              alignSelf: 'center',
              borderRadius: 10,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: '#ffffff',
                fontSize: 12,
                fontFamily: fonts.PoppinsSemiBold,
              }}>
              {Errormsg}
            </Text>
          </View>
        )}

        {/* Loader */}
        <Loader status={isLoading} />

        {/* Register modal */}
        <Modal visible={UserNonAxist} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={NotResiterUserImage}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Text style={styles.modalText} allowFontScaling={false}>
                This mobile number is not registered. Please sign up first.
              </Text>
              <View style={{ marginTop: 10 }}>
                <ButtonContainer
                  Type={'Exit App'}
                  setNonUserAxist={setNonUserAxist}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* OTP Modals */}
        <Modal visible={OtpStatus} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {OtpStatuasType ? (
                <>
                  <Image
                    source={InvalidOtpImage}
                    style={styles.modalImage1}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalText} allowFontScaling={false}>
                    {ErrorText}
                  </Text>
                  <View style={{ marginTop: 10 }}>
                    <ButtonContainer
                      Type={'Try Again'}
                      setLoginPageCondition={setOtpStatus}
                      setNonUserAxist={setOtpStatuasType}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Image
                    source={otpSuccImage}
                    style={styles.modalImage1}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalTextBold} allowFontScaling={false}>
                    OTP Verified Successfully!
                  </Text>
                  <Text style={styles.modalText} allowFontScaling={false}>
                    Redirecting to your dashboard.
                  </Text>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Too many wrong OTP Modal */}
        <Modal
          visible={showFailedAttemptsModal}
          transparent={true}
          animationType="fade">
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: 330 }]}>
              <Image
                source={FailedAttemptsBanner}
                style={[styles.modalImage1, { marginBottom: 0 }]}
                resizeMode="contain"
              />
              <Text style={styles.modalTextBold} allowFontScaling={false}>
                Too many failed attempts
              </Text>
              <Text style={styles.modalText} allowFontScaling={false}>
                Please wait some time before requesting a new OTP
              </Text>
              <View style={{ marginTop: 10 }}>
                <ButtonContainer
                  Type={'Go Back'}
                // setLoginPageCondition={setLoginPageCondition}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Notifications modal */}
        <NotificationPermissionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onGranted={() => {
            console.log('Permission granted, you can continue...');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 250,
  },
  container: {
    flex: 1,

    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    // backgroundColor: '#ffffff',
  },
  logo: {
    width: 185,
    height: 60,
  },
  subtitle: {
    color: '#FC8C4D',
    marginTop: 5,
    fontSize: 12,
    // fontWeight: '600',
    fontFamily: fonts.PoppinsBold,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    // fontWeight: '500',
    color: '#263238',
    marginBottom: 5,
    fontFamily: fonts.PoppinsMedium,
  },
  subLabel: {
    fontSize: 10,
    color: '#26323880',
    marginBottom: 8,
    fontFamily: fonts.PoppinsRegular,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#FC8C4D80',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FC8C4D26',
    fontFamily: fonts.PoppinsSemiBold,
  },
  countryCode: {
    marginRight: 10,
    fontSize: 16,
    color: '#263238',
    marginTop: 4,
    marginLeft: 0,
    fontFamily: fonts.PoppinsRegular,
  },
  phoneInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#263238',
    // fontFamily: fonts.PoppinsMedium,
    justifyContent: 'center',
    // marginTop: 8,
    paddingLeft: 2,
  },

  OtpInput: {
    // flex: 1,
    height: 42,
    width: 110,
    fontSize: 16,
    color: '#263238',
    // backgroundColor: 'red',
    borderRadius: 8,
    backgroundColor: '#FC8C4D26',
    paddingHorizontal: 10,
    // fontFamily: fonts.PoppinsMedium,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#FC8C4D80',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  timer: {
    color: '#FC8C4D',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: '#FC8C4D80',
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#666',
  },
  dropdownArrow: {
    width: 15,
    height: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#2A3436',
    flex: 1,
    fontFamily: fonts.PoppinsRegular,
    marginLeft: 8,
  },
  linkText: {
    color: '#FC8C4D',
    fontFamily: fonts.PoppinsRegular,
  },
  registerButton: {
    backgroundColor: '#FC8C4D',
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  nextButton: {
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'flex-end',
    height: 50,
    width: 50,
    left: '85%',
    // right: 10,
    // backgroundColor: '#FC8C4D',
  },
  arrowIcon: {
    width: 50,
    height: 50,
    // tintColor: '#ffffff',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    // borderRadius: 16,
    // padding: 24,
    // paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // maxWidth: 320,
    borderTopWidth: 2,
    borderColor: '#FC8C4D',
    height: 320,
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },

  modalImage1: {
    width: 170,
    height: 170,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#263238CC',
    textAlign: 'center',
    marginBottom: 8,
    // backgroundColor: 'red',
    marginHorizontal: 60,
  },
  modalTextBold: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
    textAlign: 'center',
    marginBottom: 8,
    // backgroundColor: 'red',
    // marginHorizontal: 50,
  },
  modalSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  timerStyle: {
    color: '#FC8C4D',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.PoppinsRegular,
  },
  resendText: {
    color: '#263238CC',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.5,
    fontFamily: fonts.PoppinsRegular,
  },
});
