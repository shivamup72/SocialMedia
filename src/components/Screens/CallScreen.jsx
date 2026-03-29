// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Image,
//   StatusBar,
//   Animated,
// } from 'react-native';
// import { PanResponder } from 'react-native';
// import { useWebRTC } from '../../Api/context/WebRTCProvider';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import InCallManager from 'react-native-incall-manager';
// import MicSvgIcon from '../../assets/svg/MiciconSvg';
// import CustomText from '../../utils/CustomText';
// // Import icons (example using react-native-vector-icons)
// // import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const CallScreen = () => {
//   const route = useRoute();

//   // Safe params destructuring
//   const {
//     type = 'audio',
//     GroupId = null,
//     conversationId = null,
//     // calleeId = null,
//     // userId = null,
//   } = route.params || {};

//   console.log(
//     'CallScreen params =>',
//     JSON.stringify(route.params || {}, null, 2),
//   );

//   const { localStream, remoteStream, callState, callData, answerCall, endCall, initiateCall } =
//     useWebRTC();
//   // TODO: Replace 'calleeId' with the actual param name for the user you are calling
//   const calleeId = route.params?.calleeId || route.params?.userId || GroupId;
//   const isVideo = type === 'video';

//   // Initiate call on mount if outgoing
//   useEffect(() => {
//     if (callState === 'idle' && type === 'outgoing' && calleeId && conversationId) {
//       initiateCall(calleeId, isVideo, conversationId);
//     }
//   }, [callState, type, calleeId, conversationId, initiateCall]);
//   const navigation = useNavigation();

//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(false);

//   const [ringtone, setRingtone] = useState(null);

//   useEffect(() => {
//     InCallManager.start({ media: 'audio' });
//     InCallManager.setSpeakerphoneOn(false);
//     setIsSpeakerOn(false);

//     // Start ringing for incoming calls
//     if (callState === 'incoming') {
//       // Assuming you have an audio file in your assets, e.g., 'ringtone.mp3'
//       // You'll need a library like react-native-sound for this
//       // import Sound from 'react-native-sound';
//       // Sound.setCategory('Playback');
//       // const ring = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
//       //   if (error) {
//       //     console.log('failed to load the sound', error);
//       //     return;
//       //   }
//       //   ring.setNumberOfLoops(-1); // Loop indefinitely
//       //   ring.play();
//       //   setRingtone(ring);
//       // });
//     }

//     return () => {
//       InCallManager.stop();
//       // if (ringtone) {
//       //   ringtone.stop();
//       //   ringtone.release();
//       // }
//     };
//   }, [callState]);

//   useEffect(() => {
//     if (callState === 'idle') {
//       // if (ringtone) {
//       //   ringtone.stop();
//       //   ringtone.release();
//       // }
//       navigation.goBack();
//     }
//   }, [callState, navigation, ringtone]);

//   const handleEndCall = () => {
//     endCall();
//   };

//   const handleToggleSpeaker = () => {
//     const newSpeakerState = !isSpeakerOn;
//     InCallManager.setSpeakerphoneOn(newSpeakerState);
//     setIsSpeakerOn(newSpeakerState);
//   };

//   const handleToggleMute = () => {
//     setIsMuted(!isMuted);
//   };

//   const handleToggleVideo = () => {
//     setIsVideoOn(!isVideoOn);
//   };

//   const getCallStatusText = () => {
//     switch (callState) {
//       case 'outgoing':
//         return 'Calling...';
//       case 'incoming':
//         return 'Incoming Call';
//       case 'connected':
//         return 'Connected';
//       case 'idle':
//         return 'Call Ended';
//       default:
//         return 'Connecting...';
//     }
//   };

//   const callerName = callData?.remoteUser?.name || 'Unknown';

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0A0F14" />

