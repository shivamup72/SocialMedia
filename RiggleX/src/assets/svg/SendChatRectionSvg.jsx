import Svg, {Rect, Path, Circle} from 'react-native-svg';

const SendChatRectionSvg = ({color = '#ffffff', width = '13', height = '13'}) => (


<Svg width={width} height={height} viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path d="M8.85571 0.418945L9.55786 0.918945L9.64478 0.980469L9.57739 1.0625L4.14966 7.77441L4.08618 7.85254L4.00806 7.78809L0.539307 4.89746L0.602783 4.82031L1.24341 4.05176L1.30688 3.97559L1.38403 4.03906L3.91528 6.14746L8.72095 0.435547L8.78052 0.365234L8.85571 0.418945Z" fill={color} stroke={color} stroke-width="0.2"/>
</Svg>
)

export default SendChatRectionSvg