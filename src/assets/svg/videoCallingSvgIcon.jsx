import Svg, {Path} from 'react-native-svg';

const VideoCallingSvgIcon = ({
  color = '#263238',
  width = '25',
  height = '25',
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.6719 18.4899H5.46875C4.17396 18.4899 3.125 17.441 3.125 16.1462V8.85449C3.125 7.5597 4.17396 6.51074 5.46875 6.51074H13.6719C14.9667 6.51074 16.0156 7.5597 16.0156 8.85449V16.1462C16.0156 17.441 14.9667 18.4899 13.6719 18.4899Z"
      stroke={color}
      stroke-width="1.5625"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M16.0156 13.6432L19.9687 16.8245C20.7354 17.4422 21.875 16.8964 21.875 15.912V9.08908C21.875 8.1047 20.7354 7.55887 19.9687 8.17658L16.0156 11.3578"
      stroke={color}
      stroke-width="1.5625"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default VideoCallingSvgIcon;