//       {remoteStream && isVideoOn ? (
//         <RTCView
//           streamURL={remoteStream.toURL()}
//           style={styles.remoteVideo}
//           objectFit="cover"
//         />
//       ) : (
//         <View style={styles.backgroundOverlay}>
//           <View style={styles.avatarContainer}>
//             <Image
//               source={require('../../assets/Png/ProfileIcon2.png')}
//               style={styles.avatar}
//             />
//           </View>
//           <CustomText style={styles.callerNameText}>{callerName}</CustomText>
//           <CustomText style={styles.callStatusText}>{getCallStatusText()}</CustomText>
//         </View>
//       )}

//       {/* Local Stream (Picture-in-Picture) - only if connected and video is on */}
//       {localStream && isVideoOn && (
//         <RTCView
//           streamURL={localStream.toURL()}
//           style={styles.localVideo}
//           objectFit="cover"
//           mirror={true}
//         />
//       )}

//       {/* Controls */}
//       <View style={styles.controlsContainer}>
//         {callState === 'incoming' ? (
//           <View style={styles.incomingControls}>
//             <TouchableOpacity
//               style={[styles.button, styles.declineButton]}
//               onPress={handleEndCall}>
//               <CustomText>end</CustomText>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.acceptButton]}
//               onPress={answerCall}>
//               <CustomText>accept</CustomText>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.connectedControls}>
//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 isMuted ? styles.activeControl : styles.inactiveControl,
//               ]}
//               onPress={handleToggleMute}>
//               {/* <Icon
//                 name={isMuted ? 'microphone-off' : 'microphone'}
//                 size={28}
//                 color="#fff"
//               /> */}
//               <MicSvgIcon />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 isSpeakerOn ? styles.activeControl : styles.inactiveControl,
//               ]}
//               onPress={handleToggleSpeaker}>
//               <CustomText>Speacker</CustomText>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 isVideoOn ? styles.activeControl : styles.inactiveControl,
//               ]}
//               onPress={handleToggleVideo}>
//               <CustomText>Video</CustomText>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, styles.hangupButton]}
//               onPress={handleEndCall}>
//               <CustomText>End Call</CustomText>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0A0F14', // Dark background
//   },
//   backgroundOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#0A0F14', // Very dark background, could add pattern if desired
//   },
//   remoteVideo: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   localVideo: {
//     position: 'absolute',
//     top: 60, // Adjust for status bar
//     right: 20,
//     width: 100,
//     height: 150,
//     borderRadius: 8,
//     borderColor: 'rgba(255,255,255,0.3)',
//     borderWidth: 1,
//     backgroundColor: '#333',
//     zIndex: 10,
//   },
//   avatarContainer: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     backgroundColor: 'rgba(255,255,255,0.1)', // Subtle background for avatar
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.2)',
//     overflow: 'hidden', // Ensures image stays within bounds
//   },
//   avatar: {
//     width: 130, // Slightly smaller than container
//     height: 130,
//     borderRadius: 65, // Half of width/height for perfect circle
//   },
//   callerNameText: {
//     color: '#fff',
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   callStatusText: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 18,
//     fontWeight: '500',
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 15,
//   },
//   incomingControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingBottom: 20,
//   },
//   connectedControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly', // Evenly space buttons
//     alignItems: 'center',
//   },
//   button: {
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 30,
//     marginHorizontal: 8,
//     backgroundColor: 'rgba(255,255,255,0.15)', // Default control button background
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 4,
//   },
//   acceptButton: {
//     backgroundColor: '#2ecc71', // Green for accept
//     width: 70, // Slightly larger
//     height: 70,
//     borderRadius: 35,
//   },
//   declineButton: {
//     backgroundColor: '#FF3B30', // Red for decline
//     width: 70, // Slightly larger
//     height: 70,
//     borderRadius: 35,
//   },
//   hangupButton: {
//     backgroundColor: '#FF3B30', // Red for end call
//   },
//   inactiveControl: {
//     backgroundColor: 'rgba(255,255,255,0.15)', // Default/inactive state
//   },
//   activeControl: {
//     backgroundColor: '#007AFF', // Example active color (blue)
//   },
// });

