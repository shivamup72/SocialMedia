import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from '../Api/context/AuthContext';
// import Toast from "../context/Toast";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
  TextInput,
  BackHandler,
  Modal,
  Platform,
  Clipboard,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  share,
  FlatList,
} from 'react-native';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  DarkColor80,
  DarkColor60,
  RedColor,
  mainOrange80,
  DarkColor20,
  DarkCOlor30,
} from '../utils/style/fonts';
import { useDispatch } from 'react-redux';
import { setLoginData } from '../redux/slices/authSlice';
import { loginUser } from '../Api/config/auth';
const lightGrayBorder = '#E0E0E0';
import AsyncStorage1 from '../Api/config/AsyncStorage';
import { useWebSocket } from '../Api/context/WebSocketServices';
import EyeIcon from '../assets/LoginAssets/svg/uiw_eye_o';
import HideeyesSvg from '../assets/LoginAssets/svg/Hide_eyes';
import UploadIcon from '../assets/LoginAssets/svg/Upload_Icon';
import BackArrowSvg from '../assets/svg/BackArrowSvg';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  PostCreateWorkSpaceApi,
  GetWorkSpaceCode,
  GetCreateWorkSpaceApi,
  PostJoinHubByCodeApi,
} from '../Api/config/HomeApi';
import CloseSvg from '../assets/svg/CloseSvg';
import DropDownSvg from '../assets/svg/DropDownSvg';
// import Toast from "../context/Toast";
import CheckBox from 'react-native-check-box';
// import AppleSvgIcon from "../assets/svg/AppleSvg";
import AppleLogo from '../assets/svg/Apple_logo_black';

import Toast from '../Api/context/Toast';

const SectionTitle = ({
  children,
  style,
  color = DarkColor,
  marginBottom = 10,
  align = 'center',
  size = 24,
}) => (
  <Text
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
  </Text>
);

const Subtitle = ({
  children,
  style,
  color = DarkColor80,
  marginBottom = 30,
  align = 'center',
}) => (
  <Text
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
  </Text>
);

const AuthMethodScreen = ({
  authStatus,
  onGoogleSignUp,
  onEmailSignUp,
  createAccountImage,
  googleImage,
  emailImage,
  styles,
  First_name,
  setFirst_name,
  Last_name,
  setLast_name,
  email,
  setEmail,
  onResend,
  otpCode,
  setOtpCode,
  VerifyCode,
  setVerifyCode,
  onVerify,
  setIsEmailSignUp,
  IsEmailSignUp,
  isChecked,
  setIsChecked,
  onAppleSignUp,
}) => (
  <>
    <View style={styles.createAccountLogoContainer}>
      <Image source={createAccountImage} style={styles.createAccountImage} />
    </View>

    <SectionTitle>Welcome Aboard!</SectionTitle>

    <Subtitle>Quick intro? We'll handle the rest!</Subtitle>

    {/* {Platform.OS === 'ios' ? ( */}

    <TouchableOpacity style={styles.methodButton} onPress={onAppleSignUp}>
      <View style={{ marginRight: 10 }}>
        <Image
          source={require('../assets/Png/App_Image_Logo.png')}
          style={{ width: 23, height: 23, resizeMode: 'contain' }}
        />
      </View>
      <View>
        <Text allowFontScaling={false} style={styles.methodButtonText}>
          Continue with Apple
        </Text>
      </View>
    </TouchableOpacity>

    {/* )} */}

    <TouchableOpacity style={styles.methodButton} onPress={onGoogleSignUp}>
      <Image source={googleImage} style={styles.methodIcon} />
      <Text allowFontScaling={false} style={styles.methodButtonText}>
        Continue with Google
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.methodButton}
      onPress={() => setIsEmailSignUp(!IsEmailSignUp)}>
      <Image source={emailImage} style={styles.methodIcon} />
      <Text allowFontScaling={false} style={styles.methodButtonText}>
        Continue with Email
      </Text>
    </TouchableOpacity>

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
      <CheckBox
        isChecked={isChecked}
        onClick={() => setIsChecked(!isChecked)}
        checkBoxColor="#FC8C4D"
        style={{
          width: 25,
          height: 25,
        }}
      />
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 4,
          fontSize: 13,
          color: '#263238',
          marginLeft: 3,
          fontFamily: 'Poppins-Regular',
          includeFontPadding: false,
        }}>
        I agree to the
      </Text>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL('https://assets.riggleapp.in/static/rigglex-tnc.html')
        }>
        <Text
          allowFontScaling={false}
          style={{
            marginTop: 4,
            fontSize: 13,
            color: '#FC8C4D',
            marginLeft: 3,
            fontFamily: 'Poppins-Regular',
            includeFontPadding: false,
          }}>
          Terms and Conditions
        </Text>
      </TouchableOpacity>
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 4,
          fontSize: 13,
          color: '#263238',
          marginLeft: 3,
          fontFamily: 'Poppins-Regular',
          includeFontPadding: false,
        }}>
        and
      </Text>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            'https://assets.riggleapp.in/static/rigglex-privacy-policy.html',
          )
        }>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 13,
            color: '#FC8C4D',
            marginLeft: 3,
            marginTop: 4,
            fontFamily: 'Poppins-Regular',
            includeFontPadding: false,
          }}>
          Privacy Policy.
        </Text>
      </TouchableOpacity>
    </View>

    {IsEmailSignUp && (
      <>
        {/* <Text allowFontScaling={false} style={styles.inputLabel}>What should we call you?</Text>
        <TextInput
          allowFontScaling={false}
          style={styles.textInput}
          value={First_name}
          onChangeText={setFirst_name}
          placeholder="Enter your full name"
        /> */}

        <Text allowFontScaling={false} style={styles.inputLabel}>
          Email
        </Text>
        <TextInput
          allowFontScaling={false}
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="your.email@example.com"
        />

        <TouchableOpacity style={styles.continueButton} onPress={onVerify}>
          <Text allowFontScaling={false} style={styles.continueButtonText}>
            Verify & Continue
          </Text>
        </TouchableOpacity>
      </>
    )}

    {/* <Text allowFontScaling={false} style={styles.inputLabel}>Date of Birth</Text>
    <TextInput
      allowFontScaling={false}
      style={styles.textInput}
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      placeholder="your.email@example.com"
    /> */}
  </>
);

