import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ProfileModal from '../Timely/HomeComponents/HeaderhomeComponents/ProfileModal';
import { useNavigation } from '@react-navigation/native';
import { DarkColor, fonts, mainOrangeColor, mainWhiteColor } from '../../utils/style/fonts';
import BackArrowSvg from '../../assets/svg/BackArrowSvg';
import CustomText from '../../utils/CustomText';



const ScreenCircle = () => {
  const navigation = useNavigation();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Reset modal visibility when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setProfileModalVisible(false);
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View
          style={styles.backButton}
        >
          {/* <BackArrowSvg width={24} height={24} color={DarkColor} /> */}
        </View>
        <CustomText style={styles.headerTitle}>Circle</CustomText>
        <View style={styles.headerRight} />
      </View>

      <TouchableOpacity style={styles.comingSoonContainer} onPress={() => setProfileModalVisible(true)}>
        <CustomText style={styles.comingSoonText}>Coming Soon</CustomText>
        <CustomText style={styles.comingSoonSubtext}>We're working on something amazing!</CustomText>
      </TouchableOpacity>

      <ProfileModal
        navigation={navigation}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ScreenCircle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: DarkColor,
    alignSelf: 'center',
    fontFamily: fonts.PoppinsMedium
  },
  headerRight: {
    width: 40,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: mainOrangeColor,
    marginBottom: 16,
  },
  comingSoonSubtext: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});