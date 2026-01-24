// import {
//   StyleSheet,
//   Text,
//   View,
//   StatusBar,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
// } from 'react-native';
// import React, {useState, useRef} from 'react';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import Toast from '../../../context/Toast';
// import Loader from '../../../Loader/loader';

// import {
//   fonts,
//   DarkColor,
//   mainWhiteColor,
//   mainOrangeColor,
//   DarkColor80,
//   DarkColor40,
//   DarkColor30,
//   DarkColor50,
// } from '../../../style/fonts';
// import CloseSvg from '../../../assets/svg/CloseSvg';

// import {PostExpenseClaimApi} from '../../../config/TimelyApi';

// import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
// import {Dropdown} from 'react-native-element-dropdown';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import DocumentPicker from 'react-native-document-picker';
// import CommonDateTimePicker from '../../../components/CommonDateTimePicker/CommonDateTimePicker';
// import CalenderSvg from '../../../assets/svg/CalenderSvg';
// import LightDeleteSvg from '../../../assets/svg/LightDeleteSvg';

// const ExpenseClaimScreen = ({navigation, route}) => {
//   const UploadImage = require('../../../assets/AssestsComponents/Png/Add_Image.png');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [Loader, setLoader] = useState(false);

//   console.log(
//     '\n',
//     '\n',
//     'Expense Claim Screen route?.params?.item  -=-=-=-=->',
//     route?.params?.DataList,
//     '\n',
//     '\n',
//     '\n',
//   );

//   const handleRemoveClaim = index => {
//     if (claims.length > 1) {
//       const newClaims = [...claims];
//       newClaims.splice(index, 1);
//       setClaims(newClaims);
//     }
//   };

//   const [claims, setClaims] = useState([
//     {
//       id: 1,

//       expenseType: null,
//       amount: '',
//       description: '',
//       billProof: null,
//       errors: {},
//     },
//   ]);

//   const toastRef = useRef(null);

//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [datePickerIndex, setDatePickerIndex] = useState(0);

//   const expenseTypes = [
//     {label: 'Accommodation Bill', value: 'Accommodation Bill'},
//     {label: 'Travel Bill', value: 'Travel Bill'},
//     {label: 'Fuel Bill', value: 'Fuel Bill'},
//     {label: 'Food Bill', value: 'Food Bill'},
//     {label: 'Phone Bill', value: 'Phone Bill'},
//     {label: 'Printing Bill', value: 'Printing Bill'},
//     {label: 'Others', value: 'Others'},
//   ];

//   const handleInputChange = (index, field, value) => {
//     const newClaims = [...claims];
//     newClaims[index][field] = value;
//     if (newClaims[index].errors[field]) {
//       delete newClaims[index].errors[field];
//     }
//     setClaims(newClaims);
//   };

//   const handleAddMore = () => {
//     const lastClaimIndex = claims.length - 1;
//     const lastClaim = claims[lastClaimIndex];
//     const errors = {};
//     let isLastClaimValid = true;

//     // if (!lastClaim.claimDate) {
//     //   errors.claimDate = 'Claim Date is required.';
//     //   isLastClaimValid = false;
//     // }

//     if (!lastClaim.expenseType) {
//       errors.expenseType = 'Expense Claim type is required.';
//       isLastClaimValid = false;
//     }

//     if (!lastClaim.amount.trim()) {
//       errors.amount = 'Amount is required.';
//       isLastClaimValid = false;
//     } else if (isNaN(lastClaim.amount)) {
//       errors.amount = 'Amount must be a number.';
//       isLastClaimValid = false;
//     }

//     if (!lastClaim.description.trim()) {
//       errors.description = 'Description is required.';
//       isLastClaimValid = false;
//     }

//     if (!isLastClaimValid) {
//       const newClaims = [...claims];
//       newClaims[lastClaimIndex].errors = errors;
//       setClaims(newClaims);
//       console.log('Please fill the current form before adding a new one.');
//       return;
//     }

//     setClaims([
//       ...claims,
//       {
//         id: claims.length + 1,
//         claimDate: null,
//         expenseType: null,
//         amount: '',
//         description: '',
//         billProof: null,
//         errors: {},
//       },
//     ]);
//   };

