import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  fonts,
  DarkColor50,
  DarkColor30,
  mainWhiteColor,
  mainOrange80,
  mainOrange25,
  mainOrangeColor,
  DarkColor,
  DarkColor80,
} from '../../../utils/style/fonts';

import DeleteSvg from '../../../assets/svg/DeleteSvg';
import BlockSvgIcon from '../../../assets/svg/BlockIcon';

const ModalsComponents = ({ visible, type, onClose, onConfirm, contactName }) => {
  const [selectedDuration, setSelectedDuration] = useState('1 hour');

  // Reset state when modal is reopened for mute
  useEffect(() => {
    if (type === 'mute') {
      setSelectedDuration('1 hour');
    }
  }, [visible, type]);

  const MUTE_OPTIONS = ['1 hour', '8 hours', '1 week', 'Always'];

  const getModalContent = () => {
    switch (type) {
      case 'delete':
        return {
          icon: <DeleteSvg width={42} height={42} color="red" />,
          title: `Delete Chat with ${contactName}?`,
          confirmText: 'Delete',
        };
      case 'block':
        return {
          icon: <BlockSvgIcon width={48} height={48} color={DarkColor} />,
          title: `Block ${contactName}?`,
          confirmText: 'Block',
        };
      case 'mute':
        return {
          icon: null,
          title: 'Mute Notifications',
          confirmText: 'Ok',
        };
      default:
        // Return empty content if type is invalid
        return { icon: null, title: '', confirmText: '' };
    }
  };

  const { icon, title, confirmText } = getModalContent();

  const handleConfirm = () => {
    console.log('Confirm button pressed', type);
    if (type === 'mute') {
      onConfirm(selectedDuration);
    } else if (type === 'delete') {
      onConfirm(type);
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalView}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          <Text allowFontScaling={false} style={styles.titleText}>
            {title}
          </Text>

          {type === 'mute' && (
            <View style={styles.muteOptionsContainer}>
              {MUTE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.muteOption}
                  onPress={() => setSelectedDuration(option)}>
                  <View style={styles.radioButton}>
                    {selectedDuration === option && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text allowFontScaling={false} style={styles.muteOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text
                allowFontScaling={false}
                style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}>
              <Text
                allowFontScaling={false}
                style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalsComponents;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    backgroundColor: mainWhiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
    borderColor: mainOrangeColor,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    padding: 24,
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
  iconContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    textAlign: 'center',
    marginBottom: 24,
  },
  // Mute Options Styles
  muteOptionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  muteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioButton: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: mainOrangeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: mainOrangeColor,
  },
  muteOptionText: {
    fontSize: 14,
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: mainWhiteColor,
    borderWidth: 1.5,
    borderColor: mainOrangeColor,
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: mainOrangeColor,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
  },
  cancelButtonText: {
    color: mainOrangeColor,
  },
  confirmButtonText: {
    color: mainWhiteColor,
  },
});