// export default CallScreen;


import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
  View,
  Animated,
  PanResponder,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useWebRTC } from '../../Api/context/WebRTCProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import CustomText from '../../utils/CustomText';
import LeftArrowSvg from '../../assets/svg/LeftArrowSvg';
import MicSvgIcon from '../../assets/svg/MiciconSvg';
import RightArrowFilled from '../../assets/svg/Right_arrow_filled';
import LeftArrowFilled from '../../assets/svg/left_arrow_filled';
import Sound from 'react-native-sound';
import { RfH, RfW } from '../../utils/helper';
import { DarkColor20, DarkColor60, DarkColor90, fonts, mainOrange50, mainOrangeColor, mainWhiteColor } from '../../utils/style/fonts';
// Sound file paths (adjust if needed)
// For react-native-sound, use the filename string and Sound.MAIN_BUNDLE
const INCOMING_SOUND_FILENAME = 'incomming.wav';
// const OUTGOING_SOUND = require('../../assets/Sounds/incomming.wav');

const COLORS = {
  bg: '#F4F4F4',
  white: '#FFFFFF',
  black: '#20252B',
  grayText: '#69707A',
  lightGray: '#E8E8E8',
  iconBg: '#E6E6E6',
  red: '#EF4444',
};

const CallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Sound refs
  const incomingSoundRef = useRef(null);

  const {
    type = 'audio',
    GroupId = null,
    conversationId = null,
    calleeId = null,
    userId = null,
    autoStart = true,
    mode = 'outgoing', // outgoing | incoming
    name = '',
    avatar = '',
  } = route.params || {};

  const {
    localStream,
    remoteStream,
    callState,
    callData,
    answerCall,
    endCall,
    initiateCall,
  } = useWebRTC();

  const finalCalleeId = calleeId || userId || GroupId;
  const isVideoCall = type === 'video';

  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [callSeconds, setCallSeconds] = useState(0);
  const [pressedBtn, setPressedBtn] = useState(null);
  const timerRef = useRef(null);

  // Play/stop incoming ringtone based on call state
  useEffect(() => {
    if (callState === 'incoming') {
      incomingSoundRef.current = new Sound(
        INCOMING_SOUND_FILENAME,
        Sound.MAIN_BUNDLE,
        (error) => {
          if (!error) {
            if (incomingSoundRef.current) {
              incomingSoundRef.current.setNumberOfLoops(-1);
              incomingSoundRef.current.play();
            }
          } else {
            console.log('Failed to load incoming sound:', error);
          }
        }
      );
    } else {
      if (incomingSoundRef.current) {
        incomingSoundRef.current.stop();
        incomingSoundRef.current.release();
        incomingSoundRef.current = null;
      }
    }
    return () => {
      if (incomingSoundRef.current) {
        incomingSoundRef.current.stop();
        incomingSoundRef.current.release();
        incomingSoundRef.current = null;
      }
    };
  }, [callState]);

  // Start/stop call timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  // Format seconds to HH:MM:SS
  const formatCallTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s]
      .map((v, i) => (i === 0 && v === 0 ? null : String(v).padStart(2, '0')))
      .filter(Boolean)
      .join(':');
  };

  const callerName = useMemo(() => {
    return (
      name ||
      callData?.from_user_name ||
      callData?.name ||
      callData?.remoteUser?.name ||
      'Unknown User'
    );
  }, [name, callData]);

  const callerAvatar = useMemo(() => {
    return (
      avatar ||
      callData?.from_user_avatar ||
      callData?.avatar ||
      null
    );
  }, [avatar, callData]);

  useEffect(() => {
    InCallManager.start({ media: isVideoCall ? 'video' : 'audio' });
    InCallManager.setSpeakerphoneOn(false);
    setIsSpeakerOn(false);

    return () => {
      InCallManager.stop();
    };
  }, [isVideoCall]);

  useEffect(() => {
    if (
      autoStart &&
      mode === 'outgoing' &&
      callState === 'idle' &&
      finalCalleeId &&
      conversationId
    ) {
      initiateCall(finalCalleeId, isVideoCall, conversationId);
    }
  }, [
    autoStart,
    mode,
    callState,
    finalCalleeId,
    conversationId,
    initiateCall,
    isVideoCall,
  ]);

  useEffect(() => {
    if (callState === 'idle') {
      navigation.goBack();
    }
  }, [callState, navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEndCall = () => {
    endCall();
    navigation.goBack();
  };

  // const handleToggleSpeaker = () => {
  //   const next = !isSpeakerOn;
  //   InCallManager.setSpeakerphoneOn(next);
  //   setIsSpeakerOn(next);
  // };
  const handleToggleSpeaker = () => {
    const next = !isSpeakerOn;
    InCallManager.setSpeakerphoneOn(next);
    setIsSpeakerOn(next);
    setPressedBtn('speaker');

  };
  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
    // agar tumhare WebRTC context me mute function hai to yahan call karo
    // toggleMute?.();
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    // agar local video track enable/disable karna ho:
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks?.length) {
        const nextEnabled = !isVideoEnabled;
        videoTracks.forEach(track => {
          track.enabled = nextEnabled;
        });
      }
    }
  };

  const getStatusText = () => {
    if (callState === 'incoming') return 'Incoming call';
    if (callState === 'outgoing') return 'Calling...';
    if (callState === 'connected') return isVideoCall ? 'Video call' : 'Voice call';
    return 'Connecting...';
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.topIconButton} onPress={handleBack}>
        <LeftArrowFilled width={24} height={24} color={COLORS.black} />
      </TouchableOpacity>

      <CustomText style={styles.topTitle} numberOfLines={1}>
        {callerName}
      </CustomText>

      <TouchableOpacity style={styles.topIconButton}>
        <Image source={require('../../assets/ChatAssets/png/AddMem.png')} style={{ height: '100%', width: '100%' }} />

      </TouchableOpacity>
    </View>
  );

  const renderCenterContent = () => {
    if (remoteStream && isVideoEnabled) {
      return (
        <>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              mirror
            />
          )}
        </>
      );
    }

    // Helper to get initials from name
    const getInitials = (fullName) => {
      if (!fullName) return '';
      const parts = fullName.trim().split(' ');
      if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
      <View style={styles.centerContent}>
        <View style={styles.avatarWrapper}>
          {callerAvatar ? (
            <Image source={{ uri: callerAvatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' }]}>
              <CustomText style={{ fontSize: 48, color: '#fff', fontWeight: 'bold' }}>
                {getInitials(callerName)}
              </CustomText>
            </View>
          )}
        </View>

        <CustomText style={styles.nameText}>{callerName}</CustomText>
        {callState === 'connected' && (
          <CustomText style={styles.statusText}>{formatCallTime(callSeconds)}</CustomText>
        )}
        {callState !== 'connected' && (
          <CustomText style={styles.statusText}>{getStatusText()}</CustomText>
        )}
      </View>
    );
  };


  // Animation for accept button (up-down bounce)
  const acceptAnim = useRef(new Animated.Value(0)).current;
  const acceptAnimLoopRef = useRef(null);
  useEffect(() => {
    if (callState === 'incoming') {
      acceptAnimLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(acceptAnim, {
            toValue: -18,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(acceptAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      acceptAnimLoopRef.current.start();
    } else {
      if (acceptAnimLoopRef.current) {
        acceptAnimLoopRef.current.stop();
        acceptAnimLoopRef.current = null;
      }
      acceptAnim.setValue(0);
    }
    // Cleanup on unmount
    return () => {
      if (acceptAnimLoopRef.current) {
        acceptAnimLoopRef.current.stop();
        acceptAnimLoopRef.current = null;
      }
    };
  }, [callState, acceptAnim]);

  // Smooth swipe up to accept logic
  const swipeY = useRef(new Animated.Value(0)).current;
  const swipeUpThreshold = 60;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) swipeY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -swipeUpThreshold) {
          Animated.timing(swipeY, {
            toValue: -80,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              swipeY.setValue(0);
            });
            answerCall();
          });
        } else {
          Animated.spring(swipeY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const renderIncomingButtons = () => (
    <View style={styles.bottomButtonsRow}>
      <TouchableOpacity
        style={
          styles.circleButton
        }
        onPress={handleEndCall}
      >
        <Image
          source={require('../../assets/ChatAssets/png/callDecline.png')}
          style={{ height: '100%', width: '100%' }}
        />
        <CustomText style={styles.incommingcallDes}>
          Decline
        </CustomText>
      </TouchableOpacity>

      {/* Swipe up to accept animation */}
      <Animated.View style={{ flex: 1, alignItems: 'center', marginLeft: 10 }}>
        <Animated.View
          style={{
            transform: [
              { translateY: Animated.add(acceptAnim, swipeY) },
            ],
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.circleButton}>
            <Image source={require('../../assets/ChatAssets/png/callAccept.png')} style={{ height: '100%', width: '100%' }} />
          </View>
        </Animated.View>
        <CustomText style={styles.incommingcallDes}>Swipe up to accept</CustomText>
      </Animated.View>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={handleEndCall}>
        <Image source={require('../../assets/ChatAssets/png/msgImg.png')} style={{ height: '100%', width: '100%' }} />
        <CustomText style={styles.incommingcallDes}>Message</CustomText>
      </TouchableOpacity>
    </View>
  );

  const renderConnectedButtons = () => (
    <View style={styles.bottomButtonsRow}>
      <TouchableOpacity
        style={[
          styles.circleButton,
          isMuted ? styles.activeCircleButton : styles.inactiveCircleButton,
        ]}
        onPress={handleToggleMute}>
        <MicSvgIcon />
      </TouchableOpacity>


      <TouchableOpacity
        style={[
          styles.circleButton,
          { backgroundColor: isSpeakerOn ? mainOrangeColor : 'rgba(38, 50, 56, 0.1)', }
        ]}
        onPress={() => {
          handleToggleSpeaker();
        }}
      >
        <Image
          source={require('../../assets/ChatAssets/png/Speaker.png')}
          style={{ height: RfW(24), width: RfW(24) }}
          tintColor={isSpeakerOn ? mainWhiteColor : null}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.circleButton,
        ]}
        onPress={handleToggleVideo}>
        <Image source={require('../../assets/ChatAssets/png/videocall.png')} style={{ height: '100%', width: '100%' }} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.circleButton}
        onPress={handleEndCall}>
        <Image source={require('../../assets/ChatAssets/png/callDecline.png')} style={{ height: '100%', width: '100%' }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
        translucent={false}
      />

      {renderTopBar()}
      {renderCenterContent()}

      <View style={styles.bottomContainer}>
        {callState === 'incoming'
          ? renderIncomingButtons()
          : renderConnectedButtons()}
      </View>
    </SafeAreaView>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: '#4B5563',
    fontWeight: '700',
    marginHorizontal: 14,
  },
  profileIcon: {
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
    overflow: 'hidden',
    marginBottom: 22,
    backgroundColor: COLORS.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    fontSize: 20,
    color: COLORS.black,
    fontWeight: '700',
    marginBottom: 8,
  },
  incommingcallDes: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    paddingVertical: RfH(10)
  },
  statusText: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
  },
  localVideo: {
    position: 'absolute',
    top: 90,
    right: 16,
    width: 110,
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 5,
  },
  bottomContainer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    width: RfW(52),
    height: RfW(52),
    borderRadius: RfW(26),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  inactiveCircleButton: {
    backgroundColor: '#E5E7EB',
  },
  activeCircleButton: {
    backgroundColor: '#CBD5E1',
  },
  endCallButton: {
    backgroundColor: COLORS.red,
  },
  iconText: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: '700',
  },
  smallIconText: {
    fontSize: 18,
  },
});