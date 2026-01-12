import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts, DarkColor60 } from '../../utils/style/fonts';

const SettingLabel = ({ children, style }) => {
  return <Text style={[styles.settingLabel, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  settingLabel: {
    fontSize: 12,
    color: DarkColor60,
    marginBottom: 10,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default SettingLabel;
