import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import React from 'react';
import CustomText from '../../utils/CustomText';

const ButtonContainer = ({ Type, setNonUserAxist, setLoginPageCondition }) => {
  const handleButtonPress = () => {
    if (Type === 'Exit App') {
      setNonUserAxist(false);
      BackHandler.exitApp();
    } else if (Type === 'Try Again') {
      setLoginPageCondition(false);
      setNonUserAxist(false);
    } else if (Type === 'Go Back') {
      BackHandler.exitApp();
    }
  };
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FC8C4D',
        width: 160,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 10,
      }}
      onPress={handleButtonPress}>
      <CustomText style={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}>
        {Type}
      </CustomText>
    </TouchableOpacity>
  );
};

export default ButtonContainer;
