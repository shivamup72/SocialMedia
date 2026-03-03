import {StatusBar, StyleSheet} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {mainWhiteColor} from './style/fonts';

const ScreenView = ({
  children,
  style,
  statusBarBackgroundColor = 'white',
  statusBarStyle = 'dark-content',
  hideStatusBar = false,
}) => {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, style]}>
      {!hideStatusBar && (
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={statusBarStyle}
          translucent={false}
          hidden={false}
          animated={true}
        />
      )}
      {children}
    </SafeAreaView>
  );
};

export default ScreenView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
});
