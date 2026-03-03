
import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const InAppWebView = ({ route }) => {
    const url = route?.params?.url || 'https://riggle-x.com/';
    const webViewRef = useRef(null);
    const navigation = useNavigation();
    const canGoBackRef = useRef(false);

    // Listen for hardware back button
    useEffect(() => {
        const onBackPress = () => {
            if (canGoBackRef.current && webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            } else {
                navigation.goBack();
                return true;
            }
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
    }, [navigation]);

    const handleNavigationStateChange = useCallback((navState) => {
        canGoBackRef.current = navState.canGoBack;
    }, []);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                style={{ flex: 1 }}
                onNavigationStateChange={handleNavigationStateChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default InAppWebView;
