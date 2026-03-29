
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import LottieView from 'lottie-react-native';
import CustomText from '../../../utils/CustomText';
import { lottieExistsForEmoji } from '../../../utils/lottieExistsForEmoji';

function getLottieForEmoji(emoji) {
    if (!emoji) return null;
    const codePoints = [];
    for (const symbol of [...emoji]) {
        const code = symbol.codePointAt(0).toString(16);
        codePoints.push(code);
    }
    const unicodeStr = codePoints.join('-');
    const lottieUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json`;
    return { uri: lottieUrl };
}

function getNotoPngForEmoji(emoji) {
    if (!emoji) return null;
    const codePoints = [];
    for (const symbol of [...emoji]) {
        const code = symbol.codePointAt(0).toString(16);
        codePoints.push(code);
    }
    const unicodeStr = codePoints.join('-');
    // PNG 128px version
    const pngUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/512.png`;
    return { uri: pngUrl };
}

export default function EmojiWithLottie({ emoji, style, lottieStyle }) {
    const [hasLottie, setHasLottie] = useState(undefined);
    const [pngError, setPngError] = useState(false);

    useEffect(() => {
        let mounted = true;
        lottieExistsForEmoji(emoji).then(exists => {
            if (mounted) setHasLottie(exists);
        });
        return () => { mounted = false; };
    }, [emoji]);

    if (hasLottie === undefined) {
        // Optionally show a spinner or nothing while checking
        return null;
    }
    if (hasLottie) {
        return (
            <LottieView
                source={getLottieForEmoji(emoji)}
                autoPlay
                loop
                style={lottieStyle}
            />
        );
    }
    // PNG fallback for Noto Emoji style, fallback to plain text if PNG fails
    const size = (lottieStyle && lottieStyle.height) ? lottieStyle.height : 18;
    if (!pngError) {
        return (
            <Image
                source={getNotoPngForEmoji(emoji)}
                style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
                defaultSource={undefined}
                accessibilityLabel={emoji}
                onError={() => setPngError(true)}
            />
        );
    }
    // Fallback to plain Unicode emoji as text
    return (
        <CustomText style={[{ fontSize: size, lineHeight: size * 1.1 }, style]}>{emoji}</CustomText>
    );
}
