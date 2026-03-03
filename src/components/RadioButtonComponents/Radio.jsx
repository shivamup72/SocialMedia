import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import {
  fonts,
  DarkColor80,
  DarkColor,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor50,
} from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const RadioButton = ({ label, selected, onPress, color = mainOrangeColor }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.outerCircle, { borderColor: color }]}>
        {selected && (
          <View style={[styles.innerDot, { backgroundColor: color }]} />
        )}
      </View>
      <CustomText allowFontScaling={false} style={styles.label}>{label}</CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Spacing between options
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  innerDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 12,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default RadioButton;
