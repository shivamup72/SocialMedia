import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import {
    Camera,
    useCameraDevices,
} from 'react-native-vision-camera';
import CustomText from '../utils/CustomText';

const CameraPreviewModal = ({ visible, onClose, onConfirm }) => {
    const camera = useRef(null);

    const [photo, setPhoto] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const devices = useCameraDevices();
    const device = devices?.back;

    // ==========================
    // Permission Handling
    // ==========================
    useEffect(() => {
        if (visible) {
            checkPermission();
        }
    }, [visible]);

    const checkPermission = async () => {
        setIsLoading(true);

        let status = await Camera.getCameraPermissionStatus();
        console.log('Camera permission status:', status);

        if (status === 'not-determined') {
            status = await Camera.requestCameraPermission();
        }

        if (status === 'denied' || status === 'restricted') {
            Alert.alert(
                'Permission Required',
                'Please enable camera permission from settings.',
                [
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                    },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }

        setHasPermission(status === 'authorized');
        setIsLoading(false);
    };

    // ==========================
    // Take Photo
    // ==========================
    const takePhoto = async () => {
        try {
            if (camera.current) {
                const result = await camera.current.takePhoto({
                    flash: 'off',
                });
                setPhoto(result);
            }
        } catch (error) {
            console.log('Take Photo Error:', error);
        }
    };

    const handleConfirm = () => {
        if (photo) {
            onConfirm(photo);
        }
        setPhoto(null);
        onClose();
    };

    const handleRetake = () => {
        setPhoto(null);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Loading */}
                {isLoading && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#fff" />
                        <CustomText style={styles.loadingText}>
                            Checking Permission...
                        </CustomText>
                    </View>
                )}

                {/* Camera */}
                {!isLoading && hasPermission && device && !photo && (
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={visible}
                        photo={true}
                    />
                )}

                {/* Device Not Found */}
                {!isLoading && hasPermission && !device && (
                    <View style={styles.center}>
                        <CustomText style={styles.loadingText}>
                            No Camera Device Found
                        </CustomText>
                    </View>
                )}

                {/* Preview */}
                {photo && (
                    <Image
                        source={{ uri: 'file://' + photo.path }}
                        style={styles.preview}
                    />
                )}

                {/* Controls */}
                <View style={styles.controls}>
                    {!photo && hasPermission && device && (
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePhoto}
                        >
                            <CustomText style={styles.buttonText}>
                                Capture
                            </CustomText>
                        </TouchableOpacity>
                    )}

                    {photo && (
                        <>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                            >
                                <CustomText style={styles.buttonText}>
                                    Send
                                </CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.retakeButton}
                                onPress={handleRetake}
                            >
                                <CustomText style={styles.buttonText}>
                                    Retake
                                </CustomText>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <CustomText style={styles.buttonText}>
                            Close
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CameraPreviewModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    captureButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
    },
    retakeButton: {
        backgroundColor: '#FFC107',
        padding: 12,
        borderRadius: 8,
    },
    closeButton: {
        backgroundColor: '#F44336',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});