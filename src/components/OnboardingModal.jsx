import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { RfH, RfW } from '../utils/helper';
import { DarkColor, DarkColor80, fonts, mainOrangeColor } from '../utils/style/fonts';
import CustomText from '../utils/CustomText';

const OnboardingModal = ({ visible, onSkip, onMainAction, buttonText = 'Start Inviting your Crew', children }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: RfH(12), justifyContent: 'center' }}>
                        <Image source={require('../assets/LoginAssets/png/leftCongrats.png')} style={{ height: RfH(35), width: RfW(35), bottom: RfH(4) }} resizeMode='contain' />
                        <CustomText style={styles.title}>All set!</CustomText>
                        <Image source={require('../assets/LoginAssets/png/RightCongrats.png')} style={{ height: RfH(35), width: RfW(35), bottom: RfH(4) }} resizeMode='contain' />
                    </View>
                    <View style={styles.image}>
                        <Image
                            source={require('../assets/LoginAssets/png/astroimg.png')}
                            resizeMode="contain"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={onMainAction || onSkip}>
                        <CustomText style={styles.buttonText}>{buttonText}</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                        <CustomText style={styles.skipText}>Skip</CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: RfW(20),
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: RfH(24),
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        borderTopWidth: 2,
        borderTopColor: mainOrangeColor,
        borderBottomWidth: 2,
        borderBottomColor: mainOrangeColor,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
        marginHorizontal: RfW(12),
    },
    image: {
        width: RfW(200),
        height: RfH(138),
    },
    button: {
        backgroundColor: '#FC8C4D',
        borderRadius: 8,
        paddingVertical: RfH(10),
        paddingHorizontal: RfW(24),
        marginBottom: RfH(8),
        width: '90%',
        alignItems: 'center',
        marginTop: RfH(4)
    },
    buttonText: {
        color: '#fff',
        fontSize: RfH(14),
        lineHeight: RfH(20),
        fontFamily: fonts.PoppinsSemiBold,
    },
    skipBtn: {
        marginTop: RfH(4),
    },
    skipText: {
        color: DarkColor80,
        fontSize: RfH(12),
        fontFamily: fonts.PoppinsRegular,
        // textDecorationLine: 'underline',
    },
});

export default OnboardingModal;
