import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import {
  mainOrangeColor,
  DarkColor60,
  DarkColor80,
  DarkColor,
  fonts,
} from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const SettingsSwitch = ({ label, setIsEnabled, isEnabled }) => {
  // The 'onValueChange' prop of the Switch component directly provides
  // the new boolean value. We just need to pass this value to the
  // setIsEnabled function from the parent.
  return (
    <View style={styles.switchContainer}>
      <CustomText style={styles.switchLabel}>{label}</CustomText>
      <Switch
        trackColor={{ false: '#E0E0E0', true: mainOrangeColor }}
        thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={setIsEnabled}
        value={isEnabled}
      />
    </View>
  );
};

export default SettingsSwitch;

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
  },
});
