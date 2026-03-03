// import React, {useState, useEffect} from 'react';
// import {
//   Modal,
//   View,
//   TouchableOpacity,
//   Text,
//   Platform,
//   StyleSheet,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {mainOrangeColor, mainWhiteColor, DarkColor} from '../../style/fonts';

// const CommonDateTimePicker = ({
//   show,
//   onClose,
//   value,
//   onChange,
//   minimumDate,
//   maximumDate,
// }) => {
//   const [date, setDate] = useState(value);

//   useEffect(() => {
//     setDate(value);
//   }, [value]);

//   const handleDateChange = (event, selectedDate) => {
//     if (Platform.OS === 'android') {
//       onClose();
//       if (selectedDate) {
//         onChange(event, selectedDate);
//       }
//     } else {
//       setDate(selectedDate || date);
//     }
//   };

//   const handleDone = () => {
//     onClose();
//     onChange(null, date);
//   };

//   const renderIOSPicker = () => (
//     <Modal
//       transparent={true}
//       animationType="slide"
//       visible={show}
//       onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         <View style={styles.pickerContainer}>
//           <DateTimePicker
//             value={date}
//             mode="date"
//             display="inline"
//             onChange={handleDateChange}
//             minimumDate={minimumDate}
//             maximumDate={maximumDate}
//           />
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[styles.button, styles.cancelButton]}
//               onPress={onClose}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.doneButton]}
//               onPress={handleDone}>
//               <Text style={styles.buttonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderAndroidPicker = () => {
//     if (show) {
//       return (
//         <DateTimePicker
//           value={value}
//           mode="date"
//           display="default"
//           onChange={handleDateChange}
//           minimumDate={minimumDate}
//           maximumDate={maximumDate}
//         />
//       );
//     }
//     return null;
//   };

//   return Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker();
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   pickerContainer: {
//     backgroundColor: mainWhiteColor,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     flex: 1,
//   },
//   cancelButton: {
//     backgroundColor: '#e0e0e0',
//     marginRight: 10,
//   },
//   doneButton: {
//     backgroundColor: mainOrangeColor,
//   },
//   buttonText: {
//     color: DarkColor,
//     fontSize: 16,
//   },
// });

// export default CommonDateTimePicker;

//////
//////
///////////

// import React, {useState, useEffect} from 'react';
// import {
//   Modal,
//   View,
//   TouchableOpacity,
//   Text,
//   Platform,
//   StyleSheet,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {mainOrangeColor, mainWhiteColor, DarkColor} from '../../style/fonts'; // Adjust the import path as needed

// const CommonDateTimePicker = ({
//   show,
//   onClose,
//   value,
//   onChange,
//   mode = 'date', // New prop with 'date' as default
//   minimumDate,
//   maximumDate,
// }) => {
//   const [date, setDate] = useState(value);

//   useEffect(() => {
//     setDate(value);
//   }, [value]);

//   const handleDateChange = (event, selectedDate) => {
//     if (Platform.OS === 'android') {
//       onClose(); // Close on selection for Android
//       if (selectedDate) {
//         onChange(event, selectedDate);
//       }
//     } else {
//       // For iOS, update the temporary date state
//       setDate(selectedDate || date);
//     }
//   };

//   const handleDone = () => {
//     onClose();
//     onChange(null, date); // Pass the selected date back on "Done"
//   };

//   const renderIOSPicker = () => (
//     <Modal
//       transparent={true}
//       animationType="slide"
//       visible={show}
//       onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         <View style={styles.pickerContainer}>
//           <DateTimePicker
//             value={date}
//             mode={mode} // Use the mode prop
//             display={mode === 'date' ? 'inline' : 'spinner'} // Use 'inline' for date, 'spinner' for time
//             onChange={handleDateChange}
//             minimumDate={minimumDate}
//             maximumDate={maximumDate}
//           />
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[styles.button, styles.cancelButton]}
//               onPress={onClose}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.doneButton]}
//               onPress={handleDone}>
//               <Text style={styles.buttonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderAndroidPicker = () => {
//     if (show) {
//       return (
//         <DateTimePicker
//           value={value}
//           mode={mode} // Use the mode prop
//           display="default"
//           onChange={handleDateChange}
//           minimumDate={minimumDate}
//           maximumDate={maximumDate}
//         />
//       );
//     }
//     return null;
//   };

//   return Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker();
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   pickerContainer: {
//     backgroundColor: mainWhiteColor,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     flex: 1,
//   },
//   cancelButton: {
//     backgroundColor: '#e0e0e0',
//     marginRight: 10,
//   },
//   doneButton: {
//     backgroundColor: mainOrangeColor,
//   },
//   buttonText: {
//     color: DarkColor,
//     fontSize: 16,
//   },
// });

// export default CommonDateTimePicker;

///
///
///

import React from 'react';
import {Platform} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
const CommonDateTimePicker = ({
  isVisible,
  onConfirm,
  onCancel,
  value,
  mode = 'date',
  minimumDate,
  maximumDate,
}) => {
  return (
    <DateTimePickerModal
      isVisible={isVisible}
      date={value || new Date()}
      mode={mode}
      onConfirm={onConfirm}
      onCancel={onCancel}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      display={Platform.OS === 'ios' && mode === 'date' ? 'inline' : 'default'}
    />
  );
};

export default CommonDateTimePicker;
