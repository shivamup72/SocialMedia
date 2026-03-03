import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import {
  fonts,
  DarkColor80,
  DarkColor,
  mainOrangeColor,
  mainOrange80,
} from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const EmptyListComponents = ({ text, type, marginData = 25 }) => {
  const astroImage = require('../../assets/LoginAssets/png/InvalidotpModalImage.png');
  const astroImage2 = require('../../assets/Png/AstronotSitting.png');
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: marginData,
      }}>
      <Image
        source={type === 1 ? astroImage : astroImage2}
        style={{ with: 150, height: 150, resizeMode: 'contain' }}
      />
      <CustomText
        style={{
          color: mainOrangeColor,
          fontSize: 16,
          fontFamily: fonts.PoppinsSemiBold,
          marginTop: 25,
        }}>
        {text}
      </CustomText>
    </View>
  );
};

export default EmptyListComponents;

const styles = StyleSheet.create({});