//   const onDateChange = (event, selectedDate1) => {
//     setShowDatePicker(false);
//     if (selectedDate1) {
//       setSelectedDate(selectedDate1);
//     }
//   };

//   const showDatepickerFor = index => {
//     Keyboard.dismiss();
//     setDatePickerIndex(index);
//     setShowDatePicker(true);
//   };

//   const handlePickDocument = async index => {
//     try {
//       const res = await DocumentPicker.pick({
//         type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
//       });
//       handleInputChange(index, 'billProof', res[0]);
//     } catch (err) {
//       if (DocumentPicker.isCancel(err)) {
//       } else {
//         throw err;
//       }
//     }
//   };

//   const validate = () => {
//     let isValid = true;
//     const newClaims = claims.map(claim => {
//       const errors = {};
//       if (!selectedDate) {
//         errors.claimDate = 'Claim Date is required.';
//         isValid = false;
//       }
//       if (!claim.expenseType) {
//         errors.expenseType = 'Expense Claim type is required.';
//         isValid = false;
//       }
//       if (!claim.amount.trim()) {
//         errors.amount = 'Amount is required.';
//         isValid = false;
//       } else if (isNaN(claim.amount)) {
//         errors.amount = 'Amount must be a number.';
//         isValid = false;
//       }
//       if (!claim.description.trim()) {
//         errors.description = 'Description is required.';
//         isValid = false;
//       }
//       claim.errors = errors;
//       return claim;
//     });
//     setClaims(newClaims);
//     return isValid;
//   };

//   const handleSave = async () => {
//     if (!validate()) {
//       // console.log('Validation Failed');
//       return;
//     }

//     try {
//       const formData = new FormData();

//       if (selectedDate === null) {
//         toastRef.current.show({
//           type: 'error',
//           message: 'Please select a Claim Date.',
//         });
//         return;
//       }

//       formData.append('expense_date', selectedDate.toISOString().split('T')[0]);

//       const requestData = {
//         expense_date: selectedDate.toISOString().split('T')[0],
//         expense_items: claims.map((claim, index) => ({
//           expense_type: claim.expenseType,
//           amount: claim.amount,
//           description: claim.description,
//         })),
//       };

//       // console.log('\n');
//       // console.log(
//       //   'Submitting expense claim with data:',
//       //   JSON.stringify(requestData, null, 2),
//       // );
//       // console.log('\n');

//       const response = await PostExpenseClaimApi(requestData);

//       if (response.success) {
//         toastRef.current.show({
//           type: 'success',
//           message: response.message,
//         });
//         setTimeout(() => {
//           navigation.goBack();
//         }, 1000);
//       } else {
//         toastRef.current.show({
//           type: 'error',
//           message: response.message,
//         });
//       }
//     } catch (error) {
//       console.log('Error submitting expense claim:', error);
//       toastRef.current.show({
//         type: 'error',
//         message: error?.message,
//       });
//     }
//   };

//   // console.log('Claims:', JSON.stringify(claims, null, 2));

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
//       <HeaderComponents Type={'Expense Claim'} navigation={navigation} />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
//         style={styles.keyboardAvoidingView}>
//         <ScrollView
//           contentContainerStyle={styles.scrollView}
//           keyboardShouldPersistTaps="handled">
//           <View style={styles.fieldContainer}>
//             <Text style={styles.label}>Claim Date*</Text>
//             <TouchableOpacity
//               style={styles.dateInputContainer}
//               onPress={() => setShowDatePicker(true)}>
//               <Text
//                 style={selectedDate ? styles.dateText : styles.placeholderText}>
//                 {selectedDate
//                   ? selectedDate.toLocaleDateString()
//                   : 'Select Date'}
//               </Text>
//               <CalenderSvg width="18" height="18" />
//             </TouchableOpacity>
//             {claims[0]?.errors?.claimDate && (
//               <Text style={styles.errorText}>{claims[0].errors.claimDate}</Text>
//             )}
//           </View>

