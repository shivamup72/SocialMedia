import FlashMessage, {showMessage} from 'react-native-flash-message';
import AsyncStorage1 from './AsyncStorage';
import mime from 'mime';

export async function checkLoginStatus() {
  try {
    const session = await AsyncStorage1.getItem('isLoggedIn');
    if (session === 'true' || session === true) {
      return session;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function loggedIn() {
  try {
    const session = await AsyncStorage1.getItem('isLoggedIn');
    if (session === 'true' || session === true) {
      return session;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export const storeData = async (key, value) => {
  try {
    await AsyncStorage1.setItem(key, value);
  } catch (e) {
    return e;
  }
};

export const getData = async key => {
  try {
    const res = await AsyncStorage1.getItem(key);
    return res;
  } catch (e) {
    return e;
    // error reading value
  }
};

export const showError = message => {
  showMessage({
    type: 'danger',
    icon: 'danger',
    message,
    duration: 2500,
  });
};

export const showSucess = message => {
  showMessage({
    type: 'success',
    icon: 'success',
    message,
    duration: 2500,
  });
};

export const getFirstName = fullName => {
  var name = '';
  if (!!fullName) {
    const wordsArray = fullName.split(' ');
    if (wordsArray.length > 1) {
      name = wordsArray[0].charAt(0) + wordsArray[1].charAt(0);
    } else {
      name = wordsArray[0].charAt(0);
    }
  }
  return name;
};

export const getMediaType = media => {
  const mimeType = mime.getType(media);
  if (mimeType && mimeType.startsWith('video')) {
    return 'video';
  }
  return 'other';
};
