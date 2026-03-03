import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather'; // Using Feather icons

const DarkColor = '#333';
const DarkColor80 = '#666';
const mainWhiteColor = '#fff';
const errorColor = '#D32F2F';
const fonts = {
  PoppinsMedium: 'Poppins-Medium',
  PoppinsRegular: 'Poppins-Regular',
};

import EyeIcon from '../../assets/LoginAssets/svg/uiw_eye_o';
import HideeyesSvg from '../../assets/LoginAssets/svg/Hide_eyes';
import CustomText from '../../utils/CustomText';


const CustomInput = ({
  label,
  iconName,
  error,
  isPassword,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.formGroup}>
      {label && <CustomText style={styles.inputLabel}>{label}</CustomText>}

      <View style={[styles.inputContainer, { borderColor: error ? errorColor : DarkColor80 }]}>

        <TextInput
          style={styles.textInput}
          placeholderTextColor={DarkColor80}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
          allowFontScaling={false}
        />
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            {isPasswordVisible ? <EyeIcon /> : <HideeyesSvg />}
          </TouchableOpacity>
        )}
      </View>

      {error && <CustomText style={styles.errorText}>{error}</CustomText>}
    </View>
  );
};


const styles = StyleSheet.create({
  formGroup: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mainWhiteColor,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1, // Take up all available space
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
});

export default CustomInput;