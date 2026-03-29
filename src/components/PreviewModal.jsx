import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import {
    DarkColor90,
    fonts,
    mainOrangeColor,
    mainWhiteColor
} from '../utils/style/fonts';
import { RfH, RfW } from '../utils/helper';
import SendSvgIcon from '../assets/svg/sendmsmArrowSvg';
import CustomText from '../utils/CustomText';

import { confirmUpload, requestUploadURL, uploadFileToS3 } from '../Api/config/chatMediaService';
import { useWebSocket } from '../Api/context/WebSocketServices';

import RNFS from 'react-native-fs';
import { insertMessage, logAllMessages } from '../utils/chatSQLite';
import { saveMediaToLocal } from '../utils/mediaLocalStore';

const PreviewModal = ({
    visible,
    file,
    type,
    onSend,
    onCancel,
    conversation_id,
    is_group,
    recipient_id,
    onMediaSent // <-- add this prop
}) => {
    const { sendMessage } = useWebSocket();

    const [caption, setCaption] = useState('');
    const [videoPaused, setVideoPaused] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) {
            setCaption('');
            setVideoPaused(true);
        }
    }, [visible]);
    if (!file) return null;
    // Ensure only one is true at a time
    let isVideo = false;
    let isImage = false;
    if (type === 'video' || file?.type?.startsWith('video')) {
        isVideo = true;
    } else if (type === 'image' || file?.type?.startsWith('image')) {
        isImage = true;
    }

    const handleSend = async () => {
        setLoading(true);
        // Save media locally first
        let localPath = null;
        let localMsgId = `local_${Date.now()}`;
        try {
            const fileName =
                file?.name ||
                file?.fileName ||
                file?.filename ||
                `media_${Date.now()}.jpg`;
            // Use the new utility to save media
            localPath = await saveMediaToLocal(file.uri, fileName);
            // Save to SQLite local DB
            const now = new Date().toISOString();
            const messageToInsert = {
                id: localMsgId,
                conversation_id: conversation_id,
                sender_id: 'me',
                content: caption || '',
                created_at: now,
                status: 'local',
                is_group: !!is_group,
                extra: {
                    local_media_path: localPath,
                    type,
                    fileName,
                }
            };
            console.log('[DEBUG] Inserting message to DB:', messageToInsert);
            insertMessage(messageToInsert);
            logAllMessages(); // Debug: log all messages after insert
            // Immediately notify parent to update UI from local DB
            if (typeof onMediaSent === 'function') {
                onMediaSent(messageToInsert);
            }
        } catch (err) {
            console.log('Error saving media locally:', err);
            setLoading(false);
            return;
        }

        // Process upload/send in background
        setTimeout(async () => {
            let uploadData = null;
            try {
                const fileName =
                    file?.name ||
                    file?.fileName ||
                    file?.filename ||
                    `media_${Date.now()}.jpg`;
                const contentType = file?.type || "image/jpeg";
                const fileSize = file?.size || file?.fileSize || 1;
                const convId =
                    conversation_id !== undefined && conversation_id !== null
                        ? Number(conversation_id)
                        : null;
                if (!fileName || !contentType || !fileSize || !convId) {
                    console.log("Missing upload fields");
                    return;
                }
                // STEP 1
                uploadData = await requestUploadURL({
                    fileName,
                    contentType,
                    fileSize,
                    conversationId: convId,
                    isGroup: !!is_group
                });
                console.log("Upload URL Response", uploadData);
                // STEP 2
                await uploadFileToS3(
                    uploadData.upload_url,
                    file.uri,
                    contentType
                );
                console.log("S3 Upload Success");
                // STEP 3
                const confirmRes = await confirmUpload({
                    attachmentId: Number(uploadData.attachment_id),
                    s3Key: uploadData.s3_key,
                    isGroup: !!is_group
                });
                console.log("Upload Confirmed Response", confirmRes);
                // STEP 4
                const payload = {
                    action: "send_message",
                    message: caption || "",
                    recipient_id: recipient_id,
                    media_attachments: [String(uploadData.attachment_id)],
                    is_group: !!is_group,
                    local_media_path: localPath // Pass local path for UI
                };
                console.log("WS Payload", payload);
                onSend(payload);
                sendMessage(payload)
                // Trigger reload in parent (ScreenWindows) if provided
                if (typeof onMediaSent === 'function') {
                    onMediaSent();
                }
                setCaption("");
            } catch (error) {
                console.log("Media Send Error", error?.response?.data || error);
            }
            setLoading(false);
        }, 0);
    };
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                {loading && (
                    <View style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                    }}>
                        <ActivityIndicator size="large" color={mainOrangeColor} />
                    </View>
                )}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.fullScreen}
                >

                    {/* MEDIA PREVIEW */}

                    {isVideo && (
                        <View style={styles.previewContainer}>
                            <Video
                                source={{ uri: file.uri }}
                                style={styles.media}
                                resizeMode="contain"
                                controls
                                paused={videoPaused}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onCancel}
                            >
                                <CustomText style={styles.closeText}>✕</CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                    {isImage && (
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: file.uri }}
                                resizeMode="contain"
                                style={styles.media}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onCancel}
                            >
                                <CustomText style={styles.closeText}>✕</CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                    {(type === 'document' || type === 'audio') && (
                        <View style={styles.docContainer}>
                            <View style={styles.docCard}>
                                <CustomText style={styles.docIcon}>
                                    {type === 'document' ? '📄' : '🎵'}
                                </CustomText>
                                <View style={{ flex: 1 }}>
                                    <CustomText style={styles.fileName}>
                                        {file?.name}
                                    </CustomText>
                                    <CustomText style={styles.fileType}>
                                        {type === 'document'
                                            ? 'Document'
                                            : 'Audio'}
                                    </CustomText>
                                </View>
                                <TouchableOpacity
                                    style={styles.closeDoc}
                                    onPress={onCancel}
                                >
                                    <CustomText style={styles.closeDocText}>✕</CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* CAPTION BAR */}

                    <View style={styles.bottomBar}>

                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption..."
                            placeholderTextColor={mainWhiteColor}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                        >
                            <SendSvgIcon
                                width={26}
                                height={26}
                                color={mainWhiteColor}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default PreviewModal;

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },

    fullScreen: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    media: {
        width: '100%',
        height: '100%',
    },

    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    docContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 18,
        width: '85%',
    },

    docIcon: {
        fontSize: 32,
        marginRight: 14,
    },

    fileName: {
        fontSize: 16,
        fontFamily: fonts.PoppinsMedium,
        color: '#222',
    },

    fileType: {
        fontSize: 13,
        color: '#888',
        fontFamily: fonts.PoppinsRegular,
    },

    closeDoc: {
        backgroundColor: '#eee',
        borderRadius: 16,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeDocText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        left: RfW(12),
        right: RfW(12),
    },

    captionInput: {
        flex: 1,
        fontSize: 14,
        color: mainWhiteColor,
        fontFamily: fonts.PoppinsRegular,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: DarkColor90,
        borderRadius: 24,
        marginRight: 10,
        minHeight: RfH(46),
    },

    sendButton: {
        backgroundColor: mainOrangeColor,
        height: RfH(46),
        width: RfH(46),
        borderRadius: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },

});