import React, {createContext, useState, useEffect, useContext} from 'react';
import {Alert, Platform} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import Keychain from 'react-native-keychain';
import {LoginApi} from '../config/apiUrls';
import Config from 'react-native-config';
import AsyncStorage1 from '../config/AsyncStorage';

const AuthContext = createContext({});
const GOOGLE_OAUTH2_CLIENT_ID =
  '756735004940-7o26so8u9n4iigi9p337m93uv26astis.apps.googleusercontent.com';
const APPLE_OAUTH2_CLIENT_ID =
  '756735004940-vdcl2eheev6nk1a3q3lu659g6ta01pre.apps.googleusercontent.com';
const APPLE_SERVICE_ID = 'com.riggleapp.rigglex.login';

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_OAUTH2_CLIENT_ID,
      iosClientId: APPLE_OAUTH2_CLIENT_ID,
    });

    loadTokenFromKeychain();
  }, []);

  const loadTokenFromKeychain = async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        // In a real app, you would verify this token with your backend
        // and fetch user data before setting the state.
        setToken(credentials.password);
        // Example: const userData = await api.get('/me', { token });
        // setUser(userData);
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed.", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async authStatus => {
    try {
      // First, sign out to ensure a clean state
      await GoogleSignin.signOut();

      // Check if device has Google Play Services
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Configure Google Sign-In
      await GoogleSignin.configure({
        webClientId: GOOGLE_OAUTH2_CLIENT_ID,
        iosClientId: APPLE_OAUTH2_CLIENT_ID,
      });

      // Sign in and get user info
      const userInfo = await GoogleSignin.signIn();
      console.log('Google User Info:', userInfo);

      // Get the ID token
      const {idToken} = await GoogleSignin.getTokens();
      console.log('Google ID Token:', idToken);

      if (!idToken) {
        throw new Error('Google sign in failed: Unable to retrieve ID token');
      }

      const formData = new FormData();
      formData.append('id_token', idToken);
      formData.append('login_type', 'google');

      if (authStatus === 'SignUp') {
        formData.append('is_new_user', true);
      }

      console.log('Google Sign In Data:', formData);

      const response = await fetch(LoginApi, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log('Google Sign In Response:', JSON.stringify(responseData));

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Server Error:', response.status, errorBody);
        throw new Error(
          responseData.message || 'Google sign-in failed on the server',
        );
      }

      // Store tokens and user data
      const accessToken = responseData?.data?.tokens?.access?.token;
      const refreshToken = responseData?.data?.tokens?.refresh?.token;
      const userData = responseData?.data?.user;

      if (!accessToken) {
        throw new Error('No access token found in response');
      }
      const tokensFromApi = responseData?.data?.tokens;
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('tokens', tokensString);

      await AsyncStorage1.setItem('isLoggedIn', 'true');
      await AsyncStorage1.setItem('sessionId', JSON.stringify(accessToken));
      await AsyncStorage1.setItem(
        'Rreferesh_sessionId',
        JSON.stringify(refreshToken) || '',
      );
      await AsyncStorage1.setItem(
        'userLoginResponse',
        JSON.stringify(responseData),
      );

      // Update context
      setUser(userData);
      setToken(accessToken);

      // Return success with navigation flag
      return {
        success: true,
        data: responseData,
        shouldNavigate: true, // Flag to indicate navigation should happen
      };
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google login.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services Error',
          'Please update or enable Google Play Services.',
        );
      } else {
        console.error('Google Sign-In Error:', error);

        console.log('\n', 'Google Sign-In Error:', error, '\n');
        Alert.alert(
          'Sign-In Error',
          `An unknown error occurred. Please try again.`,
        );
      }
      return {success: false};
    }
  };

  const signInWithApple = async authStatus => {
    console.log('Apple Sign-In supported:', appleAuth.isSupported);
    if (!appleAuth.isSupported) {
      throw new Error('Apple Sign-In is not supported on this device');
    }

    try {
      // Perform login request
      const appleAuthRequestResponse = await appleAuth.performRequest(
        {
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        },
        {
          clientId: APPLE_SERVICE_ID,
        },
      );

      const {identityToken, nonce, fullName, email} = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed: No identity token returned');
      }

      // 3. Prepare request to your backend
      const formData = new FormData();
      formData.append('id_token', identityToken);
      formData.append('login_type', 'apple');
      formData.append('nonce', nonce);

      // 4. Send to your backend
      const response = await fetch(LoginApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Apple Sign-In API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.message || 'Failed to authenticate with server',
        );
      }

      const responseData = await response.json();

      /// Store tokens and user data
      const accessToken = responseData?.data?.tokens?.access?.token;
      const refreshToken = responseData?.data?.tokens?.refresh?.token;
      const userData = responseData?.data?.user;
      if (!accessToken) {
        throw new Error('No access token found in response');
      }

      const tokensFromApi = responseData?.data?.tokens;
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('tokens', tokensString);

      await AsyncStorage1.setItem('isLoggedIn', 'true');
      await AsyncStorage1.setItem('sessionId', JSON.stringify(accessToken));
      await AsyncStorage1.setItem(
        'Rreferesh_sessionId',
        JSON.stringify(refreshToken) || '',
      );
      await AsyncStorage1.setItem(
        'userLoginResponse',
        JSON.stringify(responseData),
      );

      // Update context
      setUser(userData);
      setToken(accessToken);

      return {
        success: true,
        data: responseData,
        shouldNavigate: true,
      };
    } catch (error) {
      console.error('Apple Sign-In Error:', {
        message: error.message,
        code: error.code,
        userInfo: error.userInfo,
      });

      if (error.code !== appleAuth.Error.CANCELED) {
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to sign in with Apple. Please try again.',
        );
      }

      return {success: false, error: error.message};
    }
  };

  const signOut = async () => {
    try {
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }
      await Keychain.resetGenericPassword();
      setUser(null);
      setToken(null);
    } catch (e) {
      console.error('Sign out error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
