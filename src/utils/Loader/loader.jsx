import { StyleSheet, View, Modal, ActivityIndicator } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';

const Loader = ({ status }) => {
  const renderLoader = () => {
    switch ('lottie') {
      case 'lottie':
        return (
          <LottieView
            source={require('../../assets/svg/Loader2.json')}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        );
      case 'large':
        return <ActivityIndicator size="10" color="#FC8C4D" />;
      case 'small':
        return <ActivityIndicator size="small" color="#FC8C4D" />;
      default:
        return <ActivityIndicator size="large" color="#FC8C4D" />;
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={status}
      statusBarTranslucent>
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>{renderLoader()}</View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FC8C4D',
    fontWeight: 'bold',
  },
});
