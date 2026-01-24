import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const pauseImage = require('../../../assets/Png/PauseImage.png');
const ResumeImage = require('../../../assets/Png/PauseImage.png');

const audioPlayer = new AudioRecorderPlayer();

const formatTime = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

// Generates a fake but realistic-looking waveform
const generateWaveform = () => {
  return [...Array(30)].map(() => Math.random() * 0.7 + 0.3); // 30 bars, height between 30% and 100%
};

// --- Main Component ---
const AudioMessageItem = ({uri, profilePic, timestamp, initialDuration}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [waveform] = useState(generateWaveform()); // Generate once and keep

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    };
  }, []);

  const onTogglePlayback = async () => {
    if (isPlaying) {
      await audioPlayer.pausePlayer();
      setIsPlaying(false);
    } else {
      await audioPlayer.startPlayer(uri);
      setIsPlaying(true);
      audioPlayer.addPlayBackListener(e => {
        if (e.currentPosition === e.duration) {
          // Playback finished
          setIsPlaying(false);
          audioPlayer.stopPlayer();
        }
        setPlayTime(e.currentPosition);
        setDuration(e.duration);
      });
    }
  };

  const progress = duration > 0 ? (playTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <TouchableOpacity onPress={onTogglePlayback} style={styles.playButton}>
          {isPlaying ? (
            <Image
              source={pauseImage}
              style={{height: 24, width: 24, resizeMode: 'contain'}}
            />
          ) : (
            <Image
              source={ResumeImage}
              style={{height: 24, width: 24, resizeMode: 'contain'}}
            />
          )}
        </TouchableOpacity>

        <View style={styles.waveformContainer}>
          {/* Waveform bars */}
          <View style={styles.waveform}>
            {waveform.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: `${height * 100}%`,
                    backgroundColor:
                      (progress / 100) * waveform.length > index
                        ? '#A3D8FF'
                        : '#BDC3C7',
                  },
                ]}
              />
            ))}
          </View>
          {/* Scrubber dot */}
          <View style={[styles.scrubber, {left: `${progress}%`}]} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.durationText}>
            {playTime > 0 ? formatTime(playTime) : formatTime(duration)}
          </Text>
        </View>
      </View>
      <View style={styles.metaContainer}>
        <Image source={profilePic} style={styles.profilePic} />

        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    marginVertical: 5,
    marginRight: 10,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54', // WhatsApp green
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '75%',
  },
  playButton: {
    marginRight: 10,
  },
  waveformContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 2,
  },
  scrubber: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#075E54',
  },
  footer: {
    marginLeft: 'auto',
    alignSelf: 'flex-end',
    paddingLeft: 10,
  },
  durationText: {
    color: '#BDC3C7',
    fontSize: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  profilePic: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 5,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
  },
});

export default AudioMessageItem;
