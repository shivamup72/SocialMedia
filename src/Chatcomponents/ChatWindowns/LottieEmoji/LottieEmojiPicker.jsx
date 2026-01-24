import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, FlatList, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

// Import your Lottie JSON assets here
import emojiSmile from '../../../assets/LottieEmoji/emoji1.json';
import emojiThumbsUp from '../../../assets/LottieEmoji/emoj2.json';
import emojiHeart from '../../../assets/LottieEmoji/emoji3.json';
// Add more imports as needed

export const LOTTIE_EMOJIS = [
    { key: 'smile', source: emojiSmile },
    { key: 'thumbsup', source: emojiThumbsUp },
    { key: 'heart', source: emojiHeart },
    // Add more as needed
];

const { width } = Dimensions.get('window');

const LottieEmojiPicker = ({ visible, onSelect, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
                <View style={styles.bottomSheetContainer}>
                    <FlatList
                        data={LOTTIE_EMOJIS}
                        numColumns={5}
                        keyExtractor={item => item.key}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.emojiButton}
                                onPress={() => onSelect(item)}
                            >
                                <LottieView
                                    source={item.source}
                                    autoPlay
                                    loop
                                    style={styles.lottieEmoji}
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    bottomSheetContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 12,
        width: '100%',
        minHeight: 260,
        maxHeight: 420,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 12,
    },
    emojiButton: {
        margin: 8,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
    },
    lottieEmoji: {
        width: 44,
        height: 44,
    },
});

export default LottieEmojiPicker;
