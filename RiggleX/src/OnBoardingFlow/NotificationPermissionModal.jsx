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

const NotificationPermissionModal = ({visible, onClose, onGranted}) => {
  const handleAllow = async () => {
    try {
      if (Platform.OS === 'ios') {
        const {status} = await requestNotifications([
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
              {text: 'Cancel', style: 'cancel', onPress: onClose},
            ],
          );
        }
      } else if (Platform.OS === 'android') {
        const {status} = await checkNotifications();

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
              {text: 'Cancel', style: 'cancel', onPress: onClose},
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
          <Text style={styles.title}>Notification Permission</Text>
          <Text style={styles.message}>
            Please allow notification permission to be updated from new updates
            or any offer/announcements.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAllow} style={styles.allowButton}>
              <Text style={styles.buttonText}>Allow</Text>
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
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
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
    fontWeight: '600',
  },
});
