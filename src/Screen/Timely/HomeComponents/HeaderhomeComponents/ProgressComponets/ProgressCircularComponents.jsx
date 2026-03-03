import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { DarkColor80, fonts } from '../../../../../utils/style/fonts';
import CustomText from '../../../../../utils/CustomText';

const CircularProgress = ({ percentage = 60, radius = 20, strokeWidth = 5, completionPercentage }) => {
  // console.log('completionPercentage ====>', typeof completionPercentage);
  const circleCircumference = 2 * Math.PI * radius;
  const safePercentage = completionPercentage !== undefined ? Number(completionPercentage) : 0;
  const strokeDashoffset =
    circleCircumference - (circleCircumference * safePercentage) / 100;

  const padding = strokeWidth / 2;
  const svgSize = radius * 2 + strokeWidth;

  return (
    <View
      style={[
        styles.container,
        {
          width: svgSize,
          height: svgSize,
        },
      ]}>
      <Svg width={svgSize} height={svgSize}>
        {/* Background Circle */}
        <Circle
          stroke="#e6e6e6"
          fill="none"
          cx={radius + padding}
          cy={radius + padding}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke="#ff914d"
          fill="none"
          cx={radius + padding}
          cy={radius + padding}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circleCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${radius + padding}, ${radius + padding}`}
        />
      </Svg>

      <CustomText style={styles.percentageText}>{`${completionPercentage}%`}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  percentageText: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor80,
  },
});

export default CircularProgress;
