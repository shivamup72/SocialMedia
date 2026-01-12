import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const ProfileIcon2 = require('../../assets/Png/ProfileIcon2.png');

const AttendeeList = ({attendees, containerStyle, imageStyle, textStyle}) => {
  if (!attendees || attendees.length === 0) {
    return null;
  }

  const visibleAttendees = attendees.slice(0, 3);
  const remainingCount = attendees.length - visibleAttendees.length;

  return (
    <View style={[styles.attendeesContainer, containerStyle]}>
      {visibleAttendees.map((attendee, index) => (
        <Image
          key={index}
          source={
            attendee?.profile_picture
              ? {uri: attendee.profile_picture}
              : ProfileIcon2
          }
          style={[
            styles.attendeeImage,
            {marginLeft: index > 0 ? -12 : 0},
            imageStyle,
          ]}
        />
      ))}
      {remainingCount > 0 && (
        <View style={[styles.remainingCountContainer, {marginLeft: -12}]}>
          <Text style={[styles.remainingCountText, textStyle]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeImage: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 0.5,
    borderColor: 'orange', // Example color
  },
  remainingCountContainer: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'orange', // Example color
  },
  remainingCountText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AttendeeList;