//           {claims.map((claim, index) => (
//             <View key={claim.id} style={styles.claimContainer}>
//               {index > 0 && (
//                 <TouchableOpacity
//                   style={styles.removeButton}
//                   onPress={() => handleRemoveClaim(index)}>
//                   <LightDeleteSvg width="22" height="22" />
//                 </TouchableOpacity>
//               )}
//               <View style={styles.fieldContainer}>
//                 <Text style={styles.label}>Expense Claim*</Text>
//                 <Dropdown
//                   style={styles.dropdown}
//                   placeholderStyle={styles.placeholderText}
//                   selectedTextStyle={styles.selectedTextStyle}
//                   itemTextStyle={{color: DarkColor80}}
//                   data={expenseTypes}
//                   maxHeight={300}
//                   labelField="label"
//                   valueField="value"
//                   placeholder="Select"
//                   value={claim.expenseType}
//                   onChange={item => {
//                     handleInputChange(index, 'expenseType', item.value);
//                   }}
//                 />
//                 {claim.errors.expenseType && (
//                   <Text style={styles.errorText}>
//                     {claim.errors.expenseType}
//                   </Text>
//                 )}
//               </View>

//               <View style={styles.fieldContainer}>
//                 <Text style={styles.label}>Amount*</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter Amt."
//                   keyboardType="numeric"
//                   value={claim.amount}
//                   onChangeText={text =>
//                     handleInputChange(index, 'amount', text)
//                   }
//                 />
//                 {claim.errors.amount && (
//                   <Text style={styles.errorText}>{claim.errors.amount}</Text>
//                 )}
//               </View>

//               <View style={styles.fieldContainer}>
//                 <Text style={styles.label}>Description*</Text>
//                 <TextInput
//                   style={[styles.input, styles.descriptionInput]}
//                   placeholder="Write here"
//                   multiline
//                   value={claim.description}
//                   onChangeText={text =>
//                     handleInputChange(index, 'description', text)
//                   }
//                 />
//                 {claim.errors.description && (
//                   <Text style={styles.errorText}>
//                     {claim.errors.description}
//                   </Text>
//                 )}
//               </View>

//               <View style={styles.fieldContainer}>
//                 <Text style={styles.label}>Bill Proof</Text>
//                 <TouchableOpacity
//                   onPress={() => handlePickDocument(index)}
//                   style={styles.billProofContainer}>
//                   <Image source={UploadImage} style={styles.uploadIcon} />
//                   <Text style={styles.uploadText}>ADD IMAGE/PDF</Text>
//                 </TouchableOpacity>
//                 {claim.billProof && (
//                   <Text style={styles.fileUploadedText}>
//                     File Uploaded: {claim.billProof.name}
//                   </Text>
//                 )}
//               </View>

//               {index === claims.length - 1 && (
//                 <TouchableOpacity
//                   style={styles.addMoreButton}
//                   onPress={handleAddMore}>
//                   <Text style={styles.addMoreText}>+ Add more</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}

//           {showDatePicker && Platform.OS === 'android' && (
//             <DateTimePicker
//               testID="dateTimePicker"
//               value={claims[datePickerIndex].claimDate || new Date()}
//               mode={'date'}
//               display="default"
//               onChange={onDateChange}
//               maximumDate={new Date()}
//             />
//           )}

