import Svg, { Rect, Path, Circle } from 'react-native-svg';

const ClockIcon = ({ color = '#FC8C4D', width = '15', height = '16' }) => (
    <Svg width={width} height={height} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M1.125 8C1.125 8.83718 1.28989 9.66616 1.61027 10.4396C1.93064 11.2131 2.40022 11.9158 2.99219 12.5078C3.58417 13.0998 4.28694 13.5694 5.06039 13.8897C5.83384 14.2101 6.66282 14.375 7.5 14.375C8.33718 14.375 9.16616 14.2101 9.93961 13.8897C10.7131 13.5694 11.4158 13.0998 12.0078 12.5078C12.5998 11.9158 13.0694 11.2131 13.3897 10.4396C13.7101 9.66616 13.875 8.83718 13.875 8C13.875 6.30924 13.2033 4.68774 12.0078 3.49219C10.8123 2.29665 9.19075 1.625 7.5 1.625C5.80924 1.625 4.18774 2.29665 2.99219 3.49219C1.79665 4.68774 1.125 6.30924 1.125 8Z" stroke={color} stroke-width="1.41667" stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M7.5 4.45679V7.99845L9.625 10.1235" stroke={color} stroke-width="1.41667" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
)

export default ClockIcon