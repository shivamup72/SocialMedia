import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useWebRTC } from '../../Api/context/WebRTCProvider';
import { useNavigation } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import MicSvgIcon from '../../assets/svg/MiciconSvg';
// Import icons (example using react-native-vector-icons)
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CallScreen = () => {
  const { localStream, remoteStream, callState, callData, answerCall, endCall } =
    useWebRTC();
  const navigation = useNavigation();

  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const [ringtone, setRingtone] = useState(null);

  useEffect(() => {
    InCallManager.start({ media: 'audio' });
    InCallManager.setSpeakerphoneOn(false);
    setIsSpeakerOn(false);

    // Start ringing for incoming calls
    if (callState === 'incoming') {
      // Assuming you have an audio file in your assets, e.g., 'ringtone.mp3'
      // You'll need a library like react-native-sound for this
      // import Sound from 'react-native-sound';
      // Sound.setCategory('Playback');
      // const ring = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
      //   if (error) {
      //     console.log('failed to load the sound', error);
      //     return;
      //   }
      //   ring.setNumberOfLoops(-1); // Loop indefinitely
      //   ring.play();
      //   setRingtone(ring);
      // });
    }

    return () => {
      InCallManager.stop();
      // if (ringtone) {
      //   ringtone.stop();
      //   ringtone.release();
      // }
    };
  }, [callState]);

  useEffect(() => {
    if (callState === 'idle') {
      // if (ringtone) {
      //   ringtone.stop();
      //   ringtone.release();
      // }
      navigation.goBack();
    }
  }, [callState, navigation, ringtone]);

  const handleEndCall = () => {
    endCall();
  };

  const handleToggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    InCallManager.setSpeakerphoneOn(newSpeakerState);
    setIsSpeakerOn(newSpeakerState);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const getCallStatusText = () => {
    switch (callState) {
      case 'outgoing':
        return 'Calling...';
      case 'incoming':
        return 'Incoming Call';
      case 'connected':
        return 'Connected';
      case 'idle':
        return 'Call Ended';
      default:
        return 'Connecting...';
    }
  };

  const callerName = callData?.remoteUser?.name || 'Unknown';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F14" />

      {remoteStream && isVideoOn ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.backgroundOverlay}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/Png/ProfileIcon2.png')}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.callerNameText}>{callerName}</Text>
          <Text style={styles.callStatusText}>{getCallStatusText()}</Text>
        </View>
      )}

      {/* Local Stream (Picture-in-Picture) - only if connected and video is on */}
      {localStream && isVideoOn && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
          mirror={true}
        />
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {callState === 'incoming' ? (
          <View style={styles.incomingControls}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleEndCall}>
              <Text>end</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={answerCall}>
              <Text>accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.connectedControls}>
            <TouchableOpacity
              style={[
                styles.button,
                isMuted ? styles.activeControl : styles.inactiveControl,
              ]}
              onPress={handleToggleMute}>
              {/* <Icon
                name={isMuted ? 'microphone-off' : 'microphone'}
                size={28}
                color="#fff"
              /> */}
              <MicSvgIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                isSpeakerOn ? styles.activeControl : styles.inactiveControl,
              ]}
              onPress={handleToggleSpeaker}>
              <Text>Speacker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                isVideoOn ? styles.activeControl : styles.inactiveControl,
              ]}
              onPress={handleToggleVideo}>
              <Text>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.hangupButton]}
              onPress={handleEndCall}>
              <Text>End Call</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F14', // Dark background
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F14', // Very dark background, could add pattern if desired
  },
  remoteVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  localVideo: {
    position: 'absolute',
    top: 60, // Adjust for status bar
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    backgroundColor: '#333',
    zIndex: 10,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle background for avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden', // Ensures image stays within bounds
  },
  avatar: {
    width: 130, // Slightly smaller than container
    height: 130,
    borderRadius: 65, // Half of width/height for perfect circle
  },
  callerNameText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  callStatusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '500',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  connectedControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Evenly space buttons
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', // Default control button background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  acceptButton: {
    backgroundColor: '#2ecc71', // Green for accept
    width: 70, // Slightly larger
    height: 70,
    borderRadius: 35,
  },
  declineButton: {
    backgroundColor: '#FF3B30', // Red for decline
    width: 70, // Slightly larger
    height: 70,
    borderRadius: 35,
  },
  hangupButton: {
    backgroundColor: '#FF3B30', // Red for end call
  },
  inactiveControl: {
    backgroundColor: 'rgba(255,255,255,0.15)', // Default/inactive state
  },
  activeControl: {
    backgroundColor: '#007AFF', // Example active color (blue)
  },
});

export default CallScreen;
