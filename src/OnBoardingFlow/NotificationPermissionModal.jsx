import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  requestNotifications,
  checkNotifications,
} from 'react-native-permissions';
import CustomText from '../utils/CustomText';
import { fonts } from '../utils/style/fonts';

const NotificationPermissionModal = ({ visible, onClose, onGranted }) => {
  const handleAllow = async () => {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await requestNotifications([
          'alert',
          'sound',
          'badge',
        ]);
        if (status === RESULTS.GRANTED) {
          onGranted?.();
          onClose?.();
        } else {
          // On iOS, DENIED and BLOCKED both require opening settings.
          Alert.alert(
            'Permission Required',
            'To enable notifications, please go to your device Settings and allow notifications for this app.',
            [
              {
                text: 'Open Settings',
                onPress: () => openSettings().finally(onClose),
              },
              { text: 'Cancel', style: 'cancel', onPress: onClose },
            ],
          );
        }
      } else if (Platform.OS === 'android') {
        const { status } = await checkNotifications();

        // console.log('\n', 'Current notification status:', status, '\n', '\n');
        if (status === RESULTS.BLOCKED) {
          console.log('Permission is BLOCKED. Showing alert to open settings.');
          Alert.alert(
            'Permission Required',
            "Notifications are currently blocked. To receive updates, please tap 'Open Settings' and enable notifications for this app.",
            [
              {
                text: 'Open Settings',
                onPress: () => openSettings().finally(onClose),
              },
              { text: 'Cancel', style: 'cancel', onPress: onClose },
            ],
          );
          return;
        }

        const permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

        if (!permission) {
          openSettings();
          onGranted?.();
          onClose?.();
          return;
        }

        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          console.log('✅ Android notification permission granted');
          onGranted?.();
          onClose?.();
        } else {
          console.log('❌ Android notification permission denied by user.');
          onClose?.();
        }
      }
    } catch (err) {
      console.warn('Permission error:', err);
      onClose?.();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.title}>Notification Permission</CustomText>
          <CustomText style={styles.message}>
            Please allow notification permission to be updated from new updates
            or any offer/announcements.
          </CustomText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <CustomText style={styles.buttonText}>Cancel</CustomText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAllow} style={styles.allowButton}>
              <CustomText style={styles.buttonText}>Allow</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationPermissionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    fontFamily: fonts.PoppinsMedium
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    fontFamily: fonts.PoppinsRegular
  },
  buttonContainer: {
    flexDirection: 'row',

    width: '100%',
    justifyContent: 'space-between',
  },
  allowButton: {
    backgroundColor: '#4CAF50',
    // padding: 10,
    borderRadius: 8,
    height: 40,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E53935',
    // padding: 10,
    borderRadius: 8,
    height: 40,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: fonts.PoppinsMedium,
  },
});
