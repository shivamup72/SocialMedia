import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { mainOrangeColor, mainWhiteColor, fonts } from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';

const Avatar = ({
  avatarUri,
  name,
  email,
  size = 50,
  borderRadius = 25,
  fontSize = 20,
}) => {
  const getInitials = () => {
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }

    if (email && typeof email === 'string' && email.trim().length > 0) {
      return email[0].toUpperCase();
    }

    return '?';
  };

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: avatarUri ? mainWhiteColor : mainOrangeColor,
        },
      ]}>
      {avatarUri ? (
        <Image
          source={{
            uri: avatarUri,
          }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: mainOrangeColor,
            },
          ]}>
          <CustomText style={[styles.initialsText, { fontSize }]}>{getInitials()}</CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: mainOrangeColor,
    borderColor: mainOrangeColor,
    borderWidth: 0.5,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 30,
    // backgroundColor: mainOrangeColor,
    borderWidth: 0.5,
    borderColor: mainOrangeColor,
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  initialsText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
    // marginTop: 5, // Remove this if it's causing vertical offset, center should be fine
    textAlignVertical: 'center', // Ensures text is vertically centered
    textAlign: 'center', // Ensures text is horizontally centered
  },
});

export default Avatar;
