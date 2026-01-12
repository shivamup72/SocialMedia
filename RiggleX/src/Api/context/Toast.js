import React, {useState, useImperativeHandle, forwardRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import CustomText from '../../utils/CustomText';
import {normalize, RfH, RfW} from '../../utils/helper';

const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useImperativeHandle(ref, () => ({
    show(options) {
      setMessage(options.message);
      setType(options.type);
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          hide();
        }, 2000);
      });
    },
  }));

  const hide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
  const title = type === 'success' ? 'Success' : 'Error';

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, {opacity: fadeAnim, backgroundColor}]}>
      <CustomText style={styles.title}>{title}</CustomText>
      <CustomText style={styles.message}>{message}</CustomText>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: RfH(40),
    left: RfW(20),
    right: RfW(20),
    padding: RfW(16),
    borderRadius: 8,
    zIndex: 9999,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  message: {
    color: 'white',
    fontSize: normalize(14),
  },
});

export default Toast;
