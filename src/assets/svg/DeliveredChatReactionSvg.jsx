import Svg, { Rect, Path, Circle } from 'react-native-svg';

const DeliveredChatReactionSvg = ({ color = '#000', width = '13', height = '18' }) => (

    <Svg width={width} height={height} viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M0 4.91271L3.50729 8.42L4.39195 7.52906L0.890939 4.02805M13.6966 0L7.0585 6.6444L4.44842 4.02805L3.55121 4.91271L7.0585 8.42L14.5876 0.890939M11.0363 0.890939L10.1517 0L6.16756 3.98413L7.0585 4.86879L11.0363 0.890939Z" fill={color} />
    </Svg>
)

export default DeliveredChatReactionSvg