import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {fonts, mainOrangeColor} from '../utils/style/fonts';

const ToastContent = ({profilePic, senderName, message, groupName}) => {
  // Compute initials if no image
  const getInitials = name => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
      }}>
      {profilePic ? (
        <View style={{marginRight: 10}}>
          <Image
            source={{uri: profilePic}}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              overflow: 'hidden',
              backgroundColor: '#eee',
            }}
          />
        </View>
      ) : (
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{getInitials(senderName)}</Text>
        </View>
      )}
      <View>
        {groupName ? (
          <Text style={styles.snackbarText1}>{groupName}</Text>
        ) : null}
        <Text style={styles.snackbarText}>{senderName}</Text>
        <Text style={styles.snackbarContent}>
          {message?.length > 26 ? `${message.slice(0, 26)}...` : message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff2e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: mainOrangeColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  snackbarContent: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 0.3,
    fontFamily: fonts.PoppinsRegular,
  },
  snackbarText1: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.3,
    fontFamily: fonts.PoppinsRegular,
  },
});

export default ToastContent;
