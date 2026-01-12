// import {StyleSheet, Text, View} from 'react-native';
// import React, {useState} from 'react';
// import {Dropdown} from 'react-native-element-dropdown';

// const CustomDropdown = ({data, placeholder, setValue, value}) => {
//   // const [value, setValue] = useState(null);
//   const [isFocus, setIsFocus] = useState(false);

//   return (
//     <Dropdown
//       style={[styles.dropdown, isFocus && {borderColor: '#007BFF'}]}
//       placeholderStyle={styles.placeholderStyle}
//       selectedTextStyle={styles.selectedTextStyle}
//       inputSearchStyle={styles.inputSearchStyle}
//       iconStyle={styles.iconStyle}
//       data={data}
//       maxHeight={300}
//       labelField="label"
//       valueField="value"
//       placeholder={!isFocus ? placeholder : '...'}
//       value={value}
//       onFocus={() => setIsFocus(true)}
//       onBlur={() => setIsFocus(false)}
//       onChange={item => {
//         setValue(item.value);
//         setIsFocus(false);
//       }}
//       // renderRightIcon={() => (isFocus ? <DropUpSvg /> : <DropDownSvgIcon />)}
//     />
//   );
// };

// export default CustomDropdown;

// const styles = StyleSheet.create({
//   dropdown: {
//     height: 50,
//     borderColor: '#E0E0E0',
//     borderWidth: 1,
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     marginBottom: 5,
//   },
//   placeholderStyle: {
//     fontSize: 16,
//     color: '#A0A0A0',
//   },
//   selectedTextStyle: {
//     fontSize: 16,
//     color: '#333',
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//   },
//   inputSearchStyle: {
//     height: 40,
//     fontSize: 16,
//   },
// });

import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { fonts, DarkColor60, DarkColor, DarkColor80 } from '../../utils/style/fonts';

// 1. Change the prop from `setValue` to `onChange`
const CustomDropdown = ({
  data,
  placeholder,
  onChange,
  value,
  dropdownPosition = 'bottom',
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: '#007BFF' }]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      itemTextStyle={styles.itemTextStyle}
      iconStyle={styles.iconStyle}
      dropdownPosition={dropdownPosition}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={!isFocus ? placeholder : '...'}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      // 2. Call the new `onChange` prop here
      onChange={item => {
        if (onChange) {
          onChange(item); // Pass the entire selected item object back
        }
        setIsFocus(false);
      }}
    />
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdown: {
    height: 45,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#A0A0A0',
    fontFamily: fonts.PoppinsRegular, // Apply the desired font family for the placeholder text
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium, // Apply the desired font family for the selected text conte
    color: DarkColor80,
  },
  itemTextStyle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular, // Apply the desired font family for the dropdown item text
    color: DarkColor80,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
