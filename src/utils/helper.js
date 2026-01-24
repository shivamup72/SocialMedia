import {Dimensions, PixelRatio} from 'react-native';

let {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Listen to orientation changes and update dimensions
Dimensions.addEventListener('change', ({window}) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

// Standard dimensions (base for scaling)
const STANDARD_SCREEN_DIMENSIONS = {width: 390, height: 823}; // Your chosen base

// Responsive width
export const RfW = (value = 0) =>
  (SCREEN_WIDTH * value) / STANDARD_SCREEN_DIMENSIONS.width;

// Responsive height
export const RfH = (value = 0) =>
  (SCREEN_HEIGHT * value) / STANDARD_SCREEN_DIMENSIONS.height;

// Responsive font size with min/max limits
export const normalize = (size = 14, factor = 0.5) => {
  const scale = SCREEN_WIDTH / STANDARD_SCREEN_DIMENSIONS.width;
  const newSize = size * scale;
  const adjustedSize = size + (newSize - size) * factor;
  const minFontSize = 8;
  const maxFontSize = 28;
  return Math.round(
    PixelRatio.roundToNearestPixel(
      Math.max(minFontSize, Math.min(maxFontSize, adjustedSize)),
    ),
  );
};

export {SCREEN_HEIGHT, SCREEN_WIDTH};
