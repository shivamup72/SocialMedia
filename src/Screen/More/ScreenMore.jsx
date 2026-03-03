import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import RNRestart from 'react-native-restart';
import AsyncStorage1 from '../../Api/config/AsyncStorage';
import { PatchUserIDListingApi } from '../../Api/config/HomeApi';
import CustomText from '../../utils/CustomText';
import ProfileCard from '../../components/ProfileComponent/ProfileCard';
import HubSection from '../../components/ProfileComponent/HubSection';
import MenuList from '../../components/ProfileComponent/MenuList';
import menuItems from '../../components/ProfileComponent/menuItems';

import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  RedColor,
  DarkColor,
  DarkColor80,
} from '../../utils/style/fonts';
import { RfH, RfW } from '../../utils/helper';
import ScreenView from '../../utils/ScreenView';
import { logout } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import Header from '../Timely/TimelyheaderComponents/Header';
import HeaderComponents from '../../components/HeaderComponents/HeaderComponents';
import { useWebSocket } from '../../Api/context/WebSocketServices';

const ScreenMore = ({ setHideTabBar }) => {
  const dispatch = useDispatch();
  const { disconnect } = useWebSocket();

  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await removeData();
      // Always attempt to disconnect socket
      try {
        if (typeof disconnect === 'function') {
          await disconnect();
        } else {
          console.warn('Socket disconnect function not available');
        }
      } catch (err) {
        console.log('Socket disconnect error:', err);
      }
      dispatch(logout());
      // RNRestart.Restart();
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      setShowLogoutModal(false);
    }
  };
  /* ---------------- DELETE ACCOUNT ---------------- */
  const handleDeactivateAccount = () => {
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('is_active', 'False');

      const userData = await AsyncStorage1.getItem('userLoginResponse');

      const parsedUser =
        typeof userData === 'string' ? JSON.parse(userData) : userData;

      const userId = parsedUser?.data?.user?.id;
      log('Parsed user data:', userId);

      if (!userId) {
        throw new Error('User ID not found');
      }

      await PatchUserIDListingApi(userId, formData);

      await removeData();
      RNRestart.Restart();
    } catch (error) {
      console.log('Delete account error', error);
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeactivateModal(false);
    }
  };

  /* ---------------- CLEAR STORAGE ---------------- */

  const removeData = async () => {
    await AsyncStorage1.removeItem('isLoggedIn');
    await AsyncStorage1.removeItem('userLoginResponse');
    await AsyncStorage1.removeItem('is_day_started');
    await AsyncStorage1.removeItem('is_live_on');
    await AsyncStorage1.removeItem('sessionId');
    await AsyncStorage1.removeItem('HubName');
    await AsyncStorage1.removeItem('HubId');
  };

  /* ---------------- MODALS ---------------- */

  const LogoutModal = () => (
    <Modal transparent visible={showLogoutModal} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalTitle}>Logout</CustomText>
          <CustomText style={styles.modalText}>
            Are you sure you want to logout?
          </CustomText>

          <View style={styles.modalRow}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmLogout}>
              <CustomText style={{ color: mainWhiteColor }}>
                Logout
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLogoutModal(false)}>
              <CustomText style={{ color: DarkColor80 }}>Cancel</CustomText>
            </TouchableOpacity>


          </View>
        </View>
      </View>
    </Modal>
  );

  const DeleteModal = () => (
    <Modal transparent visible={showDeactivateModal} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalTitle}>Delete Account</CustomText>
          <CustomText style={styles.modalText}>
            This will permanently delete your account.
          </CustomText>

          <View style={styles.modalRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: RedColor }]}
              onPress={confirmDeactivate}>
              <CustomText style={{ color: mainWhiteColor }}>
                Delete
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDeactivateModal(false)}>
              <CustomText style={{ color: DarkColor80 }}>Cancel</CustomText>
            </TouchableOpacity>


          </View>
        </View>
      </View>
    </Modal>
  );

  /* ---------------- UI ---------------- */

  return (
    <ScreenView>
      <StatusBar barStyle="dark-content" />
      <HeaderComponents Type={'More'} />
      <View style={{ position: 'absolute', bottom: RfH(100), width: '100%', alignSelf: 'flex-start' }}>
        <View style={{ height: RfH(168), width: RfW(184), }}>
          <Image
            source={require('../../assets/LoginAssets/png/ProfileBackImage.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode='contain'
          />
        </View>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ bottom: RfH(6) }}>
          </View>
        </View>
        {/* <ProfileCard setHideTabBar={setHideTabBar} /> */}
        {/* <HubSection /> */}
        <MenuList
          data={menuItems}
          onLogout={handleLogout}
          onDeleteAccount={handleDeactivateAccount}
        />
      </ScrollView>
      <LogoutModal />
      <DeleteModal />
    </ScreenView>
  );
};

export default ScreenMore;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: RfW(18),
    paddingBottom: RfH(60),
    // paddingVertical: RfH(30),
  },
  modalContainer: {
    width: '85%',
    backgroundColor: mainWhiteColor,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginBottom: 10,
    color: DarkColor,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RfH(20),
  },
  progressContainer: {
    paddingRight: RfW(10),
    // flexDirection: 'row'
  },
  progressBackground: {
    width: '80%',
    height: RfH(8),
    backgroundColor: '#E9ECEF',
    borderRadius: RfH(10),
    overflow: 'hidden',
    marginBottom: RfH(5),
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: 'green',
    borderRadius: RfH(10),
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    color: DarkColor80
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  confirmBtn: {
    padding: 12,
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
});
