import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { RfW } from '../../utils/helper';


const DEFAULT_EMOJIS = ['😊', '👍', '❤️', '😀', '😉', '😅', '🥳', '🤓'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');


const ReactionPicker = ({ onSelectReaction, message }) => {
  const [emojis, setEmojis] = useState(DEFAULT_EMOJIS);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);

  const handlePlusPress = () => {
    setShowEmojiSelector(true);
  };

  const handleEmojiSelected = (emoji) => {
    if (!emojis.includes(emoji)) {
      setEmojis(prev => {
        const updated = [...prev, emoji];
        return updated;
      });
    }
    setShowEmojiSelector(false);
    onSelectReaction(emoji, message);
  };

  return (
    <View>
      <View style={styles.pickerContainer}>
        {emojis.map(emoji => (
          <TouchableOpacity
            key={emoji}
            onPress={() => onSelectReaction(emoji, message)}
            style={styles.emojiButton}>
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          key="plus"
          onPress={handlePlusPress}
          style={[styles.emojiButton, styles.addButton]}
          accessibilityLabel="Add Reaction"
        >
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        visible={showEmojiSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEmojiSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEmojiSelector(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          <EmojiSelector
            onEmojiSelected={handleEmojiSelected}
            showSearchBar={true}
            showSectionTitles={false}
            category={Categories.ALL}
            columns={10}
            emojiSize={18}
            searchBarStyle={styles.searchBar}
            searchBarTextStyle={styles.searchText}
            containerStyle={styles.emojiSelector}
          />
        </View>

      </Modal>
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    // backgroundColor:'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 12,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d1d1',
    alignSelf: 'center',
    marginBottom: 8,
  },

  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
  },

  searchText: {
    fontSize: 12,
    color: '#000',
  },

  emojiSelector: {
    flex: 1,
    paddingHorizontal: 8,
  },

  emoji: {
    fontSize: 18,
  },
  addButton: {
    marginLeft: RfW(2),
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
