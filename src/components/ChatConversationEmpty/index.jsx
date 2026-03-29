import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import {
    fonts,
    DarkColor80,
    DarkColor,
} from '../../utils/style/fonts';
import CustomText from '../../utils/CustomText';
import { RfH, RfW } from '../../utils/helper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SHOWN_KEY = 'ONBOARDING_SHOWN';

const ChatConversationEmpty = ({ text, type, marginData = 50, subText, btnText, button }) => {
    const astroImage = require('../../assets/Png/AstronotSitting.png');
    const astroImage2 = require('../../assets/Png/AstronotSitting.png');
    const navigation = useNavigation();

    // ✅ Open WebView
    const handleOnboardingInvite = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
        } catch (e) {
            console.log('Storage error:', e);
        }

        navigation.navigate('InAppWebView', {
            url: 'https://riggle-x.com/',
        });
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: marginData,
            }}
        >
            <Image
                source={type === 1 ? astroImage : astroImage2}
                style={{ width: RfW(140), height: RfH(140), resizeMode: 'contain', top: RfH(10) }}
            />

            <CustomText
                style={{
                    color: DarkColor,
                    fontSize: RfH(14),
                    fontFamily: fonts.PoppinsSemiBold,
                    marginTop: RfH(25),
                }}
            >
                {text}
            </CustomText>

            <CustomText
                style={{
                    color: DarkColor80,
                    fontSize: 12,
                    fontFamily: fonts.PoppinsRegular,
                    textAlign: 'center',
                    marginTop: 4,
                }}
            >
                {subText}
            </CustomText>

            {/* ✅ Button */}
            <TouchableOpacity style={[button]} onPress={handleOnboardingInvite}>
                <CustomText style={styles.buttonText}>
                    {btnText}
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default ChatConversationEmpty;

const styles = StyleSheet.create({

    buttonText: {
        color: '#fff',
        fontSize: RfH(14),
        lineHeight: RfH(20),
        fontFamily: fonts.PoppinsSemiBold,
    },
});