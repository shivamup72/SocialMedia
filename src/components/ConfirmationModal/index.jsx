import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkColor, WhiteColor, mainWhiteColor, fonts } from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Unstar Message',
  message = 'Are you sure you want to unstar this message?',
  confirmText = 'Unstar',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.title}>{title}</CustomText>
          <CustomText style={styles.message}>{message}</CustomText>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <CustomText style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}>
              <CustomText style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: mainWhiteColor,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: DarkColor,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.PoppinsRegular,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#ff4d4f',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButtonText: {
    color: mainWhiteColor,
  },
});

export default ConfirmationModal;
