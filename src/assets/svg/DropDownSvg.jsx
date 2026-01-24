import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DropDownSvgIcon = ({width,height,color,fillOpacity}) => (
  // <View>
    <Svg width={width} height={height} viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path 
        d="M8.61444 0.634659L9.3211 1.34199L5.46977 5.19466C5.40806 5.25676 5.33468 5.30605 5.25384 5.33968C5.17301 5.37331 5.08632 5.39063 4.99877 5.39063C4.91122 5.39063 4.82453 5.37331 4.7437 5.33968C4.66287 5.30605 4.58948 5.25676 4.52777 5.19466L0.674439 1.34199L1.38111 0.635325L4.99777 4.25132L8.61444 0.634659Z" 
        fill={color} 
        fillOpacity={fillOpacity}
      />
    </Svg>
  // </View>
);

export default DropDownSvgIcon;
