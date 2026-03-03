
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { BlurView } from '@react-native-community/blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCard from '../../../../components/ProfileComponent/ProfileCard';
import HubSection from '../../../../components/ProfileComponent/HubSection';
import { RfH, RfW } from '../../../../utils/helper';

// Colors and constants
const mainWhiteColor = '#FFFFFF';
const backgroundColor = mainWhiteColor;


const { width } = Dimensions.get('window');
const ProfileModal = ({ navigation, visible, onClose, setRefresh }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.85)).current;


  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.85,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.85,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}>
          <BlurView style={styles.absolute} blurType="dark" blurAmount={5} />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false} >
            <ProfileCard />
            <HubSection />
          </ScrollView>
        </Animated.View>
        <View style={{ position: 'absolute', width: '100%', alignSelf: 'flex-start', bottom: RfH(2) }}>
          <View style={{ height: RfH(168), width: RfW(184), }}>
            <Image
              source={require('../../../../assets/LoginAssets/png/ProfileBackImage.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode='contain'
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: backgroundColor,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: StatusBar.currentHeight || 20,
    flexGrow: 1,
  },
});

export default ProfileModal;
