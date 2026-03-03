import {StyleSheet, Text} from 'react-native';
import React from 'react';

const CustomText = props => {
  return (
    <Text style={props.style} allowFontScaling={false} {...props}>
      {props.children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({});
