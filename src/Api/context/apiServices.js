import axios from 'axios';
import AsyncStorage1 from '../config/AsyncStorage'; // Assuming this is your AsyncStorage wrapper
import {Base_url} from '../config/apiUrls'; // Your base URL

const REFRESH_TOKEN_URL = '/auth/refresh-token';
const TOKEN_STORAGE_KEY = 'token';
const HUB_ID_STORAGE_KEY = 'HubId';

// --- Create a Reusable Axios Instance ---
const axiosInstance = axios.create({
  baseURL: Base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to add Auth Token to requests ---
axiosInstance.interceptors.request.use(
  async config => {
    // Only add the token if the request requires authentication (is_auth is not false)
    if (config.is_auth !== false) {
      const accessToken = await AsyncStorage1.getItem(TOKEN_STORAGE_KEY);
      // console.log('token', tokens);
      // const [settings, updateSettings] = useSettings();

      // console.log
      const hubId = await AsyncStorage1.getItem(HUB_ID_STORAGE_KEY);
      console.log('HubId from AsyncStorage in interceptor:', hubId);
      if (accessToken) {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          // config.headers['X-Hub-ID'] = hubId;
        }
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Interceptor to handle Token Refresh on 401 Errors ---
axiosInstance.interceptors.response.use(
  response => {
    return response; // Simply return the successful response
  },
  async error => {
    const originalRequest = error.config;

    // Check if the error is a 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await AsyncStorage1.getItem(TOKEN_STORAGE_KEY);
        const refreshToken = tokens?.refresh?.token;

        if (!refreshToken) {
          console.log('No refresh token available, redirecting to login.');
          return Promise.reject(error);
        }

        // Call your refresh token API
        const {data} = await axiosInstance.post(REFRESH_TOKEN_URL, {
          refreshToken: refreshToken,
        });

        // --- IMPORTANT ---
        // The structure of 'data' depends on your API response.
        // Assuming your API returns { access: { token: '...' }, refresh: { token: '...' } }
        const newTokens = {
          access: data.access?.token,
          refresh: data.refresh?.token,
        };

        await AsyncStorage1.setItem(
          TOKEN_STORAGE_KEY,
          JSON.stringify(newTokens),
        );

        const newAccessToken = newTokens.access.token;
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login if refresh fails
        // await AsyncStorage1.removeItem(TOKEN_STORAGE_KEY);
        // window.location = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, just reject the promise
    return Promise.reject(error);
  },
);

/**
 * Reusable API service function. All configurations are now handled by the Axios instance and interceptors.
 * @param {object} config - Axios request configuration object.
 * @param {AbortSignal} [config.signal] - Optional AbortController signal for request cancellation.
 * @param {boolean} [config.is_auth=true] - Whether authentication is required.
 * @returns {Promise} - Promise with the response data.
 */
const apiService = async config => {
  try {
    const response = await axiosInstance(config);
    // console.log('API Response:', JSON.stringify(response));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'API request failed';
    console.error('API Service Error:', errorMessage, '\n', '\n', error);

    // Instead of just throwing error, you can return a structured error object
    throw {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    };
  }
};

// --- Convenience Methods ---

export const apiGet = (
  url,
  queryParams = null,
  isAuth = true,
  signal = null,
) => {
  return apiService({
    method: 'get',
    url,
    params: queryParams,
    is_auth: isAuth,
    signal,
  });
};

export const apiPost = (
  url,
  payload = null,
  isFormData = false,
  isAuth = true,
  signal = null,
) => {
  const headers = {};
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return apiService({
    method: 'post',
    url,
    data: payload,
    headers,
    is_auth: isAuth,
    signal,
  });
};

export const apiPut = (
  url,
  payload = null,
  isFormData = false,
  isAuth = true,
  signal = null,
) => {
  const headers = {};
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return apiService({
    method: 'put',
    url,
    data: payload,
    headers,
    is_auth: isAuth,
    signal,
  });
};

export const apiPatch = (
  url,
  payload = null,
  isFormData = false,
  isAuth = true,
  signal = null,
) => {
  const headers = {};
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return apiService({
    method: 'patch',
    url,
    data: payload,
    headers,
    is_auth: isAuth,
    signal,
  });
};

export const apiDelete = (
  url,
  payload = null,
  isAuth = true,
  signal = null,
) => {
  return apiService({
    method: 'delete',
    url,
    data: payload,
    is_auth: isAuth,
    signal,
  });
};

export default apiService;
