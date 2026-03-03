import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyNoteScreen from './MyNotesComponents/MyNoteScreen';
import CalenderScreen from './CalenderComponents/CalenderScreen';
import HomeComponents from './HomeComponents/HomeComponents';
import HeaderComponents from '../../components/HomeComponent/TimelyHeader/Header';

import {
  DarkColor60,
  mainOrangeColor,
  fonts,
  mainWhiteColor,
  DarkColor50,
  DarkColor,
  DarkColor80,
} from '../../utils/style/fonts';

import { normalize, RfH, RfW } from '../../utils/helper';
import ScreenView from '../../utils/ScreenView';
import CustomText from '../../utils/CustomText';

const { width } = Dimensions.get('window');
const MODAL_KEY = 'calendar_modal_shown';

/* ---------------- Calendar Wrapper ---------------- */
const CalendarContent = ({ navigation }) => (
  <View style={styles.contentContainer}>
    <CalenderScreen navigation={navigation} />
  </View>
);

/* ---------------- Main Screen ---------------- */
const ScreenTimely = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('myNotes');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  /* -------- Show modal only once -------- */
  const checkAndShowModal = async () => {
    try {
      const alreadyShown = await AsyncStorage.getItem(MODAL_KEY);
      if (!alreadyShown) {
        setIsModalVisible(true);
        await AsyncStorage.setItem(MODAL_KEY, 'true');
      }
    } catch (e) {
      console.log('Modal error:', e);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalStep(1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'myNotes':
        return <MyNoteScreen navigation={navigation} />;
      case 'calendar':
        return <CalendarContent navigation={navigation} />;
      case 'home':
        return <HomeComponents navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <ScreenView>
      <View style={styles.container}>
        <HeaderComponents navigation={navigation} />

        {/* -------- Tabs -------- */}
        <View style={styles.tabContainer}>
          {['myNotes', 'calendar', 'home'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              onPress={() => {
                setActiveTab(tab);
                if (tab === 'calendar') {
                  checkAndShowModal();
                }
              }}>
              <CustomText
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab === 'myNotes'
                  ? 'My Notes'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </CustomText>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentWrapper}>{renderTabContent()}</View>

        {/* -------- Modal -------- */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}>

          {/* Overlay */}
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={closeModal}>

            {/* Modal Card */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => { }}
              style={styles.modalContent}>

              <View style={{ position: 'absolute', bottom: RfH(-64) }}>
                <ImageBackground
                  source={require('../../assets/Png/calendarpic.webp')}
                  style={styles.modalImage}
                  resizeMode="cover">

                  {/* -------- STEP 1 -------- */}
                  {modalStep === 1 && (
                    <View style={styles.modalInner}>
                      <Image
                        source={require('../../assets/Png/calender.webp')}
                        tintColor={mainOrangeColor}
                        style={styles.icon}
                      />

                      <CustomText style={styles.modalHeading}>
                        Welcome to your Calendar
                      </CustomText>

                      <CustomText style={styles.modalTitle}>
                        Track your tasks, expense claims, and leave approvals — all in one place.
                      </CustomText>

                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalStep(2)}>
                        <CustomText style={styles.closeButtonText}>Got it</CustomText>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={closeModal}>
                        <CustomText style={styles.skipButtonText}>Skip</CustomText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* -------- STEP 2 -------- */}
                  {modalStep === 2 && (
                    <View style={styles.modalInner}>
                      <Image
                        source={require('../../assets/Png/checkloading.png')}
                        style={styles.icon}
                      />

                      <CustomText style={styles.modalHeading}>
                        Track tasks & Apply for leave
                      </CustomText>

                      <CustomText style={styles.modalTitle}>
                        Complete assigned tasks and apply for leave with just a few taps.
                      </CustomText>

                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeModal}>
                        <CustomText style={styles.closeButtonText}>Got it</CustomText>
                      </TouchableOpacity>
                    </View>
                  )}
                </ImageBackground>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScreenView>
  );
};

export default ScreenTimely;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: RfW(20),
    backgroundColor: '#fff',
    elevation: 2,
  },

  tabButton: { paddingVertical: 15, alignItems: 'center' },

  tabText: {
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor60,
  },

  activeTabText: { color: mainOrangeColor },

  tabIndicator: {
    height: 2,
    backgroundColor: mainOrangeColor,
    width: '100%',
    marginTop: 5,
  },

  contentWrapper: { flex: 1 },
  contentContainer: { flex: 1 },

  modalContainer: {
    flex: 1,
    backgroundColor: DarkColor50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: { alignItems: 'center', width: '100%' },

  modalImage: {
    height: RfH(326),
    width: RfW(282),
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalInner: {
    width: '85%',
    alignItems: 'center',
    top: RfH(40),
  },

  icon: {
    height: RfH(28),
    width: RfW(28),
    marginBottom: RfH(8),
  },

  modalHeading: {
    fontSize: normalize(14),
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    textAlign: 'center',
  },

  modalTitle: {
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    textAlign: 'center',
    marginTop: RfH(6),
  },

  closeButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: RfH(8),
    width: RfW(156),
    borderRadius: 8,
    marginTop: RfH(20),
  },

  closeButtonText: {
    color: mainWhiteColor,
    textAlign: 'center',
    fontFamily: fonts.PoppinsMedium,
  },

  skipButtonText: {
    marginTop: RfH(10),
    fontSize: normalize(12),
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
});
