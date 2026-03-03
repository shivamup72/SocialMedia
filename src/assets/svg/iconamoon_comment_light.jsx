import Svg, { Rect, Path, Circle } from 'react-native-svg';

const CommentIconSvg = ({ color = '#ffffff', width = '13', height = '13' }) => (

    <Svg width={width} height={height} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M6.04034 10.5709C6.9364 10.5709 7.81234 10.3052 8.55739 9.80737C9.30243 9.30954 9.88313 8.60197 10.226 7.77411C10.5689 6.94626 10.6587 6.03531 10.4839 5.15647C10.309 4.27762 9.87754 3.47035 9.24393 2.83674C8.61032 2.20313 7.80305 1.77163 6.92421 1.59682C6.04536 1.42201 5.13442 1.51173 4.30656 1.85464C3.47871 2.19754 2.77113 2.77824 2.2733 3.52329C1.77548 4.26834 1.50977 5.14428 1.50977 6.04034C1.50977 6.78939 1.69099 7.49516 2.01316 8.11786L1.50977 10.5709L3.96282 10.0675C4.58502 10.3892 5.29179 10.5709 6.04034 10.5709Z" stroke={color} stroke-width="0.755095" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
)

export default CommentIconSvg;