const EmailPasswordForm = ({
  authStatus,
  email,
  setEmail,
  password,
  setPassword,
  Confirmedpassword,
  setConfirmedpassword,
  secureTextEntryPassword,
  setSecureTextEntrypassword,
  secureTextEntryConfirmedpassword,
  setSecureTextEntryConfirmedpassword,
  First_name,
  setFirst_name,
  Last_name,
  setLast_name,
  PhoneNumber,
  setPhoneNumber,
  onLoginWithOTP,
  onContinue,
  formIcon,
  styles,
}) => (
  <>
    <View style={styles.formIconContainer}>
      <Image source={formIcon} style={styles.formIcon} />
    </View>
    <SectionTitle>Enter Your Details</SectionTitle>
    <View style={styles.form}>
      {authStatus !== 'Login' && (
        <>
          {/*                   
          <Text style={styles.inputLabel}>
            Profile Picture <Text style={styles.optionalText}>(optional)</Text>
          </Text>
          <TouchableOpacity
            style={[styles.textInput, { flexDirection: "row" }]}
          >
            <View style={{ marginRight: 10 }}>
              <UploadIcon width={20} height={20} />
            </View>
            <Text
              style={{
                fontSize: 13,
                color: DarkColor60,
                fontFamily: fonts.PoppinsLight,
              }}
            >
              Upload
            </Text>
          </TouchableOpacity> */}

          <Text allowFontScaling={false} style={styles.inputLabel}>
            First Name
          </Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={First_name}
            onChangeText={setFirst_name}
            placeholder="Enter your first name"
          />
          <Text allowFontScaling={false} style={styles.inputLabel}>
            Last Name
          </Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={Last_name}
            onChangeText={setLast_name}
            placeholder="Enter your last name"
          />
        </>
      )}
      <Text allowFontScaling={false} style={styles.inputLabel}>
        Email
      </Text>
      <TextInput
        allowFontScaling={false}
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="your.email@example.com"
      />
      <Text allowFontScaling={false} style={styles.inputLabel}>
        Password
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          allowFontScaling={false}
          style={styles.textInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={secureTextEntryPassword}
        />
        <TouchableOpacity
          onPress={() => setSecureTextEntrypassword(!secureTextEntryPassword)}
          style={{ position: 'absolute', right: 10, top: 15 }}>
          {secureTextEntryPassword ? (
            <HideeyesSvg width={20} height={20} color={DarkColor60} />
          ) : (
            <EyeIcon width={20} height={20} color={DarkColor60} />
          )}
        </TouchableOpacity>
      </View>
      {authStatus !== 'Login' && (
        <>
          <Text allowFontScaling={false} style={styles.inputLabel}>
            Confirm Password
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              allowFontScaling={false}
              style={styles.textInput}
              value={Confirmedpassword}
              placeholder="Re-enter your password"
              secureTextEntry={secureTextEntryConfirmedpassword}
              onChangeText={setConfirmedpassword}
            />
            <TouchableOpacity
              onPress={() =>
                setSecureTextEntryConfirmedpassword(
                  !secureTextEntryConfirmedpassword,
                )
              }
              style={{ position: 'absolute', right: 10, top: 15 }}>
              {secureTextEntryConfirmedpassword ? (
                <HideeyesSvg width={20} height={20} color={DarkColor60} />
              ) : (
                <EyeIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          <Text allowFontScaling={false} style={styles.inputLabel}>
            Phone Number<Text style={styles.optionalText}> (optional)</Text>
          </Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={PhoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </>
      )}
    </View>
    {authStatus === 'Login' && (
      <TouchableOpacity
        style={{ width: '100%', alignItems: 'flex-end', marginBottom: 20 }}
        onPress={onLoginWithOTP}>
        <Text
          allowFontScaling={false}
          style={{
            color: mainOrangeColor,
            fontSize: 12,
            fontFamily: fonts.PoppinsRegular,
            textDecorationLine: 'underline',
          }}>
          Login with OTP
        </Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
      <Text allowFontScaling={false} style={styles.continueButtonText}>
        {' '}
        {authStatus === 'Login' ? 'Continue' : 'Continue with otp'}{' '}
      </Text>
    </TouchableOpacity>
  </>
);

const EmailVerificationScreen = ({
  VerifyCode,
  setVerifyCode,
  onVerify,
  onResend,
  formIcon,
  styles,
}) => (
  <>
    <View style={styles.formIconContainer}>
      <Image source={formIcon} style={styles.formIcon} />
    </View>
    <SectionTitle>Verify Your Email</SectionTitle>
    <Subtitle>Enter the 6-digit code sent to your email</Subtitle>
    <View style={styles.form}>
      <Text allowFontScaling={false} style={styles.inputLabel}>
        Verification Code
      </Text>
      <TextInput
        allowFontScaling={false}
        style={styles.textInput}
        value={VerifyCode}
        onChangeText={setVerifyCode}
        keyboardType="numeric"
        autoCapitalize="none"
        placeholder="Enter 6-digit code"
        maxLength={6}
      />
    </View>
    <TouchableOpacity style={styles.continueButton} onPress={onVerify}>
      <Text allowFontScaling={false} style={styles.continueButtonText}>
        Verify & Continue
      </Text>
    </TouchableOpacity>
    <TouchableOpacity style={{ marginVertical: 14 }} onPress={onResend}>
      <Text allowFontScaling={false} style={styles.RedtextStyle}>
        Resend Code
      </Text>
    </TouchableOpacity>
  </>
);

const TellUsMoreScreen = React.memo(
  ({
    title,
    subtitle,
    styles,
    onBack,
    HubName,
    setHubName,
    organizationName,
    setOrganizationName,
    organizations,
    setOrganizations,
    mainOrange80,
    mainOrangeColor,
    DarkColor20,
    DarkCOlor30,
    DarkColor60,
    selectedType,
    hubLogo,
    setHubLogo,
    setCurrentStep,
    setHubid,
    // setApkLoading,
  }) => {
    const selectImage = useCallback(() => {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
      };

      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to select image. Please try again.');
        } else if (response.assets && response.assets[0]) {
          // const source = { uri:  };
          setHubLogo(response.assets[0]);
        }
      });
    }, []);

    const handleUpdateOrgName = useCallback(
      (text, index) => {
        const newOrgs = [...organizations];
        newOrgs[index].name = text;
        setOrganizations(newOrgs);
      },
      [organizations, setOrganizations],
    );

    const handleAddOrg = useCallback(() => {
      if (organizations.length < 5) {
        setOrganizations([...organizations, { id: Date.now(), name: '' }]);
      }
    }, [organizations, setOrganizations]);

    const handleRemoveOrg = useCallback(
      index => {
        const newOrgs = organizations.filter((_, i) => i !== index);
        setOrganizations(newOrgs);
      },
      [organizations, setOrganizations],
    );

    const handleCreateWorkSpace = async () => {
      try {
        if (!HubName || !HubName.trim()) {
          Alert.alert('Error', 'Please enter a workspace name');
          return;
        }

        const formData = new FormData();

        if (hubLogo) {
          formData.append('logo', {
            uri: hubLogo.uri,
            type: hubLogo.type,
            name: hubLogo.fileName,
          });
        }

        if (selectedType === 'Work' && organizations?.length > 0) {
          const orgNames = organizations.map(org => org.name).filter(Boolean);
          if (orgNames.length > 0) {
            formData.append('designations', orgNames.join(','));
          }
        }

        formData.append('name', HubName);
        formData.append(
          'workspace_type',
          selectedType === 'Personal' ? 'personal' : 'work',
        );

        // console.log(
        //   "\n \n",
        //   "Sending workspace data:",
        //   JSON.stringify(formData)
        // );

        const response = await PostCreateWorkSpaceApi(formData);

        setHubid(response?.data?.workspace_id);
        await AsyncStorage1.setItem(
          'HubId',
          JSON.stringify(response?.data?.workspace_id),
        );

        setCurrentStep(7);
      } catch (error) {
        console.error('Error creating workspace:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to create workspace. Please try again.',
        );
      }
    };

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
        <View style={styles.headerCurve} />
        <ScrollView
          contentContainerStyle={styles.formContentContainer}
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              marginTop: 10,
              flex: 1,
              width: '100%',
              alignItems: 'center',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={onBack}
                style={{ paddingVertical: 10, paddingRight: 12, paddingTop: 0 }}>
                <BackArrowSvg />
              </TouchableOpacity>
              <SectionTitle>{title}</SectionTitle>
            </View>
            <Subtitle marginBottom={10}>{subtitle}</Subtitle>

            <View style={{ width: '100%', marginTop: 20, paddingHorizontal: 20 }}>
              {/* <View
                style={{
                  borderWidth: 1,
                  borderColor: DarkColor20,
                  borderRadius: 6,
                  width: "100%",
                  height: 100,
                  justifyContent: "center",
                  alignItems: "center",
                  borderStyle: "dashed",
                }}
              >
                {hubLogo ? (
                  <Image
                    source={hubLogo}
                    style={{ width: "100%", height: "100%", borderRadius: 5 }}
                    resizeMode="cover"
                  />
                ) : (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      padding: 20,
                    }}
                    onPress={selectImage}
                  >
                    <View style={{ marginRight: 10 }}>
                      <UploadIcon width={20} height={20} />
                    </View>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: DarkColor60,
                        fontSize: 14,
                        fontFamily: fonts.PoppinsRegular,
                      }}
                    >
                      Upload hub logo
                    </Text>
                  </TouchableOpacity>
                )}
                {hubLogo && (
                  <TouchableOpacity
                    onPress={() => setHubLogo(null)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 15,
                      width: 30,
                      height: 30,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: mainWhiteColor, fontSize: 18 }}>×</Text>
                  </TouchableOpacity>
                )}
              </View> */}
              <View style={{ width: '100%', marginTop: 20 }}>
                <Text style={styles.inputLabel}>Hub Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={HubName}
                  onChangeText={setHubName}
                  placeholder="Enter Hub name"
                  placeholderTextColor={DarkCOlor30}
                  allowFontScaling={false}
                />
                {selectedType === 'Work' && (
                  <>
                    <Text style={styles.inputLabel}>Organization Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={organizationName}
                      onChangeText={setOrganizationName}
                      placeholder="Enter Organization name"
                      placeholderTextColor={DarkCOlor30}
                      allowFontScaling={false}
                    />
                  </>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {/* <TouchableOpacity onPress={handleCreateWorkSpace}>
                    <Text style={[styles.SkipTextStyle, { fontSize: 10 }]}>
                      Continue with sign up email
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 10,
                      color: DarkColor60,
                      fontFamily: fonts.PoppinsLight,
                    }}
                  >
                    Or
                  </Text>
                  <TouchableOpacity>
                    <Text style={[styles.SkipTextStyle, { fontSize: 10 }]}>
                      Another one
                    </Text>
                  </TouchableOpacity> */}
                </View>

                {selectedType === 'Work' && (
                  <View style={{ width: '100%', marginTop: 20 }}>
                    <Text style={[styles.inputLabel, { marginBottom: 10 }]}>
                      Add Designation
                    </Text>
                    {organizations?.map((org, index) => (
                      <View
                        key={org.id}
                        style={{
                          marginBottom: 15,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <TextInput
                            style={[styles.textInput, { marginBottom: 0 }]}
                            value={org.name}
                            onChangeText={text =>
                              handleUpdateOrgName(text, index)
                            }
                            placeholder={`Designation ${index + 1}`}
                            allowFontScaling={false}
                          />
                        </View>
                        {organizations?.length > 1 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveOrg(index)}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <CloseSvg color="red" width="20" height="20" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={handleAddOrg}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: mainOrangeColor,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 6,
                      }}
                      disabled={organizations.length >= 5}>
                      <View style={{ marginRight: 8 }}>
                        <Text
                          style={{
                            color: mainOrangeColor,
                            fontSize: 16,
                            lineHeight: 18,
                          }}>
                          +
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: mainOrangeColor,
                          fontSize: 11,
                          fontFamily: fonts.PoppinsMedium,
                        }}>
                        Add more
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View
              style={[
                styles.bottomButtonContainer,
                { width: '100%', marginTop: 10 },
              ]}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleCreateWorkSpace}>
                <Text style={styles.continueButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  },
);

const JoinHubScreen = React.memo(
  ({
    selectedType,
    Hubcode,
    setHubCode,
    Designation,
    setDesignation,
    LineManager,
    setLineManager,
    navigateToStep,
    handleSkipForNow,
    toastRef,
  }) => {
    const handleBackPress = useCallback(() => {
      // console.log('Back button pressed');
      navigateToStep(5);
    }, []);

    const handleJoinHub = async () => {
      const formData = new FormData();
      formData.append('code', Hubcode);

      // if (selectedType === "Work") {
      //   formData.append('workspace_designation', 1);
      //   formData.append('workspace_manager', 1);
      // }
      // formData.append(
      //   "workspace_type",
      //   selectedType === "Personal" ? "personal" : "work"
      // );
      // console.log('Join Hub By Code FormData:', formData);

      await PostJoinHubByCodeApi(formData)
        .then(res => {
          console.log('Join Hub By Code Response:', res);

          if (!res.success) {
            // Toast(res.message);
            console.log('Join Hub By Code Response:', res.message);
            toastRef?.current?.show({
              type: 'error',
              message: res?.message,
            });
          } else {
            toastRef?.current?.show({
              type: 'success',
              message: res?.message,
            });

            const handleHubid = async () => {
              await AsyncStorage1.setItem(
                'HubId',
                JSON.stringify(res?.data?.workspace_id),
              );
            };

            handleHubid();
            handleSkipForNow();
          }
          // console.log('Join Hub By Code Response:', res);
        })
        .catch(error => {
          console.log('Join Hub By Code Error:', error);
        });
    };

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
        <View style={styles.headerCurve} />
        <ScrollView
          contentContainerStyle={[
            styles.formContentContainer,
            { paddingTop: 35 },
          ]}
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
                // hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <BackArrowSvg width="19" height="19" />
              </TouchableOpacity>
            </View>

            <SectionTitle marginBottom={10} style={{ paddingLeft: 5 }}>
              Join a Hub
            </SectionTitle>
          </View>

          <Subtitle marginBottom={10}>
            Enter code or link to join and start collaborating.
          </Subtitle>

          <Text style={styles.inputLabel}>Hub Name</Text>
          <TextInput
            style={styles.textInput}
            value={Hubcode}
            onChangeText={setHubCode}
            placeholder="Enter Hub code"
            placeholderTextColor={DarkCOlor30}
            allowFontScaling={false}
          />
          {selectedType === 'Work' && (
            <>
              <Text style={styles.inputLabel}>Designation</Text>
              <TextInput
                style={styles.textInput}
                value={Designation}
                onChangeText={setDesignation}
                placeholder="Enter Designation"
                placeholderTextColor={DarkCOlor30}
                allowFontScaling={false}
              />

              <Text style={styles.inputLabel}>Line Manager</Text>
              <TextInput
                style={styles.textInput}
                value={LineManager}
                onChangeText={setLineManager}
                placeholder="Enter Line Manager"
                placeholderTextColor={DarkCOlor30}
                allowFontScaling={false}
              />
            </>
          )}

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
                <Text style={styles.continueButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  },
);

const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(2);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Confirmedpassword, setConfirmedpassword] = useState('');
  const [secureTextEntryPassword, setSecureTextEntrypassword] = useState(true);
  const [
    secureTextEntryConfirmedpassword,
    setSecureTextEntryConfirmedpassword,
  ] = useState(true);
  const [VerifyCode, setVerifyCode] = useState('');
  const [AuthStatus, setAuthStatus] = useState('');
  const [history, setHistory] = useState([0]);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(20);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [selectedType, setSelectedType] = useState('Personal');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [First_name, setFirst_name] = useState('');
  const [Last_name, setLast_name] = useState('');
  const [is_new_user, setIs_new_user] = useState(true);
  const [HubName, setHubName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizations, setOrganizations] = useState([{ id: 1, name: '' }]);
  const [HubLogo, setHubLogo] = useState(null);
  const [Hubid, setHubid] = useState('');
  const [HubData, setHubData] = useState([]);
  const [Hubcode, setHubCode] = useState('');
  const [LineManager, setLineManager] = useState('');
  const [Designation, setDesignation] = useState('');
  const [isEmailSignUp, setIsEmailSignUp] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const toastRef = useRef(null);

  // ------ ASSETS -------
  const CreateAccountScreenImage = require('../assets/LoginAssets/png/CreateAccountImage.png');
  const StandingAstroImage = require('../assets/LoginAssets/png/StandingAstronot.png');
  const SelectContainer = require('../assets/Png/SelectedGroupMemberImage.png');
  const EmailImage = require('../assets/LoginAssets/png/EmailImage.png');
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

  const { connect } = useWebSocket();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const navigateToStep = step => {
    setHistory(prevHistory => [...prevHistory, step]);
    setCurrentStep(step);
  };

  const handleBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      // console.log('newHistory', newHistory);
      setHistory(newHistory);
      setCurrentStep(newHistory[newHistory.length - 1]);
    }
  }, [history]);

  useEffect(() => {
    const backAction = () => {
      if (history.length > 1) {
        handleBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [history, handleBack]);

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

  const handleAuthAction = action => {
    setAuthStatus(action);
    navigateToStep(2);
  };
  const handleEmailSignUp = () => navigateToStep(3);

  const handleCreateWorkspace = async () => {
    try {
      if (!HubName || !HubName.trim()) {
        Alert.alert('Error', 'Please enter a Hub name');
        return;
      }

      const formData = new FormData();

      formData.append('name', HubName);
      formData.append(
        'workspace_type',
        selectedType === 'Personal' ? 'personal' : 'work',
      );

      const response = await PostCreateWorkSpaceApi(formData);
      setHubid(response?.data?.workspace_id);
      await AsyncStorage1.setItem(
        'HubId',
        JSON.stringify(response?.data?.workspace_id),
      );
      await AsyncStorage1.setItem('isLoggedIn', 'true');
      setCurrentStep(7);
    } catch (error) {
      console.error('Error creating workspace:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create workspace. Please try again.',
      );
    }
  };

  const HandleVeriftOpt = async () => navigateToStep(5);

  const handleInternalStore = async res => {
    try {
      setHubData(res?.data?.workspaces);
      const accessToken = res?.data?.tokens?.access?.token;
      const refreshToken = res?.data?.tokens?.refresh?.token;

      if (!accessToken) {
        throw new Error('No access token found in response');
      }

      dispatch(
        setLoginData({
          accessToken,
          refreshToken,
          user: res?.data,
          workspaces: res?.data?.workspaces || [],
        }),
      );

      // Store tokens
      const tokensFromApi = res?.data?.tokens;
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('tokens', tokensString);


      await AsyncStorage1.setItem('sessionId', JSON.stringify(accessToken));
      await AsyncStorage1.setItem(
        'Rreferesh_sessionId',
        JSON.stringify(refreshToken || ''),
      );

      // Store user data
      await AsyncStorage1.setItem('userLoginResponse', JSON.stringify(res));

      if (res?.data?.workspaces?.length > 0) {
        setCurrentStep(8);
      } else {
        setCurrentStep(5);
      }

      // if (connect && typeof connect === 'function') {
      connect();
      // }
    } catch (error) {
      console.error('Error in handleInternalStore:', error);

      Alert.alert('Error', 'Failed to process login. Please try again.');
    }
  };

  const emailRejext = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleAppleSignUp = async () => {
    if (!isChecked) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }
    console.log('handleAppleSignUp --==---->', JSON.stringify(AuthStatus));
    const result = await signInWithApple(AuthStatus);
    if (result?.success && result?.shouldNavigate) {
      // console.log('result --==---->', JSON.stringify(result?.data));
      connect();
      if (result?.data?.data?.workspaces?.length > 0) {
        console.log('page 8 --==---->');
        setHubData(result?.data?.data?.workspaces);
        setCurrentStep(8);
      } else {
        console.log('page 5 --==---->');
        setCurrentStep(5);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isChecked) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    try {
      const result = await signInWithGoogle(AuthStatus);
      if (result?.success && result?.shouldNavigate) {
        // console.log('result --==---->', JSON.stringify(result?.data));
        connect();
        if (result?.data?.data?.workspaces?.length > 0) {
          console.log('page 8 --==---->');
          setHubData(result?.data?.data?.workspaces);
          setCurrentStep(8);
        } else {
          console.log('page 5 --==---->');
          setCurrentStep(5);
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    }
  };

  const HandleLoginWithOTP = async () => {
    if (!isChecked) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }
    if (!emailRejext(email)) return;
    let data = { email: email, login_type: 'email_otp' };
    try {
      const res = await loginUser(data);
      if (!res?.success) {
        Alert.alert('Error', res?.message);
      } else {
        setIs_new_user(res?.data?.is_new_user);
        setCountdown(res?.data?.otp_rate_limit_window || 20);
        setIsResendDisabled(true);
        setOtpModalVisible(true);
      }
    } catch (err) {
      console.log('error in login with OTP =====>', err);
    }
  };

  const HandleOtpVerification = async () => {
    try {
      let requestData =
        AuthStatus === 'SignUp'
          ? {
            email,
            password,
            first_name: First_name,
            last_name: Last_name,
            mobile: PhoneNumber,
            login_type: 'email_otp',
            otp: otpCode,
            is_new_user,
          }
          : { email, otp: otpCode, login_type: 'email_otp', is_new_user };

      const res = await loginUser(requestData);
      if (!res?.success) {
        Alert.alert('Error', res?.message || 'Verification failed');
      } else {
        setOtpModalVisible(false);
        handleInternalStore(res);
      }
    } catch (error) {
      console.error('Error in OTP verification:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred during verification',
      );
    }
  };

  const handleLoginWithPassword = async () => {
    if (!emailRejext(email)) return;
    let data = { email, password, login_type: 'normal' };
    try {
      const res = await loginUser(data);
      if (!res?.success) {
        Alert.alert('Error', res?.message || 'Login Failed');
      } else {
        handleInternalStore(res);
      }
    } catch (err) {
      console.log('error in login with password =====>', err);
    }
  };

  const handleSignUpWithPassword = async () => {
    if (!emailRejext(email)) return;
    if (password !== Confirmedpassword)
      return Alert.alert('Error', 'Passwords do not match.');

    const data = {
      email,
      password,
      first_name: First_name,
      last_name: Last_name,
      mobile: PhoneNumber,
      login_type: 'email_otp',
    };
    try {
      const res = await loginUser(data);
      if (!res?.success) {
        Alert.alert('Error', res?.message);
      } else {
        setIs_new_user(res?.data?.is_new_user);
        setOtpModalVisible(true);
      }
    } catch (err) {
      console.log('error in signup =====>', err);
    }
  };

  const handleResendOtp = () => {
    HandleLoginWithOTP();
  };

  const toggleOtpModal = () => setOtpModalVisible(!isOtpModalVisible);

  const handleSkipForNow = async () => {
    // Navigate to the next screen or perform any other action
    await AsyncStorage1.setItem('isLoggedIn', 'true');
    // await AsyncStorage1.setItem('isHubCreated', 'true');
    navigation.replace('Home');
    // console.log('Skipped sharing');

    connect();
  };

  const renderOtpModal = () => (
    <Modal
      visible={isOtpModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleOtpModal}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SectionTitle size={24} marginBottom={30}>
              Verify OTP
            </SectionTitle>
            <View style={styles.form}>
              <Text allowFontScaling={false} style={styles.inputLabel}>
                Verification Code
              </Text>
              <TextInput
                allowFontScaling={false}
                style={styles.textInput}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={true}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.continueButton,
                { width: '100%', borderRadius: 10, paddingVertical: 15 },
              ]}
              onPress={HandleOtpVerification}>
              <Text allowFontScaling={false} style={styles.continueButtonText}>
                Verify & Continue
              </Text>
            </TouchableOpacity>
            <View style={styles.resendContainer}>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isResendDisabled}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.RedtextStyle,
                    isResendDisabled && styles.disabledText,
                  ]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
              {isResendDisabled && (
                <Text allowFontScaling={false} style={styles.countdownText}>
                  00:{countdown < 10 ? `0${countdown}` : countdown}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderGenericFormScreen = content => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar
            backgroundColor={mainOrangeColor}
            barStyle="light-content"
          />
          <View style={styles.headerCurve} />
          <ScrollView
            contentContainerStyle={styles.formContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const CreateWorkSpaceScreen = () => (
    <View style={styles.container}>
      <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
      <View style={styles.headerCurve} />
      <View style={styles.workspaceOuterContainer}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 25,
            paddingTop: 50,
            paddingBottom: 20,
          }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                maxWidth: 500,
                alignItems: 'center',
                marginBottom: 10,
                position: 'relative',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={{
                    padding: 15,
                    marginLeft: 5,
                  }}
                  activeOpacity={0.7}>
                  <BackArrowSvg />
                </TouchableOpacity>
              </View>
              <SectionTitle
                style={{
                  textAlign: 'center',
                  lineHeight: 24,
                  paddingLeft: 50,
                  paddingRight: 40,
                  paddingTop: 20,
                }}>
                Create Your Hub
              </SectionTitle>
            </View>
            <Subtitle>Choose the type that best fits your needs</Subtitle>

            <Text style={styles.inputLabel}>Hub Name</Text>
            <TextInput
              style={styles.textInput}
              value={HubName}
              onChangeText={setHubName}
              placeholder="Enter Hub name"
              placeholderTextColor={DarkCOlor30}
              allowFontScaling={false}
            />
            <TouchableOpacity
              style={[
                styles.card,
                selectedType === 'Personal' && styles.selectedCard,
              ]}
              onPress={() => setSelectedType('Personal')}>
              <Image source={PerosnImage} style={styles.cardIcon} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Personal</Text>
                <Text style={styles.cardSubtitle}>
                  For individuals & personal projects
                </Text>
              </View>
              {selectedType === 'Personal' && (
                <Image source={SelectContainer} style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.card,
                selectedType === 'Work' && styles.selectedCard,
              ]}
              onPress={() => setSelectedType('Work')}>
              <Image source={WorkImage} style={styles.cardIcon} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Work</Text>
                <Text style={styles.cardSubtitle}>
                  For team collaboration & business
                </Text>
              </View>
              {selectedType === 'Work' && (
                <Image source={SelectContainer} style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>

            <View style={[styles.bottomButtonContainer, { width: '100%' }]}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleCreateWorkspace}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.orText}>Or</Text>
          </View>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => {
                navigateToStep(9);
              }}>
              <Text style={styles.joinButtonText}>Join Hub</Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }} onPress={handleSkipForNow}>
            <Text allowFontScaling={false} style={styles.SkipTextStyle}>
              Skip Now
            </Text>
          </TouchableOpacity> */}
        </ScrollView>
      </View>
    </View>
  );

  const HubCreatedScreen = ({
    Hubid,
    HubName,
    HubLogo,
    selectedType,
    onSkip,
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch share link when component mounts
    useEffect(() => {
      const fetchShareLink = async () => {
        if (!Hubid) return;

        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append('workspace_id', Hubid);
          const response = await GetWorkSpaceCode(formData);
          // console.log('Share link: --chec==>', response);

          setShareLink(response);
        } catch (error) {
          console.error('Error fetching share link:', error);
          Alert.alert('Error', 'Failed to generate share link');
        } finally {
          setIsLoading(false);
        }
      };

      fetchShareLink();
    }, [Hubid]);

    const handleCopyLink = async () => {
      if (!shareLink) {
        Alert.alert('Error', 'Share link not available');
        return;
      }
      await Clipboard.setString(shareLink?.data?.code);
      // Alert.alert('Success', 'Link copied to clipboard');
    };

    const handleShare = async method => {
      if (!shareLink) {
        Alert.alert('Error', 'Share link not available');
        return;
      }

      const message = `Join my hub on Riggle: ${shareLink?.data?.share_template}`;

      try {
        if (method === 'whatsapp') {
          const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
          await Linking.openURL(url);
        } else if (method === 'email') {
          const url = `mailto:?subject=Join my Riggle Hub&body=${encodeURIComponent(
            message,
          )}`;
          await Linking.openURL(url);
        } else if (method === 'sms') {
          const url = `sms:?body=${encodeURIComponent(message)}`;
          await Linking.openURL(url);
        }
      } catch (error) {
        console.error(`Error sharing via ${method}:`, error);
        Alert.alert('Error', `Could not open ${method}`);
      }
    };

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={mainOrangeColor} barStyle="light-content" />
        <View style={styles.headerCurve} />
        <ScrollView
          contentContainerStyle={styles.formContentContainer}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.formIconContainer, { marginBottom: 20 }]}>
            <Image source={HubCreateImage} style={styles.formIcon} />
          </View>
          <SectionTitle>Hub Created!</SectionTitle>
          <Subtitle marginBottom={10}>Invite others to join your Hub</Subtitle>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: mainWhiteColor,
              paddingHorizontal: 16,
              width: '100%',
            }}>
            {/* Hub Card */}
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                backgroundColor: mainWhiteColor,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#FFD6B0',
                padding: 24,
                marginTop: 5,
                paddingVertical: 5,
              }}>
              <Image
                source={HubLogo ? { uri: HubLogo.uri } : NullImageHub}
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 2,
                  resizeMode: 'contain',
                }}
                resizeMode="contain"
              />
              <View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: 18,
                    color: DarkColor,
                    marginBottom: 0,
                  }}>
                  {HubName}
                </Text>
                <View
                  style={{
                    borderRadius: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    marginBottom: 4,
                    alignSelf: 'center',
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: fonts.PoppinsMedium,
                      fontSize: 12,
                      color: DarkColor60,
                    }}>
                    {selectedType}
                  </Text>
                </View>
              </View>
            </View>

            {/* Share your Hub */}
            <Text
              allowFontScaling={false}
              style={{
                alignSelf: 'flex-start',
                marginTop: 32,
                marginBottom: 12,
                fontFamily: fonts.PoppinsMedium,
                fontSize: 12,
                color: DarkColor,
              }}>
              Share your Hub
            </Text>

            {/* Share Buttons */}
            <View style={{ width: '100%' }}>
              {/* Copy Link */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F8F8',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
                onPress={handleCopyLink}
                disabled={isLoading}>
                <Image
                  source={copyCodeImage}
                  style={{ width: 22, height: 22, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: 14,
                    color: isLoading ? '#999' : DarkColor60,
                  }}>
                  {isLoading ? 'Loading...' : 'Copy code'}
                </Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F8F8',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
                onPress={() => handleShare('whatsapp')}
                disabled={isLoading}>
                <Image
                  source={WhatsAppImage}
                  style={{ width: 22, height: 22, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: 14,
                    color: isLoading ? '#999' : DarkColor60,
                  }}>
                  WhatsApp
                </Text>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F8F8',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
                onPress={() => handleShare('email')}
                disabled={isLoading}>
                <Image
                  source={require('../assets/LoginAssets/png/EmailImage.png')}
                  style={{ width: 22, height: 22, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: 14,
                    color: isLoading ? '#999' : DarkColor60,
                  }}>
                  Email
                </Text>
              </TouchableOpacity>

              {/* SMS */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F8F8',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
                onPress={() => handleShare('sms')}
                disabled={isLoading}>
                <Image
                  source={SmsImage}
                  style={{ width: 22, height: 22, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: fonts.PoppinsMedium,
                    fontSize: 14,
                    color: isLoading ? '#999' : DarkColor60,
                  }}>
                  SMS
                </Text>
              </TouchableOpacity>
            </View>

            {/* Let's Go Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#FF965A',
                borderRadius: 10,
                width: '100%',
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 28,
                opacity: isLoading ? 0.6 : 1,
              }}
              onPress={handleSkipForNow}
              disabled={isLoading}>
              <Text
                allowFontScaling={false}
                style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>
                {isLoading ? 'Loading...' : 'Let’s Go'}
              </Text>
            </TouchableOpacity>

            {/* Skip for now */}
            <TouchableOpacity
              style={{ marginTop: 18 }}
              onPress={handleSkipForNow}>
              <Text
                allowFontScaling={false}
                style={{
                  color: '#FF965A',
                  fontSize: 12,
                  textDecorationLine: 'underline',
                }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const HubListingScreen = () => {
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
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          width: '100%',
        }}
        onPress={async () => {
          console.log('Selected hub:', item.id);
          await AsyncStorage1.setItem('HubId', JSON.stringify(item.id));
          handleSkipForNow();
        }}>
        <View
          style={{
            width: 45,
            height: 45,
            borderWidth: 1,
            borderColor: DarkColor60,
            borderRadius: 35,
            marginRight: 16,
          }}>
          <Image
            source={item?.logo ? { uri: item?.logo } : RocketImage}
            style={{
              width: 40,
              height: 40,
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
            <Text
              style={{
                fontFamily: fonts.PoppinsSemiBold,
                fontSize: 14,
                color: DarkColor,
              }}>
              {item?.name}
            </Text>
            {/* <DropDownSvg 
              width={14} 
              height={14} 
              color="#666" 
              fillOpacity={0.8} 
            /> */}
          </View>
          {/* <View style={{ flexDirection: 'row', marginTop: 4 }}>

            <Text style={{
              fontFamily: fonts.PoppinsRegular,
              fontSize: 12,
              color: DarkColor60
            }}>
              {item?.members[0]?.role}
            </Text>
          </View> */}
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
            data={HubData}
            renderItem={renderHubItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.formContentContainer}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<SectionTitle>Existing Hubs</SectionTitle>}
            ListFooterComponent={
              <>
                <Text style={[styles.orText, { alignSelf: 'center' }]}>Or</Text>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    { width: '100%', paddingHorizontal: 50 },
                  ]}
                  onPress={() => navigateToStep(5)}>
                  <Text style={styles.continueButtonText}>Create Hub</Text>
                </TouchableOpacity>
              </>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 2:
        return renderGenericFormScreen(
          <AuthMethodScreen
            authStatus={AuthStatus}
            onGoogleSignUp={handleGoogleSignUp}
            onEmailSignUp={handleEmailSignUp}
            createAccountImage={CreateAccountScreenImage}
            googleImage={GoogleImage}
            emailImage={EmailImage}
            styles={styles}
            First_name={First_name}
            setFirst_name={setFirst_name}
            Last_name={Last_name}
            setLast_name={setLast_name}
            email={email}
            setEmail={setEmail}
            onResend={() => Alert.alert('Resend', 'Resend code functionality.')}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            VerifyCode={VerifyCode}
            setVerifyCode={setVerifyCode}
            onVerify={HandleLoginWithOTP}
            setIsEmailSignUp={setIsEmailSignUp}
            IsEmailSignUp={isEmailSignUp}
            setIsChecked={setIsChecked}
            isChecked={isChecked}
            onAppleSignUp={handleAppleSignUp}
          />,
        );
      case 3:
        return renderGenericFormScreen(
          <EmailPasswordForm
            authStatus={AuthStatus}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            Confirmedpassword={Confirmedpassword}
            setConfirmedpassword={setConfirmedpassword}
            secureTextEntryPassword={secureTextEntryPassword}
            setSecureTextEntrypassword={setSecureTextEntrypassword}
            secureTextEntryConfirmedpassword={secureTextEntryConfirmedpassword}
            setSecureTextEntryConfirmedpassword={
              setSecureTextEntryConfirmedpassword
            }
            setIsChecked={setIsChecked}
            First_name={First_name}
            setFirst_name={setFirst_name}
            Last_name={Last_name}
            setLast_name={setLast_name}
            PhoneNumber={PhoneNumber}
            setPhoneNumber={setPhoneNumber}
            onLoginWithOTP={HandleLoginWithOTP}
            onContinue={
              AuthStatus === 'Login'
                ? handleLoginWithPassword
                : handleSignUpWithPassword
            }
            formIcon={EmailFormIcon}
            styles={styles}
          />,
        );
      case 4:
        return renderGenericFormScreen(
          <EmailVerificationScreen
            VerifyCode={VerifyCode}
            setVerifyCode={setVerifyCode}
            onVerify={HandleVeriftOpt}
            onResend={() => Alert.alert('Resend', 'Resend code functionality.')}
            formIcon={EmailFormIcon}
            styles={styles}
            setIsChecked={setIsChecked}
          />,
        );
      case 5:
        return CreateWorkSpaceScreen();
      case 6:
        return (
          <TellUsMoreScreen
            title="Tell Us More"
            subtitle={
              selectedType === 'Personal'
                ? 'Just a few details'
                : "We'll need some work details"
            }
            styles={styles}
            selectedType={selectedType}
            onBack={handleBack}
            HubName={HubName}
            setHubName={setHubName}
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            organizations={organizations}
            setOrganizations={setOrganizations}
            mainOrange80={mainOrange80}
            mainOrangeColor={mainOrangeColor}
            DarkColor20={DarkColor20}
            DarkCOlor30={DarkCOlor30}
            DarkColor60={DarkColor60}
            hubLogo={HubLogo}
            setHubLogo={setHubLogo}
            setCurrentStep={setCurrentStep}
            setHubid={setHubid}
          // setApkLoading={setApkLoading}
          />
        );
      case 7:
        return (
          <HubCreatedScreen
            Hubid={Hubid}
            HubName={HubName}
            HubLogo={HubLogo}
            selectedType={selectedType}
            onSkip={handleSkipForNow}
          />
        );
      case 8:
        return <HubListingScreen />;
      case 9:
        return (
          <JoinHubScreen
            selectedType={selectedType}
            Hubcode={Hubcode}
            setHubCode={setHubCode}
            Designation={Designation}
            setDesignation={setDesignation}
            LineManager={LineManager}
            setLineManager={setLineManager}
            navigateToStep={navigateToStep}
            handleSkipForNow={handleSkipForNow}
            toastRef={toastRef}
          />
        );
      default:
        return renderGenericFormScreen(
          <AuthMethodScreen
            authStatus={AuthStatus}
            onGoogleSignUp={handleGoogleSignUp}
            onEmailSignUp={handleEmailSignUp}
            createAccountImage={CreateAccountScreenImage}
            googleImage={GoogleImage}
            emailImage={EmailImage}
            styles={styles}
            First_name={First_name}
            setFirst_name={setFirst_name}
            Last_name={Last_name}
            setLast_name={setLast_name}
            email={email}
            setEmail={setEmail}
            onResend={() => Alert.alert('Resend', 'Resend code functionality.')}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            VerifyCode={VerifyCode}
            setVerifyCode={setVerifyCode}
            onVerify={HandleLoginWithOTP}
            setIsEmailSignUp={setIsEmailSignUp}
            IsEmailSignUp={isEmailSignUp}
            setIsChecked={setIsChecked}
          />,
        );
    }
  };

  return (
    <>
      {renderCurrentStep()}
      {renderOtpModal()}
      <Toast ref={toastRef} />
    </>
  );
};

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
  formContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
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
    borderColor: lightGrayBorder,
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
    color: RedColor,
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
});

export default SignInScreen;
