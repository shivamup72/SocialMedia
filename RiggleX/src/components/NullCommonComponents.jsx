import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { fonts, DarkColor, DarkColor20, DarkColor50, mainOrangeColor, mainOrange20, mainOrange50, mainWhiteColor, mainOrange92, DarkColor80, mainGrayColor } from '../utils/style/fonts';
import { RfW } from '../utils/helper';


const NullCommonComponent = ({ title, subtitle, buttonText, onButtonPress, imageSource, borderColor = '#00BCD4' }) => {
  return (
    <View style={[styles.emptyContainer, { borderColor }]}>
      <View style={styles.textContainer}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
        {buttonText && onButtonPress && (
          <TouchableOpacity style={styles.beginButton} onPress={onButtonPress}>
            <Text style={styles.beginButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.astronautImage}>
        <Image source={imageSource} resizeMode="contain" style={{ height: '100%', width: '100%' }} />
      </View>
    </View>
  );
};

export default NullCommonComponent;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: 90,
    height: 90,
    marginLeft: 16,
  },

  //   new css style
  emptyContainer: {
    // marginHorizontal: 15,
    // marginTop: 0,
    // // marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    borderColor: '#c5b3f1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    // paddingVertical: 10,
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  emptySubtitle: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor50,
    marginTop: 5,
    marginBottom: 10,
  },
  beginButton: {
    backgroundColor: 'white',
    borderColor: mainOrangeColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  beginButtonText: {
    color: mainOrangeColor,
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
  },
  astronautImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
});
