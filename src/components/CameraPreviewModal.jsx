import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import CustomText from '../utils/CustomText';

const CameraPreviewModal = ({ visible, onClose, onConfirm }) => {
    const [photo, setPhoto] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const camera = useRef(null);
    const devices = useCameraDevices(hasPermission ? 'wide-angle-camera' : undefined);
    const device = devices.back;

    const requestPermission = async () => {
        console.log("Grant permission called");
        const status = await Camera.requestCameraPermission();
        if (status === 'authorized') {
            setHasPermission(true);
        } else {
            setHasPermission(false);
        }
    };

    useEffect(() => {
        let timeout;
        (async () => {
            let status = await Camera.getCameraPermissionStatus();
            if (status !== 'authorized') {
                status = await Camera.requestCameraPermission();
            }
            setHasPermission(status === 'authorized');
            // Fallback: if permission dialog is ignored, show error after 5 seconds
            if (status !== 'authorized') {
                timeout = setTimeout(() => {
                    setHasPermission(false);
                }, 5000);
            }
        })();
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [visible]);

    const takePhoto = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto({});
            setPhoto(photo);
        }
    };

    const handleConfirm = () => {
        onConfirm(photo);
        setPhoto(null);
        onClose();
    };

    const handleRetake = () => {
        setPhoto(null);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                {!hasPermission && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <CustomText style={{ color: '#fff', textAlign: 'center', marginBottom: 16 }}>
                            Requesting camera permission...
                        </CustomText>
                    </View>
                )}
                {hasPermission && !photo && (!device ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <CustomText style={{ color: '#fff' }}>Loading camera...</CustomText>
                    </View>
                ) : (
                    <Camera
                        key={hasPermission ? 'camera-on' : 'camera-off'}
                        ref={camera}
                        style={styles.camera}
                        device={device}
                        isActive={true}
                        photo={true}
                    />
                ))}
                {hasPermission && photo && (
                    <Image source={{ uri: photo.path }} style={styles.preview} />
                )}
                <View style={styles.controls}>
                    {hasPermission && !photo ? (
                        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                            <CustomText style={styles.buttonText}>Capture</CustomText>
                        </TouchableOpacity>
                    ) : hasPermission && photo ? (
                        <>
                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                                <CustomText style={styles.buttonText}>Send</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                                <CustomText style={styles.buttonText}>Retake</CustomText>
                            </TouchableOpacity>
                        </>
                    ) : null}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <CustomText style={styles.buttonText}>Close</CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1, width: '100%', height: '100%' },
    preview: { flex: 1, resizeMode: 'contain' },
    controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    captureButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8 },
    confirmButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 },
    retakeButton: { backgroundColor: '#FFC107', padding: 12, borderRadius: 8 },
    closeButton: { backgroundColor: '#F44336', padding: 12, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default CameraPreviewModal;
