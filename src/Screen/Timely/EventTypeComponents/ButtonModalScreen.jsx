import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalenderSvg from '../../../assets/svg/CalenderSvg';
// import CloseSvg from '../../assets/svg/CloseSvg';
import {
  DarkColor,
  DarkColor80,
  mainOrangeColor,
  fonts,
  DarkColor50,
  DarkColor60,
  mainWhiteColor,
  DarkColor20,
} from '../../../utils/style/fonts';
import { PatchTaskUpdateApi } from '../../../Api/config/TimelyApi';

import { formatDateInMonth, DiffrenceIndates } from '../../../utils/CommonUtils';

const ButtonModalScreen = ({
  isDoneModalVisible,
  setDoneModalVisible,
  isRescheduleModalVisible,
  setRescheduleModalVisible,
  Data,
  navigation,
  subTackStatus,
}) => {
  // console.log(
  //   'Data -=-=-=-=>',
  //   JSON.stringify(Data),
  //   '\n',
  //   '\n',
  //   subTackStatus,
  // );
  const CloseImage = require('../../../assets/Png/CloseModalimage.png');
  const ShowImagePlace = require('../../../assets/AssestsComponents/Png/Add_Image.png');
  const [comment, setComment] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(
    new Date(Data?.end_date),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  const timeData = [
    { label: '10:00 am', value: '10:00' },
    { label: '10:30 am', value: '10:30' },
    { label: '11:00 am', value: '11:00' },
    { label: '11:30 am', value: '11:30' },
    { label: '12:00 pm', value: '12:00' },
    { label: '12:30 pm', value: '12:30' },
    { label: '1:00 pm', value: '13:00' },
    { label: '1:30 pm', value: '13:30' },
    { label: '2:00 pm', value: '14:00' },
    { label: '2:30 pm', value: '14:30' },
    { label: '3:00 pm', value: '15:00' },
    { label: '3:30 pm', value: '15:30' },
    { label: '4:00 pm', value: '16:00' },
    { label: '4:30 pm', value: '16:30' },
    { label: '5:00 pm', value: '17:00' },
    { label: '5:30 pm', value: '17:30' },
    { label: '6:00 pm', value: '18:00' },
    { label: '6:30 pm', value: '18:30' },
  ];

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || rescheduleDate;
    setShowDatePicker(Platform.OS === 'ios');
    setRescheduleDate(currentDate);
  };

  const handleDoneSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert(
        'Comment Required',
        'Please add a comment before marking as done.',
        [{ text: 'OK' }],
      );
      return;
    }

    const formData = new FormData();
    formData.append('mark_as_completed', true);
    formData.append('comment', comment);

    try {
      const response = await PatchTaskUpdateApi(Data?.id, formData);
      console.log('Patch Task API Response:', response);
      if (response?.success) {
        setDoneModalVisible(false);
        setComment('');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error patching task:', error);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert(
        'Comment Required',
        'Please add a comment before rescheduling.',
        [{ text: 'OK' }],
      );
      return;
    }

    if (!selectedTime) {
      Alert.alert('Time Required', 'Please select a time for rescheduling.', [
        { text: 'OK' },
      ]);
      return;
    }

    if (!rescheduleDate) {
      Alert.alert('Date Required', 'Please select a date for rescheduling.', [
        { text: 'OK' },
      ]);
      return;
    }

    const formData = new FormData();
    formData.append('end_date', rescheduleDate.toISOString().split('T')[0]);
    formData.append('end_time', selectedTime);
    // formData.append('comment', comment);

    // console.log('Form Data: ---==--->', formData);

    try {
      const response = await PatchTaskUpdateApi(Data?.id, formData);
      console.log('Patch Task API Response:', response);
      if (response?.success) {
        setDoneModalVisible(false);
        setComment('');
        navigation.goBack();
        setRescheduleModalVisible(false);
      }
    } catch (error) {
      console.error('Error patching task:', error);
    }
  };

  console.log('Data -=-=-=-=>', '\n', rescheduleDate);

  return (
    <>
      {/* Mark as Done Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDoneModalVisible}
        onRequestClose={() => setDoneModalVisible(false)}>
        <View style={styles.centeredView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDoneModalVisible(false)}>
            <Image source={CloseImage} style={styles.closeButtonImage} />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Mark task as done</Text>

            <Text style={styles.label}>Add image (optional)</Text>
            <View style={styles.imageUploader}>
              <Image source={ShowImagePlace} style={styles.placeholderImage} />
              <TouchableOpacity
                style={{
                  borderColor: mainOrangeColor,
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 5,
                }}>
                <Text style={styles.uploadText}>UPLOAD IMAGE</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Comment<Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Add your comment"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleDoneSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRescheduleModalVisible}
        onRequestClose={() => setRescheduleModalVisible(false)}>
        <View style={styles.centeredView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setRescheduleModalVisible(false)}>
            <Image source={CloseImage} style={styles.closeButtonImage} />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Reschedule: Follow-up.</Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.delayText}>
                Actual end date: {formatDateInMonth(Data?.end_date)}{' '}
              </Text>
              {new Date(Data?.end_date) < new Date() && (
                <Text style={styles.delayText}>
                  (Delay: {DiffrenceIndates(Data?.end_date, new Date())} days)
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>
                  Reschedule date<Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {formatDateInMonth(rescheduleDate)}
                  </Text>
                  <CalenderSvg width="18" height="18" color={DarkColor60} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={new Date(rescheduleDate)}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>
                  Reschedule time<Text style={{ color: 'red' }}>*</Text>
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemTextStyle={{
                    color: DarkColor80,
                    fontFamily: fonts.PoppinsRegular,
                  }}
                  data={timeData}
                  labelField="label"
                  valueField="value"
                  placeholder="10:00 am"
                  value={selectedTime}
                  onChange={item => {
                    setSelectedTime(item.value);
                  }}
                />
              </View>
            </View>

            <Text style={styles.label}>
              Comment<Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Add your comment"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRescheduleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ButtonModalScreen;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    // margin: 20,
    backgroundColor: '#ffffff',
    // borderRadius: 10,
    padding: 16,

    paddingTop: 20,

    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    borderTopWidth: 3,
    borderColor: mainOrangeColor,
  },
  closeButton: {
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  label: {
    fontSize: 12,
    color: DarkColor,
    marginBottom: 5,
    marginTop: 10,
    fontFamily: fonts.PoppinsRegular,
  },
  imageUploader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    marginRight: 15,
    resizeMode: 'contain',
  },
  uploadText: {
    color: mainOrangeColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
  },
  commentInput: {
    borderWidth: 0.5,
    borderColor: mainOrangeColor,
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: DarkColor,
  },
  submitButton: {
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
    paddingVertical: 15,
    elevation: 2,
  },
  submitButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsSemiBold,
    textAlign: 'center',
    fontSize: 16,
  },
  delayText: {
    fontSize: 12,
    color: DarkColor80,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    height: 40,
  },
  dropdown: {
    height: 40,
    borderColor: DarkColor50,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: DarkColor,
  },
  dateText: {
    color: DarkColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
  },
  closeButtonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
