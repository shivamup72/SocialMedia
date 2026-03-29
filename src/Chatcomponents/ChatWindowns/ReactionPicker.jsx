import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { RfW } from '../../utils/helper';
import CustomText from '../../utils/CustomText';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper: get Lottie URL for emoji unicode
function getLottieForEmoji(emoji) {
  if (!emoji) return null;
  const codePoints = [];
  for (const symbol of [...emoji]) {
    const code = symbol.codePointAt(0).toString(16);
    codePoints.push(code);
  }
  const unicodeStr = codePoints.join('-');
  return { uri: `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json` };
}

const DEFAULT_EMOJIS = [
  '\ud83d\ude02', // 😂
  // '\u2764\ufe0f', // ❤️
  '\ud83d\ude2e', // 😮
  '\ud83d\ude22', // 😢
  '\ud83d\ude4f', // 🙏
  '\ud83d\udc4d', // 👍
  '\ud83d\udc4e', // 👎
  '\ud83d\udd25', // 🔥
];

const ReactionPicker = ({ onSelectReaction, message, currentUserId }) => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const reactions = message?.reactions || [];
  // Helper: check if current user has reacted with this emoji
  const isEmojiSelectedByUser = (emoji) =>
    reactions.some(r => (r.reaction === emoji) && (String(r.user_id || r.id) === String(currentUserId)));

  const handlePlusPress = () => {
    setShowEmojiSelector(true);
  };

  const handleEmojiSelected = (emoji) => {
    setShowEmojiSelector(false);
    onSelectReaction(emoji, message);
  };

  // Always show all default emojis, regardless of selection
  const emojiList = DEFAULT_EMOJIS;

  return (
    <>
      <View style={styles.whatsappPopup}>
        {/* Render emoji reactions as Lottie animations */}
        {emojiList.map(emoji => {
          const isSelected = isEmojiSelectedByUser(emoji);
          return (
            <TouchableOpacity
              key={emoji}
              onPress={() => onSelectReaction(emoji, message)}
              style={[
                styles.emojiButton,
                isSelected && styles.selectedEmojiButton
              ]}
            >
              <LottieView
                source={getLottieForEmoji(emoji)}
                autoPlay
                loop
                style={{ width: 32, height: 32 }}
              />
            </TouchableOpacity>
          );
        })}
        {/* Add emoji button */}
        <TouchableOpacity
          key="plus"
          onPress={handlePlusPress}
          style={[styles.emojiButton, styles.addButton]}
          accessibilityLabel="Add Reaction"
        >
          <View style={styles.addCircle}>
            <CustomText style={styles.addPlus}>+</CustomText>
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
    </>
  );

};

const styles = StyleSheet.create({
  whatsappPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 44,
  },
  emojiButton: {
    // marginHorizontal: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    // backgroundColor:'red',
  },
  selectedEmojiButton: {
    backgroundColor: '#e0f7fa', // Highlight color for selected emoji
    borderRadius: 8,
    marginHorizontal: 2,
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
