import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const DownArrowSvg = ({ width = 32, height = 32, color = '#FF8C00', ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none" {...props}>
        <Path
            d="M8 12l8 8 8-8"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default DownArrowSvg;
