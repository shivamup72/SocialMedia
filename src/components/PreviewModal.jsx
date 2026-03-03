import React, { useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { DarkColor80, DarkColor90, fonts, mainOrangeColor, mainWhiteColor } from '../utils/style/fonts';
import { RfH, RfW } from '../utils/helper';
import SendSvgIcon from '../assets/svg/sendmsmArrowSvg';
import CustomText from '../utils/CustomText';

// import Video from 'react-native-video'; // Uncomment if you want video preview

const PreviewModal = ({ visible, file, type, onSend, onCancel }) => {
    const [caption, setCaption] = useState('');

    const handleSend = () => {
        onSend({ ...file, caption });
        setCaption('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fullScreen}>
                    {/* Main preview area */}
                    {type === 'image' && (
                        <View style={styles.whatsappImageContainer}>
                            <Image source={{ uri: file.uri }} resizeMode="contain" style={styles.whatsappImage} />
                            {/* Floating close button */}
                            <TouchableOpacity style={styles.floatingCloseButton} onPress={onCancel}>
                                <CustomText style={styles.closeText}>✕</CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                    {(type === 'document' || type === 'audio') && (
                        <View style={styles.docCardContainer}>
                            <View style={styles.docCard}>
                                <CustomText style={styles.docIcon}>{type === 'document' ? '📄' : '🎵'}</CustomText>
                                <View style={{ flex: 1 }}>
                                    <CustomText style={styles.fileNameDoc}>{file.name}</CustomText>
                                    <CustomText style={styles.fileTypeDoc}>{type === 'document' ? 'Document' : 'Audio'}</CustomText>
                                </View>
                                <TouchableOpacity style={styles.floatingCloseButtonDoc} onPress={onCancel}>
                                    <CustomText style={styles.closeTextDoc}>✕</CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {/* Bottom caption bar (WhatsApp style) */}
                    <View style={styles.whatsappBottomBar}>
                        <TextInput
                            style={styles.whatsappCaptionInput}
                            placeholder="Add a caption..."
                            placeholderTextColor={mainWhiteColor}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            allowFontScaling={false}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <SendSvgIcon width={28} height={28} color={mainWhiteColor} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    fullScreen: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    whatsappImageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.92)',
    },
    whatsappImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    floatingCloseButton: {
        position: 'absolute',
        top: 48,
        right: 24,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    closeText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    docCardContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.92)',
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        width: '85%',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    docIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    fileNameDoc: {
        fontSize: 16,
        color: '#222',
        fontFamily: fonts.PoppinsMedium,
        marginBottom: 2,
    },
    fileTypeDoc: {
        fontSize: 13,
        color: '#888',
        fontFamily: fonts.PoppinsRegular,
    },
    floatingCloseButtonDoc: {
        marginLeft: 10,
        backgroundColor: '#eee',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeTextDoc: {
        color: '#222',
        fontSize: 18,
        fontWeight: 'bold',
    },
    whatsappBottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        left: RfW(12),
        right: RfW(12),
    },
    whatsappCaptionInput: {
        flex: 1,
        fontSize: 14,
        color: mainWhiteColor,
        fontFamily: fonts.PoppinsRegular,
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: DarkColor90,
        borderRadius: 24,
        marginRight: 10,
        minHeight: RfH(50),

    },
    sendButton: {
        backgroundColor: mainOrangeColor,
        height: RfH(46),
        width: RfH(46),
        borderRadius: 46,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default PreviewModal;
