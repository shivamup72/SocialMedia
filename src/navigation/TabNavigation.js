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
import {useRoute} from '@react-navigation/native';

const tabBackgrounds = [
  require('../assets/Png/timely-active.jpg'),
  require('../assets/Png/chat-active.jpg'),
  require('../assets/Png/circle-active.jpg'),
  require('../assets/Png/more-active.jpg'),
];

const TOAST_HIDE_DELAY = 2000;

const TabNavigation = () => {
  const {lastMessage, manageNewMessageToastChatScreen} = useWebSocket();
  const [activeTab, setActiveTab] = useState(1);
  const [hideTabBar, setHideTabBar] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastContent, setToastContent] = useState('');
  const [toastProfilePic, setToastProfilePic] = useState(null);
  const [toastGroupName, setToastGroupName] = useState('');

  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastTimeoutRef = useRef(null);
  const lastShownMsgId = useRef(null);

  /* -------------------- BACK HANDLER -------------------- */
  useEffect(() => {
    const onBackPress = () => {
      if (activeTab !== 1) {
        setActiveTab(1);
        return true;
      }
      BackHandler.exitApp();
      return true;
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

  /* -------------------- SCREENS -------------------- */
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

  /* -------------------- TOAST LOGIC (FIXED) -------------------- */
  useEffect(() => {
    if (activeTab === 1) return;

    let data = null;
    let isGroup = false;

    if (lastMessage?.action === 'receive_new_message') {
      data = lastMessage.data;
    } else if (
      manageNewMessageToastChatScreen?.action === 'receive_new_group_message'
    ) {
      data = manageNewMessageToastChatScreen.message;
      isGroup = true;
    }

    if (!data?.id || data.id === lastShownMsgId.current) return;

    lastShownMsgId.current = data.id;

    // clear previous hide timer ONLY when new toast comes
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToastMessage(isGroup ? data.sender.name : data.sender_name);
    setToastContent(data.content);
    setToastProfilePic(
      isGroup
        ? data.sender.avatar
        : data.profile_picture || data.sender_profile_picture,
    );
    setToastGroupName(isGroup ? data.conversation.group_name : '');

    setToastVisible(true);
    toastAnim.setValue(-100);

    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
        toastTimeoutRef.current = null;
      });
    }, TOAST_HIDE_DELAY);
  }, [lastMessage, manageNewMessageToastChatScreen, activeTab]);

  /* -------------------- UI -------------------- */
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
            <ToastContent
              profilePic={toastProfilePic}
              senderName={toastMessage}
              groupName={toastGroupName || undefined}
              message={toastContent}
            />
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
                key={index}
                hitSlop={30}
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
    alignSelf: 'center',
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
    width: '90%',
    alignSelf: 'center',
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