//           {showDatePicker && Platform.OS === 'ios' && (
//             <CommonDateTimePicker
//               show={showDatePicker}
//               onClose={() => setShowDatePicker(false)}
//               value={claims[datePickerIndex].claimDate || new Date()}
//               onChange={onDateChange}
//               maximumDate={new Date()}
//             />
//           )}
//         </ScrollView>
//         <View style={styles.saveButtonContainer}>
//           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//             <Text style={styles.saveButtonText}>Save</Text>
//           </TouchableOpacity>
//         </View>
//         <Toast ref={toastRef} />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default ExpenseClaimScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: mainWhiteColor,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   scrollView: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     marginTop: 15,
//   },
//   claimContainer: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     position: 'relative',
//   },
//   removeButton: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     // backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   removeButtonText: {
//     color: 'white',
//     fontSize: 18,
//     lineHeight: 20,
//     fontWeight: 'bold',
//     marginTop: -2,
//   },
//   fieldContainer: {
//     marginBottom: 15,
//   },
//   label: {
//     fontFamily: fonts.PoppinsMedium,
//     color: DarkColor,
//     marginBottom: 8,
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: DarkColor50,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     fontFamily: fonts.PoppinsRegular,
//     fontSize: 14,
//     color: DarkColor80,
//   },
//   descriptionInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   dateInputContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: DarkColor50,
//     borderRadius: 6,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//   },
//   dateText: {
//     fontFamily: fonts.PoppinsRegular,
//     fontSize: 14,
//     color: DarkColor80,
//   },
//   placeholderText: {
//     fontFamily: fonts.PoppinsRegular,
//     fontSize: 14,
//     color: DarkColor50,
//   },
//   dropdown: {
//     height: 50,
//     borderColor: DarkColor50,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//   },
//   selectedTextStyle: {
//     fontSize: 14,
//     fontFamily: fonts.PoppinsRegular,
//     color: DarkColor80,
//   },
//   billProofContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: mainOrangeColor,
//     borderStyle: 'dashed',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FAFAFA',
//   },
//   uploadIcon: {
//     width: 70,
//     height: 70,
//     marginBottom: 8,
//   },
//   uploadText: {
//     fontFamily: fonts.PoppinsRegular,
//     fontSize: 10,
//     color: DarkColor,
//   },
//   fileUploadedText: {
//     fontFamily: fonts.PoppinsRegular,
//     fontSize: 12,
//     color: 'green',
//     marginTop: 8,
//   },
//   addMoreButton: {
//     backgroundColor: mainOrangeColor,
//     paddingVertical: 8,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 10,
//     width: 160,
//   },
//   addMoreText: {
//     color: mainWhiteColor,
//     fontFamily: fonts.PoppinsMedium,
//   },
//   saveButtonContainer: {
//     // This is no longer absolutely positioned
//     padding: 20,
//     backgroundColor: mainWhiteColor,
//     borderTopWidth: 0.3,
//     borderColor: DarkColor50,
//   },
//   saveButton: {
//     backgroundColor: mainOrangeColor,
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: mainWhiteColor,
//     fontFamily: fonts.PoppinsBold,
//     fontSize: 16,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     fontFamily: fonts.PoppinsRegular,
//     marginTop: 4,
//   },
// });

///
///
///

import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '../../../../Api/context/Toast';
// import Loader from '../../../Loader/loader';
// import { FormatDDMMYYYY } from '../../../utils/CommonUtils';

import {
  fonts,
  DarkColor,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor80,
  DarkColor40,
  DarkColor30,
  DarkColor50,
  DarkCOlor30,
} from '../../../../utils/style/fonts';
// import CloseSvg from '../../../assets/svg/CloseSvg';

import {
  PostExpenseClaimApi,
  PatchExpenseClaimApi,
} from '../../../../Api/config/TimelyApi'; // Import the update API function

// import HeaderComponents from '../../../components/HeaderComponents/HeaderComponents';
import { Dropdown } from 'react-native-element-dropdown';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import CommonDateTimePicker from '../../../../components/CommonDateTimePicker/CommonDateTimePicker';
import CalenderSvg from '../../../../assets/svg/CalenderSvg';
import LightDeleteSvg from '../../../../assets/svg/LightDeleteSvg';
import { FormatDDMMYYYwithoutLine } from '../../../../utils/CommonUtils';

