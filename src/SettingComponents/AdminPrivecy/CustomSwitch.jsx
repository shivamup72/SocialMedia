import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

const SWITCH_WIDTH = 34;
const SWITCH_HEIGHT = 18;
const KNOB_SIZE = 14;
const PADDING = 2;

const CustomSwitch = ({ value, onToggle }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value
                ? SWITCH_WIDTH - KNOB_SIZE - PADDING * 2
                : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [value]);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggle}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.knob,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        </TouchableOpacity>
    );
};

export default CustomSwitch;

const styles = StyleSheet.create({
    container: {
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        borderRadius: SWITCH_HEIGHT / 2,
        borderWidth: 0.2,
        borderColor: '#000',
        backgroundColor: '#FFFFFF',
        padding: PADDING,
        justifyContent: 'center',
        paddingHorizontal: 2
    },
    knob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: '#5B6366', // dark grey (image match)
        paddingHorizontal: 2
    },
});