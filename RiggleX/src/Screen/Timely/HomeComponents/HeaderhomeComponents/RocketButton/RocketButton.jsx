import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage1 from '../../../../../Api/config/AsyncStorage';
import {
  fonts,
  mainGrayColor,
  mainOrange20,
  mainOrange50,
  mainOrangeColor,
  DarkColor,
} from '../../../../../utils/style/fonts';
import { PostUserActivityApi } from '../../../../../Api/config/HomeApi';

const RocketButton = () => {

  const [isStarted, setIsStarted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add
  const [checkValue, setcheckValue] = useState(false);
  const rocketImage = require('../../../../../assets/Png/RocketIconLogo.png');

  useEffect(() => {
    const FetchData = async () => {
      const res = await AsyncStorage1.getItem('is_live_on');
      // console.log('is_live_on', JSON.stringify(res));
      setcheckValue(res);
      setIsStarted(res.Value);
    }
    FetchData();
  }, [])

  // console.log('checkValue ====>', JSON.stringify(checkValue));

  const handleConfirm = async () => {
    try {

      const userId = await AsyncStorage1.getItem('userLoginResponse');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      console.log('User ID:', JSON.stringify(userId));
      await PostUserActivityApi({
        activity_type: isStarted ? 'end' : 'start',
      }).then(res => {
        setIsStarted(prevState => !prevState);
        setModalVisible(false);

        if (res.message === 'Day started successfully') {
          AsyncStorage1.setItem(
            'is_live_on',
            JSON.stringify({ Value: true }),
          );
        } else {
          AsyncStorage1.setItem(
            'is_live_on',
            JSON.stringify({ Value: false }),
          );
        }
        console.log('User Activity Response:', JSON.stringify(res));
      }).catch(error => {
        console.error('Error toggling activity status:', error);
      })
    } catch (error) {
      console.error('Error toggling activity status:', error);
    }
  };

  const IconComponent = () => (
    <View style={styles.iconWrapper}>
      <Image source={rocketImage} style={styles.rocketIcon} />
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.startButton,
          {
            backgroundColor: isStarted ? mainOrangeColor : mainGrayColor,
          },
        ]}
        onPress={() => setModalVisible(true)}>
        {isStarted ? (
          <>
            <Text style={styles.startButtonText}>End</Text>
            <IconComponent />
          </>
        ) : (
          <>
            <IconComponent />
            <Text style={styles.startButtonText}>Start</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Are you sure you want to ${isStarted ? 'end' : 'start'}?`}
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.noButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.yesButton]}
                onPress={handleConfirm}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RocketButton;

const styles = StyleSheet.create({
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 6,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rocketIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  startButtonText: {
    color: '#ffffff',
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    marginLeft: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1, // Make buttons take equal space
    marginHorizontal: 5,
  },
  noButton: {
    backgroundColor: '#DDDDDD',
  },
  yesButton: {
    backgroundColor: '#F78A49',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: fonts.PoppinsSemiBold,
  },
});
