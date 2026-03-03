import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { RfH, RfW } from '../utils/helper';
import { DarkColor, fonts, mainOrangeColor } from '../utils/style/fonts';
import CustomText from '../utils/CustomText';

const icons = {
    camera: require('../assets/Png/Camera.png'),
    media: require('../assets/Png/mediapic.png'),
    audio: require('../assets/Png/audio.png'),
    documents: require('../assets/Png/doc.png'),
    location: require('../assets/Png/pin.png'),
};

const options = [
    { key: 'camera', label: 'Camera', icon: icons.camera },
    { key: 'media', label: 'Media', icon: icons.media },
    { key: 'audio', label: 'Audio', icon: icons.audio },
    { key: 'documents', label: 'Documents', icon: icons.documents },
    { key: 'location', label: 'Location', icon: icons.location },
    { key: '', label: '', },
];

const ShareContentBottomSheet = ({ visible, onClose, onSelect }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <CustomText style={styles.title}>{''}</CustomText>
                        <CustomText style={styles.title}>Share Content</CustomText>
                        <TouchableOpacity onPress={onClose}>
                            <CustomText style={styles.close}>×</CustomText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.optionsRow}>
                        {options.slice(0, 3).map(opt => (
                            <TouchableOpacity key={opt.key} style={styles.option} onPress={() => onSelect(opt.key)}>
                                <View style={styles.iconCircle}>
                                    <Image source={opt.icon} style={styles.icon} />
                                </View>
                                <CustomText style={styles.optionLabel}>{opt.label}</CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.optionsRow}>
                        {options.slice(3).map(opt => (
                            <TouchableOpacity key={opt.key} style={styles.option} onPress={() => onSelect(opt.key)}>
                                {opt.icon && <View style={styles.iconCircle}>
                                    <Image source={opt.icon} style={styles.icon} />
                                </View>}
                                <CustomText style={styles.optionLabel}>{opt.label}</CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 24,
        paddingTop: 16,
        paddingHorizontal: 16,
        borderTopWidth: 4,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: mainOrangeColor
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: RfH(16),
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
    },
    close: {
        fontSize: RfH(32),
        fontFamily: fonts.PoppinsRegular,
        color: DarkColor,
        marginRight: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    option: {
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        backgroundColor: '#F6F6F6',
        borderRadius: 32,
        width: RfW(42),
        height: RfH(42),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        width: RfW(22),
        height: RfH(22),
        resizeMode: 'contain',
        tintColor: '#ff8c1a',
    },
    optionLabel: {
        fontSize: RfH(12),
        color: DarkColor,
        fontFamily: fonts.PoppinsSemiBold
    },
});

export default ShareContentBottomSheet;
