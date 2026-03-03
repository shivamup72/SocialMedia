import { LoginApi, RefreshTokenApi, CreateAccountApi } from './apiUrls';
import axios from 'axios';
import AsyncStorage1 from './AsyncStorage';
////////////////  signUp ///////////////
export const SignUpUser = formData => {
  return new Promise((resolve, reject) => {
    fetch(CreateAccountApi, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(async response => {
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an invalid response');
        }

        const data = await response.json();

        if (!response.ok) {
          console.error('Sign Up failed:', data);
          throw new Error(data.detail || data.message || 'Sign Up failed');
        }

        console.log('Sign Up successful:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Sign Up error:', error);
        reject(error);
      });
  });
};

//////////////////

export const verifyOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    if (!email || !otp) {
      reject(new Error('Email and OTP are required'));
      return;
    }

    fetch(LoginApi + 'verify_otp/', {
      // Assuming the endpoint is '/verify_otp/'
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.detail || data.message || 'OTP verification failed',
          );
        }
        return data;
      })
      .then(res => resolve(res))
      .catch(error => {
        console.error('OTP verification error:', error);
        reject(error);
      });
  });
};

export const loginUser = email => {
  return new Promise((resolve, reject) => {
    // Always send as FormData to match Postman (for joining_code, verification_code, etc.)
    let payload = email;
    let isFormData = false;
    if (!(email instanceof FormData)) {
      isFormData = true;
      payload = new FormData();
      Object.keys(email).forEach(key => {
        if (email[key] !== undefined && email[key] !== null) {
          payload.append(key, String(email[key]));
        }
      });
    }
    const fetchOptions = {
      method: 'POST',
      body: payload,
    };
    // Do not set Content-Type header for FormData, let browser/node set it
    console.log('Login fetch options:', LoginApi, payload);
    fetch(LoginApi, fetchOptions)
      .then(async response => {
        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Invalid response from server');
        }
        if (!response.ok) {
          throw new Error(
            data.detail || data.message || data.error || 'Login failed',
          );
        }
        resolve({ ...data, email });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const refreshToken = async refreshToken => {
  try {
    // console.log('Refresh token function called with token:', refreshToken);

    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const response = await fetch(RefreshTokenApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    // console.log('Refresh token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('Refresh token error response:', errorText);
      // throw new Error('Token refresh failed: ' + (errorText || response.statusText));
    }

    const data = await response.json();
    // console.log('Refresh token successful, new access token received');

    if (data.access) {
      const tokensFromApi = response.data.tokens;
      const tokensString = JSON.stringify(tokensFromApi);
      await AsyncStorage1.setItem('token', tokensString);

      await AsyncStorage1.setItem('sessionId', data.access); // Removed JSON.stringify
    }

    if (data.refresh) {
      await AsyncStorage1.setItem('Rreferesh_sessionId', data.refresh);
    }

    return data.access;
  } catch (error) {
    // console.error('Token refresh error in Auth:', error);
    // throw error;
  }
};
