import Svg, { Rect, Path, Circle } from 'react-native-svg';

const YesCircularIcon = ({ color = '#7242FB', width = '22', height = '22', opacity = '0.8' }) => (
 

<Svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path d="M11 20.75C13.2557 20.75 15.4416 19.9678 17.1853 18.5368C18.929 17.1058 20.1225 15.1144 20.5626 12.9021C21.0026 10.6897 20.6619 8.39317 19.5986 6.40382C18.5352 4.41447 16.815 2.85536 14.731 1.99215C12.647 1.12894 10.3281 1.01504 8.16955 1.66985C6.01097 2.32467 4.14622 3.70768 2.89303 5.58325C1.63983 7.45881 1.07574 9.71088 1.29685 11.9557C1.51796 14.2006 2.5106 16.2993 4.10564 17.8943" stroke="#7242FB" stroke-width="2.16667" stroke-linecap="round"/>
<Path d="M15.3345 8.83203L11.4367 13.5099C10.7271 14.3614 10.3718 14.7882 9.89401 14.8099C9.41626 14.8315 9.0241 14.4383 8.23976 13.6539L6.66785 12.082" stroke={color} stroke-width="2.16667" stroke-linecap="round"/>
</Svg>
);

export default YesCircularIcon