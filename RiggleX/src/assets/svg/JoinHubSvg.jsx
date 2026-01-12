import Svg, {Rect, Path} from 'react-native-svg';

const JoinHubSvg = ({color = '#FFFFFF', width = '19', height = '19'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9.13803 7H7.16663V7.66667H8.86189L10.1952 9L8.86189 10.3333H7.16663V11H9.13803L10.8047 9.33333H12.362L11.931 9.76433L12.4024 10.2357L13.6381 9.00003L12.4024 7.76433L11.931 8.23573L12.3619 8.66667H10.8047L9.13803 7Z"
      fill="#263238"
    />
    <Rect x="2" y="2.5" width="16" height="13" rx="3.5" stroke="#263238" />
  </Svg>
);

export default JoinHubSvg;
