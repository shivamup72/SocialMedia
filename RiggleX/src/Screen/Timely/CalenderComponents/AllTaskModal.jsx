import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../../Api/context/SettingsContext';
import { fonts, mainWhiteColor, mainOrangeColor } from '../../../utils/style/fonts';
import { normalize } from '../../../utils/helper';
// Images
const TaskImage = require('../../../assets/AssestsComponents/Png/TaskImage.png');
const LeaveCalenderImage = require('../../../assets/AssestsComponents/Png/BgOrangeCalender.png');
const ExpenseClaimImage = require('../../../assets/AssestsComponents/Png/ExpenseClaimImage.png');
const MeetingImage = require('../../../assets/AssestsComponents/Png/MeetingsImage.png');
const PlusIcon = require('../../../assets/Png/PlusIcon.png');

const AllTaskModal = ({
  visible,
  onClose,
  onAddTask,
  onAddLeave,
  onAddExpense,
  onAddMeeting,
}) => {
  const { settings, isLoading } = useSettings();

  const actionButtons = useMemo(() => {
    return [
      {
        label: 'Task',
        icon: TaskImage,
        onPress: onAddTask,
        show: true,
      },
      {
        label: 'Leave',
        icon: LeaveCalenderImage,
        onPress: onAddLeave,
        show: !!settings?.add_hrms && !!settings?.manage_leaves_wfh_balance,
      },
      {
        label: 'Expense Claim',
        icon: ExpenseClaimImage,
        onPress: onAddExpense,
        show: !!settings?.add_hrms && !!settings?.expense_claim,
      },
      {
        label: 'Meetings',
        icon: MeetingImage,
        onPress: onAddMeeting,
        show: true,
      },
      // {
      //   label: 'Close',
      //   icon: PlusIcon,
      //   onPress: onClose,
      //   show: true,
      // },
    ].filter(b => b.show);
  }, [settings]);


  // 🔹 Loader until settings load
  if (isLoading) {
    return (
      <Modal transparent visible={visible}>
        <View style={[styles.container, styles.loaderContainer]}>
          <ActivityIndicator size="large" color={mainOrangeColor} />
        </View>
      </Modal>
    );
  }


  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onClose}
      >
        <StatusBar
          backgroundColor="#263238B2"
          barStyle="light-content"
        />
        <View style={styles.actionButtonContainer} pointerEvents="box-none">
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionRow}
              onPress={button.onPress}
              activeOpacity={0.8}
            >
              {button.label !== 'Close' ? (
                <>
                  <Text style={styles.actionLabel}>
                    {button.label}
                  </Text>
                  <View style={styles.actionButton}>
                    <Image
                      source={button.icon}
                      style={styles.actionIcon}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.closeButton}>
                  <Image
                    source={button.icon}
                    style={styles.closeIcon}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default AllTaskModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#263238B2',
    padding: 15,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    alignItems: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  actionLabel: {
    color: mainWhiteColor,
    fontSize: normalize(16),
    marginRight: normalize(15),
    fontFamily: fonts.PoppinsMedium,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    transform: [{ rotate: '45deg' }],
    tintColor: '#000',
  },
});
