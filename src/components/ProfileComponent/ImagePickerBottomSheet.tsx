import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { DarkColor, fonts, mainOrangeColor, mainWhiteColor } from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';


type ImagePickerBottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    onPickGallery: () => void;
    onPickCamera: () => void;
};

const ImagePickerBottomSheet: React.FC<ImagePickerBottomSheetProps> = ({ visible, onClose, onPickGallery, onPickCamera }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
                    <View style={styles.handle} />
                    <CustomText style={styles.title}>Change Profile Photo</CustomText>
                    <Pressable style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} onPress={onPickGallery} android_ripple={{ color: '#f0f0f0' }}>
                        <CustomText style={styles.optionText}>Pick from Gallery</CustomText>
                    </Pressable>
                    <Pressable style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} onPress={onPickCamera} android_ripple={{ color: '#f0f0f0' }}>
                        <CustomText style={styles.optionText}>Capture from Camera</CustomText>
                    </Pressable>
                    <Pressable style={styles.cancel} onPress={onClose} android_ripple={{ color: '#f0f0f0' }}>
                        <CustomText style={styles.cancelText}>Cancel</CustomText>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
        color: '#222',
        textAlign: 'center',
        fontFamily: fonts.PoppinsMedium
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    optionPressed: {
        backgroundColor: '#f7f7f7',
    },
    icon: {
        marginRight: 12,
    },
    optionText: {
        fontSize: 14,
        color: DarkColor,
        fontFamily: fonts.PoppinsRegular,
    },
    cancel: {
        marginTop: 18,
        padding: 14,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: mainOrangeColor,
    },
    cancelText: {
        color: mainWhiteColor,
        fontSize: 14,
        fontFamily: fonts.PoppinsMedium,
    },
});

export default ImagePickerBottomSheet;
