import axios from 'axios';
import AsyncStorage1 from './AsyncStorage';
import { Alert } from 'react-native';
import RNRestart from 'react-native-restart';
// Add this at the top of the file with other imports
import { store } from '../../redux/store';

export async function getHeaders(isFromAuth) {
  let sessionId = await AsyncStorage1.getItem('sessionId');
  let workspaceId = await AsyncStorage1.getItem('HubId');
  console.log('sessionId getHeaders', sessionId);
  console.log('workspaceId getHeaders', workspaceId);

  if (isFromAuth === true) {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionId}`,
        'X-Hub-ID': workspaceId,
      },
    };
  } else {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionId}`,
        'X-Hub-ID': workspaceId,
      },
    };
  }
}

export async function getFormHeaders(isFromAuth) {
  let sessionId = await AsyncStorage1.getItem('sessionId');
  let workspaceId = await AsyncStorage1.getItem('HubId');

  if (isFromAuth === true) {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionId}`,
        'X-Hub-ID': workspaceId,
      },
    };
  } else {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionId}`,
        'X-Hub-ID': workspaceId,
      },
    };
  }
}

export async function apiReq(endPoint, data, method, isFromAuth) {
  return new Promise(async (res, rej) => {
    const headers = await getHeaders(isFromAuth);

    console.log('headers apiReq ======>', headers);

    if (method === 'delete') {
      let axiosConfig = { ...headers, params: data };

      axios[method](endPoint, axiosConfig, axiosConfig)
        .then(result => {
          const { data } = result;
          if (data.status === false) {
            return rej(data);
          }
          return res(data);
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            alert('user not valid');
          }
          if (error && error.response && error.response.data) {
            if (!error.response.data.message) {
              return rej({
                ...error.response.data,
                message: error.response.data.message || 'Network Error',
              });
            }
            return rej(error.response.data);
          } else {
            return rej({ message: 'Network Error', message: 'Network Error' });
          }
        });
    } else {
      axios[method](endPoint, data, headers)
        .then(result => {
          const { data } = result;
          if (data.status === false) {
            return rej(data);
          }
          return res(data);
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            alert('user not valid');
          }

          if (error && error.response && error.response.status === 403) {
            alert('You do not have permission to perform this action.');
          }
          if (error && error.response && error.response.data) {
            if (!error.response.data.message) {
              return rej({
                ...error.response.data,
                message: error.response.data.message || 'Network Error',
              });
            }
            return rej(error.response.data);
          } else {
            return rej({ message: 'Network Error', message: 'Network Error' });
          }
        });
    }
    // console.log('\n');
  });
}

export async function apiGetData1(endPoint, data, method) {
  let sessionId = await AsyncStorage1.getItem('sessionId');
  let workspaceId = await AsyncStorage1.getItem('HubId');
  return new Promise(async (res, rej) => {
    axios
      .get(endPoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
          'X-Hub-ID': workspaceId,
        },
        params: data,
      })
      .then(result => {
        const { data } = result;
        if (data.status === false) {
          return rej(data);
        }
        return res(data);
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          //logout user
          showAlert('Login required.-->401');
        }
        if (error && error.response && error.response.data) {
          if (!error.response.data.message) {
            return rej({
              ...error.response.data,
              message: error.response.data.message || 'Network Error',
            });
          }
          return rej(error.response.data);
        } else {
          return rej({ message: 'Network Error', message: 'Network Error' });
        }
      });
  });
}

let cachedToken = null;
let lastTokenFetch = 0;
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

const getCachedToken = getState => {
  const now = Date.now();
  if (!cachedToken || now - lastTokenFetch > TOKEN_REFRESH_INTERVAL) {
    const state = getState ? getState() : store.getState();
    console.log('state check data ---==---->', JSON.stringify(state));
    cachedToken = state?.auth?.accessToken;
    lastTokenFetch = now;
  }
  return cachedToken;
};

export const apiGetData = (endPoint, params = {}) => {
  return async (dispatch, getState) => {
    const makeRequest = async (useCache = true) => {
      const token = getCachedToken(getState);
      let workspaceId = await AsyncStorage1.getItem('HubId');
      if (!token) throw new Error('Authentication token is missing.');

      try {
        const response = await axios.get(endPoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Workspace-ID': workspaceId,
          },
          params,
        });
        return response.data;
      } catch (error) {
        if (error?.response?.status === 401 && !useCache) {
          throw error; // Prevent infinite loop
        }
        throw error;
      }
    };

    try {
      return await makeRequest();
    } catch (error) {
      if (error?.response?.status === 401 && dispatch) {
        try {
          await dispatch(refreshToken());
          // Retry with fresh token, disable cache for this attempt
          return await makeRequest(false);
        } catch (refreshError) {
          throw refreshError;
        }
      }

      if (error?.response?.data) {
        throw {
          ...error.response.data,
          message: error.response.data.message || 'Network Error',
        };
      }
      throw error;
    }
  };
};

export const callApiGetData = (endPoint, params = {}) => {
  const thunk = apiGetData(endPoint, params);
  return thunk(store.dispatch, store.getState);
};

export async function uploadWithImage(endPoint, data, method, isFromAuth) {
  console.log('endPoint -=-=->', endPoint);
  return new Promise(async (res, rej) => {
    const headers = await getFormHeaders(isFromAuth);
    // console.log('headers uploadWithImage',headers);
    axios[method](endPoint, data, headers)
      .then(result => {
        const { data } = result;
        if (data.status === false || data === null) {
          // console.log('error response data in side data.status === false || data === null ',error);
          return rej(data);
        }
        return res(data);
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          showAlert('Login required.-->401');
        }
        if (error && error.response && error.response.data) {
          // console.log('error response data',error);
          if (!error.response.data.message) {
            return rej({
              ...error.response.data,
              message: error.response.data.message || 'Network Error',
            });
          }
          return rej(error.response.data);
        } else {
          // console.log('error response data 2',error);
          return rej({ message: 'Network Error', message: 'Network Error' });
        }
      });
  });
}

export function apiPost(endPoint, data, isAuth) {
  return apiReq(endPoint, data, 'post', isAuth);
}

export function apiDelete(endPoint, data, isAuth) {
  return apiReq(endPoint, data, 'delete', isAuth);
}

export function apiPostForm(endPoint, data, isAuth) {
  return uploadWithImage(endPoint, data, 'post', isAuth);
}

export function apiGet(endPoint, data) {
  return apiGetData1(endPoint, data, 'get');
}

export function apiPut(endPoint, data, isAuth) {
  return apiReq(endPoint, data, 'put', isAuth);
}

export function apiUpdate(endPoint, data, isAuth) {
  return apiReq(endPoint, data, 'patch', isAuth);
}

export function apiUpdateForm(endPoint, data, isAuth) {
  return uploadWithImage(endPoint, data, 'patch', isAuth);
}

const showAlert = message => {
  Alert.alert(
    'Unauthorization', // Title
    message, // Message
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => handleOkPress(),
        style: 'cancel',
      },
    ],
    { cancelable: false },
  );
};

const removeData = async () => {
  await AsyncStorage1.removeItem('isLoggedIn');
  await AsyncStorage1.removeItem('userLoginResponse');
};

const handleOkPress = () => {
  removeData();
  RNRestart.Restart();
};
