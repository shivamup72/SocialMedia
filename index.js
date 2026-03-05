import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Only setup Firebase messaging on Android
if (Platform.OS === 'android') {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
}

AppRegistry.registerComponent(appName, () => App);
