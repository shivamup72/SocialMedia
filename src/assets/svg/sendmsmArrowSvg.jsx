// import Svg, {Rect, Path, Circle} from 'react-native-svg';

// const SendSmsSvg = ({color = '#ffffff', width = '15', height = '14'}) => (
//   <svg
//     width={width}
//     height={height}
//     viewBox="0 0 15 14"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg">
//     <path
//       fill-rule="evenodd"
//       clip-rule="evenodd"
//       d="M2.1922 0.30286L13.8707 6.14062C14.1969 6.30361 14.4029 6.63692 14.4029 7.00154C14.4029 7.36616 14.1969 7.69947 13.8707 7.86246L2.1922 13.7002C1.85379 13.8695 1.44762 13.8248 1.15409 13.586C0.860558 13.3473 0.734107 12.9587 0.830901 12.5929L2.3119 7.00154L0.830901 1.41017C0.734107 1.04438 0.860558 0.655818 1.15409 0.417055C1.44762 0.178292 1.85379 0.133612 2.1922 0.30286Z"
//       fill={color}
//     />
//   </svg>
// );

// export default SendSmsSvg;

import React from 'react';
import Svg, {Path} from 'react-native-svg';

const SendSmsSvg = ({color = '#334155', width = 20, height = 20}) => (
  // 1. Use the <Svg> component (capital 'S')
  <Svg width={width} height={height} viewBox="0 0 15 14">
    {/* 2. Use the <Path> component (capital 'P') */}
    <Path
      // 3. Convert attributes to camelCase props
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.1922 0.30286L13.8707 6.14062C14.1969 6.30361 14.4029 6.63692 14.4029 7.00154C14.4029 7.36616 14.1969 7.69947 13.8707 7.86246L2.1922 13.7002C1.85379 13.8695 1.44762 13.8248 1.15409 13.586C0.860558 13.3473 0.734107 12.9587 0.830901 12.5929L2.3119 7.00154L0.830901 1.41017C0.734107 1.04438 0.860558 0.655818 1.15409 0.417055C1.44762 0.178292 1.85379 0.133612 2.1922 0.30286Z"
      // 4. The 'fill' prop correctly receives the color
      fill={color}
    />
  </Svg>
);

export default SendSmsSvg;
