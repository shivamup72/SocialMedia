import Svg, { Path } from 'react-native-svg'

const SubTaskArrow = ({ width = 16, height = 14, color = '#263238', strokeOpacity = 0.5, strokeWidth = 1.5 }) => (

    <Svg width={width} height={height} viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M11 13.25L14.75 9.5L11 5.75" stroke={color} stroke-opacity={strokeOpacity} stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
        <Path d="M14.75 9.5L8.75 9.5C4.60775 9.5 1.25 6.14225 1.25 2L1.25 1.25" stroke={color} stroke-opacity={strokeOpacity} stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
    </Svg>

)

export default SubTaskArrow
