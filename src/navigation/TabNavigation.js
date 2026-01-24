// TabNavigation.js
import React, {useEffect, useState, useMemo, useRef} from 'react';
import {
  View,
  ImageBackground,
  Pressable,
  StyleSheet,
  Animated,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';

import ToastContent from '../components/ToastContent';
import LinearGradient from 'react-native-linear-gradient';
import ScreenChat from '../Chatcomponents/ScreenChat';
import ScreenCircle from '../Screen/Circle/ScreenCircle';
import ScreenMore from '../Screen/More/ScreenMore';
import ScreenTimely from '../Screen/Timely/ScreenTimely';
import {useWebSocket} from '../Api/context/WebSocketServices';
import {fonts, mainOrangeColor} from '../utils/style/fonts';
import {RfW} from '../utils/helper';

const tabBackgrounds = [
  require('../assets/Png/timely-active.jpg'),
  require('../assets/Png/chat-active.jpg'),
  require('../assets/Png/circle-active.jpg'),
  require('../assets/Png/more-active.jpg'),
];

const TabNavigation = () => {
  const {lastMessage} = useWebSocket();

  const [activeTab, setActiveTab] = useState(1);
  const [hideTabBar, setHideTabBar] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastContent, setToastContent] = useState('');
  const [toastProfilePic, setToastProfilePic] = useState(null);
  const toastTimeoutRef = useRef(null);
  const toastAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const onBackPress = () => {
      if (activeTab !== 1) {
        setActiveTab(1);
        return true;
      } else {
        BackHandler.exitApp();
        return true;
      }
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }

    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
    };
  }, [activeTab]);

  const ScreenComponent = useMemo(() => {
    if (activeTab === 0) return <ScreenTimely setHideTabBar={setHideTabBar} />;
    if (activeTab === 1)
      return (
        <ScreenChat setHideTabBar={setHideTabBar} hideTabBar={hideTabBar} />
      );
    if (activeTab === 2) return <ScreenCircle />;
    if (activeTab === 3) return <ScreenMore setHideTabBar={setHideTabBar} />;
    return null;
  }, [activeTab, hideTabBar]);

  // Toast logic
  // Only show toast when a new message is received, not just on tab switch
  const lastShownMsgId = useRef(null);
  useEffect(() => {
    if (
      activeTab !== 1 &&
      lastMessage?.action === 'receive_new_message' &&
      lastMessage?.data?.id &&
      lastMessage?.data?.id !== lastShownMsgId.current
    ) {
      setToastMessage(lastMessage?.data?.sender_name);
      setToastContent(lastMessage?.data?.content);
      setToastProfilePic(
        lastMessage?.data?.profile_picture ||
          lastMessage?.data?.sender_profile_picture ||
          null,
      );
      setToastVisible(true);
      lastShownMsgId.current = lastMessage.data.id;

      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      toastTimeoutRef.current = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: -100,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1000);
    } else if (toastVisible) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: -100,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1000);
    }

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [lastMessage, activeTab]);

  return (
    <View style={{flex: 1}}>
      {toastVisible && (
        <Animated.View
          style={[
            styles.snackbarContainer,
            {transform: [{translateY: toastAnim}]},
          ]}>
          <LinearGradient
            colors={[mainOrangeColor, mainOrangeColor]}
            style={styles.snackbarGradient}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ToastContent
                profilePic={toastProfilePic}
                senderName={toastMessage}
                message={toastContent}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <View style={{flex: 1}}>{ScreenComponent}</View>

      {!hideTabBar && (
        <ImageBackground
          source={tabBackgrounds[activeTab]}
          style={styles.tabBarBg}>
          <View style={styles.tabBarRow}>
            {[0, 1, 2, 3].map(index => (
              <Pressable
                hitSlop={30}
                key={index}
                onPress={() => setActiveTab(index)}
                style={styles.tabButton}
              />
            ))}
          </View>
        </ImageBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarBg: {
    width: '100%',
    height: 84,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  snackbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingTop: RfW(40),
  },
  snackbarGradient: {
    borderRadius: 12,
    paddingHorizontal: RfW(12),
    paddingVertical: RfW(8),
    marginTop: RfW(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: RfW(2)},
    shadowOpacity: 0.3,
    shadowRadius: RfW(4),
    elevation: 6,
    minWidth: RfW(240),
  },
  snackbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarIcon: {
    marginRight: RfW(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RfW(20),
    padding: RfW(4),
  },
  snackbarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  snackbarContent: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.3,
    fontFamily: fonts.PoppinsRegular,
    // marginLeft: 8,
  },
});

export default TabNavigation;
