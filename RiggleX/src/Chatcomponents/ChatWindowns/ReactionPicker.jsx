import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


const EMOJIS = ['😊', '👍', '❤️', '😀', '😉', '😅', '🥳', '🤓'];


const ReactionPicker = ({ onSelectReaction }) => {
  return (
    <View style={styles.pickerContainer}>
      {EMOJIS.map(emoji => (
        <TouchableOpacity
          key={emoji}
          onPress={() => onSelectReaction(emoji)}
          style={styles.emojiButton}>
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 8,
  },
  emojiButton: {
    // marginHorizontal: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    // backgroundColor:'red',
  },
  emoji: {
    fontSize: 18,
  },
  addButton: {
    marginLeft: 8,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlus: {
    color: '#606060',
    fontSize: 22,
    fontWeight: '300',
  },
});

export default ReactionPicker;
