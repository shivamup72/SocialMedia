import Svg, {Rect, Path, Circle} from 'react-native-svg';

const NotSendChatReactionSvg = ({color = '#ffffff', width = '13', height = '13'}) => (

<Svg  width={width} height={height} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path d="M6.5 3.25V6.5L8.66667 7.58333M10.8333 6.5V9.20833M10.8333 11.375H10.8387" stroke={color} stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M11.5103 4.44178C11.1017 3.44586 10.4056 2.59426 9.51091 1.99568C8.6162 1.3971 7.56342 1.07868 6.48695 1.08107C5.41047 1.08345 4.35912 1.40653 3.46707 2.00907C2.57502 2.61161 1.88273 3.46628 1.47856 4.464C1.07439 5.46172 0.976667 6.55725 1.19787 7.61076C1.41906 8.66426 1.94915 9.62797 2.72047 10.3789C3.49179 11.1298 4.46936 11.6339 5.52842 11.8267C6.58748 12.0196 7.67999 11.8926 8.66652 11.4618" stroke={color} stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
)

export default NotSendChatReactionSvg