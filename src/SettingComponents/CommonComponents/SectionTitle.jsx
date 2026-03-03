import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts, DarkColor } from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const SectionTitle = ({ children, style }) => {
  return <CustomText style={[styles.sectionTitle, style]}>{children}</CustomText>;
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginTop: 15,
    marginBottom: 3,
  },
});

export default SectionTitle;
