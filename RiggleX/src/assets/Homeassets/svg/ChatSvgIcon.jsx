import Svg, {Rect, Path, Circle} from 'react-native-svg';

const ChatSvgIcon = ({color = '#404040', width = '16', height = '16'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      opacity="1"
      d="M8.00101 14.75C9.49869 14.7498 10.9538 14.2515 12.1372 13.3335C13.3206 12.4156 14.1651 11.1301 14.5377 9.67954C14.9104 8.22896 14.79 6.69563 14.1956 5.32096C13.6012 3.94629 12.5664 2.80835 11.2543 2.08629C9.94217 1.36423 8.42716 1.09906 6.94779 1.33253C5.46841 1.56599 4.10869 2.28484 3.08269 3.37589C2.0567 4.46694 1.42269 5.86823 1.2805 7.35915C1.13831 8.85007 1.496 10.3459 2.29726 11.6113L1.25101 14.75L4.38976 13.7038C5.46944 14.389 6.72223 14.752 8.00101 14.75Z"
      stroke={color}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default ChatSvgIcon;
