import Svg, {Rect, Path, Circle} from 'react-native-svg';

const MicSvgIcon = ({color = '#263238', width = '20', height = '20'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 16 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M14.96 9.88867V10.8887C14.96 14.7547 11.826 17.8887 7.95996 17.8887M0.959961 9.88867V10.8887C0.959961 14.7547 4.09397 17.8887 7.95996 17.8887M7.95996 17.8887V20.8887M7.95996 20.8887H10.96M7.95996 20.8887H4.95996M7.95996 14.8887C5.75082 14.8887 3.95996 13.0978 3.95996 10.8887V4.88867C3.95996 2.67953 5.75082 0.888672 7.95996 0.888672C10.1691 0.888672 11.96 2.67953 11.96 4.88867V10.8887C11.96 13.0978 10.1691 14.8887 7.95996 14.8887Z"
      stroke={color}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default MicSvgIcon;