const ExpenseClaimScreen = ({ navigation, route }) => {
  const { isEdit, DataList } = route.params || {};
  const UploadImage = require('../../../../assets/AssestsComponents/Png/Add_Image.png');
  const [selectedDate, setSelectedDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const toastRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [claims, setClaims] = useState([
    {
      id: 1,
      expenseType: null,
      amount: '',
      description: '',
      billProof: null,
      errors: {},
    },
  ]);

  // Effect to populate data when in edit mode
  useEffect(() => {
    if (isEdit && DataList) {
      setSelectedDate(new Date(DataList.expense_date));
      const formattedClaims = DataList.expense_items.map(item => ({
        ...item,
        expenseType: item.expense_type,
        amount: item.amount.toString(),
        billProof: null, // Bill proof needs custom handling to show existing files
        errors: {},
      }));
      setClaims(formattedClaims);
    }
  }, [isEdit, DataList]);

  const expenseTypes = [
    { label: 'Accommodation Bill', value: 'Accommodation Bill' },
    { label: 'Travel Bill', value: 'Travel Bill' },
    { label: 'Fuel Bill', value: 'Fuel Bill' },
    { label: 'Food Bill', value: 'Food Bill' },
    { label: 'Phone Bill', value: 'Phone Bill' },
    { label: 'Printing Bill', value: 'Printing Bill' },
    { label: 'Others', value: 'Others' },
  ];

  const handleRemoveClaim = index => {
    if (claims.length > 1) {
      const newClaims = [...claims];
      newClaims.splice(index, 1);
      setClaims(newClaims);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newClaims = [...claims];
    newClaims[index][field] = value;
    if (newClaims[index].errors[field]) {
      delete newClaims[index].errors[field];
    }
    setClaims(newClaims);
  };

  const handleAddMore = () => {
    const lastClaim = claims[claims.length - 1];
    if (
      !lastClaim.expenseType ||
      !lastClaim.amount.trim() ||
      !lastClaim.description.trim()
    ) {
      toastRef.current.show({
        type: 'error',
        message: 'Please fill the current form before adding a new one',
      });
      return;
    }

    setClaims([
      ...claims,
      {
        id: claims.length + 1,
        expenseType: null,
        amount: '',
        description: '',
        billProof: null,
        errors: {},
      },
    ]);
  };

  const onDateChange = date => {
    // First, close the picker
    setShowDatePicker(false);
    // console.log('date -=-=-=-=---->', date, '\n');
    // Then, update the state with the selected date
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePickDocument = async index => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      handleInputChange(index, 'billProof', res[0]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
  };

  const validate = () => {
    let isValid = true;
    const newClaims = claims.map(claim => {
      const errors = {};
      if (!selectedDate) {
        errors.claimDate = 'Claim Date is required';
        isValid = false;
      }
      if (!claim.expenseType) {
        errors.expenseType = 'Expense Claim type is required';
        isValid = false;
      }
      if (!claim.amount.trim()) {
        errors.amount = 'Amount is required';
        isValid = false;
      } else if (isNaN(claim.amount)) {
        errors.amount = 'Amount must be a number';
        isValid = false;
      }
      if (!claim.description.trim()) {
        errors.description = 'Description is required';
        isValid = false;
      }
      claim.errors = errors;
      return claim;
    });
    setClaims(newClaims);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const requestData = {
      expense_date: selectedDate.toISOString().split('T')[0],
      expense_items: claims.map(claim => ({
        ...(isEdit && { id: claim.id }), // Include id if it exists (for updates)
        expense_type: claim.expenseType,
        amount: claim.amount,
        description: claim.description,
      })),
    };

    if (isEdit) {
      await handleUpdate(DataList.id, requestData);
    } else {
      await handleCreate(requestData);
    }
  };

  const handleCreate = async requestData => {
    try {
      const response = await PostExpenseClaimApi(requestData);
      if (response.success) {
        toastRef.current.show({
          type: 'success',
          message: response.message || 'Expense claim submitted!',
        });
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response.message || 'Submission failed',
        });
      }
    } catch (error) {
      console.log('Error submitting expense claim:', error);
      toastRef.current.show({
        type: 'error',
        message: 'An unexpected error occurred',
      });
    }
  };

  const handleUpdate = async (claimId, requestData) => {
    try {
      const response = await PatchExpenseClaimApi(claimId, requestData);
      if (response.success) {
        toastRef.current.show({
          type: 'success',
          message: response.message || 'Expense claim updated!',
        });
        setTimeout(() => {
          navigation.pop(2);
        }, 500);
      } else {
        toastRef.current.show({
          type: 'error',
          message: response.message || 'Update failed',
        });
      }
    } catch (error) {
      console.log('Error updating expense claim:', error);
      toastRef.current.show({
        type: 'error',
        message: 'An unexpected error occurred',
      });
    }
  };

  const handleCancel = () => {
    setShowDatePicker(false);
  };

  // console.log('date -=-=-=------->', selectedDate, '\n', '\n');
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      {/* <HeaderComponents
        Type={isEdit ? 'Edit Expense Claim' : 'Expense Claim'}
        navigation={navigation}
      /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled">
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Claim Date*</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}>
              <Text
                style={selectedDate ? styles.dateText : styles.placeholderText}>
                {selectedDate
                  ? FormatDDMMYYYwithoutLine(new Date(selectedDate))
                  : 'Select Date'}
              </Text>
              <CalenderSvg width="18" height="18" />
            </TouchableOpacity>
            {claims[0]?.errors?.claimDate && (
              <Text style={styles.errorText}>{claims[0].errors.claimDate}</Text>
            )}
          </View>

          {claims.map((claim, index) => (
            <View key={claim.id} style={styles.claimContainer}>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveClaim(index)}>
                  <LightDeleteSvg width="22" height="22" />
                </TouchableOpacity>
              )}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Expense Claim*</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderText}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemTextStyle={{ color: DarkColor80 }}
                  data={expenseTypes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Claim Type"
                  value={claim.expenseType}
                  onChange={item => {
                    handleInputChange(index, 'expenseType', item.value);
                  }}
                />
                {claim.errors.expenseType && (
                  <Text style={styles.errorText}>
                    {claim.errors.expenseType}
                  </Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Amount*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Amount"
                  placeholderTextColor={DarkCOlor30}
                  keyboardType="numeric"
                  value={claim.amount}
                  onChangeText={text =>
                    handleInputChange(index, 'amount', text)
                  }
                  maxLength={10}
                />
                {claim.errors.amount && (
                  <Text style={styles.errorText}>{claim.errors.amount}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Write something here..."
                  placeholderTextColor={DarkCOlor30}
                  multiline
                  value={claim.description}
                  onChangeText={text =>
                    handleInputChange(index, 'description', text)
                  }
                />
                {claim.errors.description && (
                  <Text style={styles.errorText}>
                    {claim.errors.description}
                  </Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Bill Proof</Text>
                <TouchableOpacity
                  onPress={() => handlePickDocument(index)}
                  style={styles.billProofContainer}>
                  <Image source={UploadImage} style={styles.uploadIcon} />
                  <Text style={styles.uploadText}>ADD IMAGE/PDF</Text>
                </TouchableOpacity>
                {claim.billProof && (
                  <Text style={styles.fileUploadedText}>
                    File Uploaded: {claim.billProof.name}
                  </Text>
                )}
              </View>

              {index === claims.length - 1 && (
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handleAddMore}>
                  <Text style={styles.addMoreText}>+ Add more</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {showDatePicker && (
            <CommonDateTimePicker
              isVisible={showDatePicker}
              onConfirm={onDateChange}
              onCancel={handleCancel}
              value={selectedDate || new Date()}
              maximumDate={new Date()}
            />
          )}
        </ScrollView>
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        <Toast ref={toastRef} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ExpenseClaimScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 15,
  },
  claimContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: DarkColor50,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor80,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkColor50,
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor80,
  },
  placeholderText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    color: DarkColor50,
  },
  dropdown: {
    height: 50,
    borderColor: DarkColor50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
  },
  billProofContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mainOrangeColor,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  uploadText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 10,
    color: DarkColor,
  },
  fileUploadedText: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 12,
    color: 'green',
    marginTop: 8,
  },
  addMoreButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: 160,
  },
  addMoreText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
  },
  saveButtonContainer: {
    padding: 20,
    backgroundColor: mainWhiteColor,
    borderTopWidth: 0.3,
    borderColor: DarkColor50,
  },
  saveButton: {
    backgroundColor: mainOrangeColor,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsBold,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 4,
  },
});
