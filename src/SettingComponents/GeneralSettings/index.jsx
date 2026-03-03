import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Modal,
  BackHandler,
} from 'react-native';
import {
  fonts,
  DarkColor,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor60,
  DarkColor80,
} from '../../utils/style/fonts.jsx';

import ChatSettings from './ChatSettings';
import GeneralTimelySettings from './GeneralTimelySettings.jsx';
import LightDeleteSvg from '../../assets/svg/LightDeleteSvg.jsx';
import { useSettings } from '../../Api/context/SettingsContext.js';
import { LeaveWorkspaceApiId } from '../../Api/config/HomeApi.jsx';
import AsyncStorage1 from '../../Api/config/AsyncStorage.jsx';
import Toast from '../../Api/context/Toast.js';
import AddNotesheader from '../../Screen/Timely/MyNotesComponents/AddNotes/AddNotesheader.jsx';
import CustomText from '../../utils/CustomText.js';
import AppSettings from './AppSettings';

const GeneralSettings = ({ navigation, route }) => {
  const { SelectedMembers } = useSettings();
  const toastRef = useRef(null);

  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default behavior (exit app)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);

  const [isLeaveModalVisible, setLeaveModalVisible] = useState(false);

  const sections = [
    { component: <AppSettings /> },
    { key: 'chat', component: <ChatSettings /> },
    // { key: 'general', component: <GeneralTimelySettings /> },
  ];

  const handleLeaveHub = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('workspace_id', route?.params?.data?.id);

      const res = await LeaveWorkspaceApiId(formData);

      if (res?.success) {
        await AsyncStorage1.removeItem('HubId');
        navigation.reset({
          index: 0,
          routes: [{ name: 'HubListingScreen' }],
        });
      } else {
        toastRef.current?.show({
          type: 'error',
          message: res?.message || 'Unable to leave hub',
        });
      }
    } catch (error) {
      toastRef.current?.show({
        type: 'error',
        message: 'Something went wrong',
      });
    } finally {
      setLeaveModalVisible(false);
    }
  }, [navigation, route]);

  const renderFooter = () => {
    if (SelectedMembers?.role === 'admin') return null;

    return (
      // <TouchableOpacity
      //   style={styles.leaveHubBtn}
      //   onPress={() => setLeaveModalVisible(true)}
      // >
      //   <LightDeleteSvg width="18" height="18" />
      //   <CustomText style={styles.leaveHubText}>Leave Hub</CustomText>
      // </TouchableOpacity>
      null
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={mainWhiteColor} />

      <AddNotesheader navigation={navigation} Type="General Settings" />

      <FlatList
        data={sections}
        keyExtractor={item => item.key}
        renderItem={({ item }) => item.component}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* ===== Leave Hub Modal ===== */}
      <Modal
        transparent
        visible={isLeaveModalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <CustomText style={styles.modalTitle}>Leave the hub</CustomText>

            <CustomText style={styles.modalDescription}>
              Are you sure you want to leave this{' '}
              {route?.params?.data?.name} Hub?
            </CustomText>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLeaveModalVisible(false)}
              >
                <CustomText style={styles.cancelText}>Cancel</CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveBtn}
                onPress={handleLeaveHub}
              >
                <CustomText style={styles.leaveText}>Leave</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast ref={toastRef} />
    </View>
  );
};

export default GeneralSettings;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* Leave Hub Button */
  leaveHubBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveHubText: {
    marginLeft: 10,
    color: 'red',
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 16,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginBottom: 10,
    color: DarkColor
  },
  modalDescription: {
    fontSize: 14,
    color: DarkColor80,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: fonts.PoppinsRegular,
  },
  modalBtnRow: {
    flexDirection: 'row',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginRight: 8,
    alignItems: 'center',
  },
  leaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: DarkColor,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
  },
  leaveText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
  },
});
