import React from 'react';
import { Modal, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkColor, fonts } from '../../../utils/style/fonts';
import CustomText from '../../../utils/CustomText';

const ConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  modalTitle,
  modalMessage,
  cancelButtonText = 'Cancel',
  deleteButtonText = 'Delete',
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <CustomText style={styles.modalTitle}>{modalTitle || 'Delete'}</CustomText>
          <CustomText style={styles.modalMessage}>
            {modalMessage ||
              ' Are you sure you want to permanently delete this?'}
          </CustomText>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <CustomText style={styles.cancelButtonText}>{cancelButtonText}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={onConfirm}>
              <CustomText style={styles.deleteButtonText}>{deleteButtonText}</CustomText>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: DarkColor,
    marginBottom: 10,
    fontFamily: fonts.PoppinsSemiBold,
  },
  modalMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConfirmationModal;
