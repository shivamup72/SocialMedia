import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts, DarkColor } from '../../utils/style/fonts';

const SectionTitle = ({ children, style }) => {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
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
