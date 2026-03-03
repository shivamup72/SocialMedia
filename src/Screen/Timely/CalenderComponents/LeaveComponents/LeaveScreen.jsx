import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fonts,
  DarkColor,
  DarkColor60,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor80,
  DarkColor50,
  DarkColor40,
  DarkColor30,
} from '../../../../utils/style/fonts';
import CalenderSvg from '../../../../assets/svg/CalenderSvg';
import HeaderComponents from '../../../../components/HeaderComponents/HeaderComponents';
import { PostTakeLeaveApi, PatchEditLeaveApi } from '../../../../Api/config/TimelyApi';
import Toast from '../../../../Api/context/Toast';
import CommonDateTimePicker from '../../../../components/CommonDateTimePicker/CommonDateTimePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
const errorColor = 'red';
import { useSettings } from '../../../../Api/context/SettingsContext';
import UserListingComponents from '../../../../components/UserListingComponents/UserListingComponents';
import { FormatDDMMYYYwithoutLine } from '../../../../utils/CommonUtils';
import CustomText from '../../../../utils/CustomText';

const NewLeaveScreen = ({ navigation, route }) => {
  const { isEdit, item } = route.params || {};
  const [leaveType, setLeaveType] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [leaveReason, setLeaveReason] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerFor, setPickerFor] = useState('from');
  const [modalType, setModalType] = useState(false);
  const { settings, updateSettings, SelectedMembers } = useSettings();

  const [errors, setErrors] = useState({});

  const toastRef = useRef(null);
  const leaveTypes = [
    { label: 'Full Day', value: 'full_day' },
    { label: 'Half Day', value: 'half_day' },
  ];

  useEffect(() => {
    if (isEdit && item) {
      const leaveTypeItem = leaveTypes.find(lt => lt.value === item.leave_type);
      if (leaveTypeItem) {
        setLeaveType(leaveTypeItem);
      }
      setFromDate(new Date(item.start_date));
      setToDate(new Date(item.end_date));
      setLeaveReason(item.reason);
    }
  }, [isEdit, item]);

  const formatDate = date => {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const onDateChange = selectedDate => {
    setShowPicker(false);
    if (selectedDate) {
      if (pickerFor === 'from') {
        setFromDate(selectedDate);
        if (selectedDate > toDate) {
          setToDate(selectedDate);
        }
      } else {
        setToDate(selectedDate);
      }
    }
  };

  const showDatepicker = forInput => {
    setPickerFor(forInput);
    setShowPicker(true);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }
    if (!fromDate) {
      newErrors.fromDate = 'Please select a start date';
    }
    if (!toDate) {
      newErrors.toDate = 'Please select an end date';
    }
    if (toDate < fromDate) {
      newErrors.toDate = 'End date cannot be earlier than start date';
    }
    if (!leaveReason.trim()) {
      newErrors.leaveReason = 'Please enter a reason for your leave';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const object = {
        leave_type: leaveType.value,
        start_date: fromDate.toISOString().split('T')[0],
        end_date: toDate.toISOString().split('T')[0],
        reason: leaveReason,
      };

      if (isEdit) {
        handleUpdate(object);
      } else {
        handleCreate(object);
      }
    }
  };

  const handleCreate = async object => {
    try {
      console.log(
        'Leave Object on page =-=-=>',
        '\n',
        SelectedMembers,
        '\n',
        '\n',
      );

      // if (SelectedMembers?.workspace_manager_name === null) {
      //   setModalType(true);
      // } else {
      const response = await PostTakeLeaveApi(object);

      if (response.success) {
        toastRef.current.show({
          type: 'success',
          message: response?.message || 'Leave request submitted successfully.',
        });
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Failed to submit leave request.',
        });
      }
      // }
    } catch (error) {
      console.log('Leave Error on page =-=-=>', error);
      toastRef.current.show({
        type: 'error',
        message: 'An unexpected error occurred.',
      });
    }
  };

  const handleUpdate = async object => {
    try {
      const response = await PatchEditLeaveApi(item.id, object);
      if (response.success) {
        toastRef.current.show({
          type: 'success',
          message: response?.message || 'Leave request updated successfully.',
        });
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.message || 'Failed to update leave request.',
        });
      }
    } catch (error) {
      console.log('Update Leave Error on page =-=-=>', error);
      toastRef.current.show({
        type: 'error',
        message: 'An unexpected error occurred.',
      });
    }
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  // useEffect(() => {
  //   if (SelectedMembers?.workspace_manager_name === null) {
  //     setModalType(true);
  //   }
  // }, [SelectedMembers]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <HeaderComponents
          navigation={navigation}
          Type={isEdit ? 'Edit Leave' : 'New Leave'}
        />

        <View style={{ margin: 16, flex: 1 }}>
          <View style={styles.inputGroup}>
            <CustomText style={styles.label}>Leave Type</CustomText>
            <Dropdown
              style={[styles.dropdown, errors.leaveType && styles.errorBorder]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemTextStyle={{ color: DarkColor80 }}
              data={leaveTypes}
              containerStyle={{ color: DarkColor80 }}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Leave type"
              value={leaveType?.value}
              onChange={item1 => {
                setLeaveType(item1);
                if (errors.leaveType) {
                  setErrors({ ...errors, leaveType: null });
                }
              }}
            />
            {errors.leaveType && (
              <CustomText style={styles.errorText}>{errors.leaveType}</CustomText>
            )}
          </View>

          {/* Leave Date Picker */}
          <View style={styles.inputGroup}>
            <CustomText style={styles.label}>Leave Date</CustomText>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  errors.fromDate && styles.errorBorder,
                ]}
                onPress={() => showDatepicker('from')}
                activeOpacity={0.7}>
                <CustomText style={styles.dateText}>
                  {FormatDDMMYYYwithoutLine(fromDate) || 'From'}
                </CustomText>
                <CalenderSvg width="20" height="20" />
              </TouchableOpacity>
              <CustomText style={styles.arrow}>→</CustomText>
              <TouchableOpacity
                style={[styles.dateInput, errors.toDate && styles.errorBorder]}
                onPress={() => showDatepicker('to')}
                activeOpacity={0.7}>
                <CustomText style={styles.dateText}>
                  {FormatDDMMYYYwithoutLine(toDate) || 'To'}
                </CustomText>
                <CalenderSvg width="20" height="20" />
              </TouchableOpacity>
            </View>
            {errors.fromDate && (
              <CustomText style={styles.errorText}>{errors.fromDate}</CustomText>
            )}
            {errors.toDate && !errors.fromDate && (
              <CustomText style={styles.errorText}>{errors.toDate}</CustomText>
            )}
          </View>

          {/* Leave Reason Input */}
          <View style={styles.inputGroup}>
            <CustomText style={styles.label}>Leave Reason</CustomText>
            <TextInput
              style={[
                styles.reasonInput,
                errors.leaveReason && styles.errorBorder,
              ]}
              placeholder="Enter reason here"
              placeholderTextColor={DarkColor60}
              multiline
              numberOfLines={4}
              value={leaveReason}
              onChangeText={text => {
                setLeaveReason(text);
                if (errors.leaveReason) {
                  setErrors({ ...errors, leaveReason: null });
                }
              }}
              allowFontScaling={false}
            />
            {errors.leaveReason && (
              <CustomText style={styles.errorText}>{errors.leaveReason}</CustomText>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}>
            <CustomText style={styles.saveButtonText}>
              {isEdit ? 'Update' : 'Save'}
            </CustomText>
          </TouchableOpacity>
        </View>

        <Toast ref={toastRef} />

        <UserListingComponents
          visible={modalType}
          onClose={() => setModalType(false)}
          idCheck={SelectedMembers?.id}
        />

        {showPicker && (
          <CommonDateTimePicker
            isVisible={showPicker}
            onConfirm={onDateChange}
            onCancel={handleCancel}
            value={pickerFor === 'from' ? fromDate : toDate}
            minimumDate={pickerFor === 'to' ? fromDate : new Date()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    borderColor: DarkColor50,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: mainWhiteColor,
    color: DarkColor,
  },
  placeholderStyle: {
    fontSize: 16,
    color: DarkColor60,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: DarkColor,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderColor: DarkColor40,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: mainWhiteColor,
  },
  dateText: {
    fontSize: 14,
    color: DarkColor,
    fontFamily: fonts.PoppinsRegular,
  },
  arrow: {
    fontSize: 24,
    color: DarkColor,
    marginHorizontal: 10,
  },
  reasonInput: {
    height: 120,
    borderColor: DarkColor40,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: mainWhiteColor,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  saveButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: mainWhiteColor,
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
  },
  errorBorder: {
    borderColor: errorColor,
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    marginTop: 5,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default NewLeaveScreen;
