import Svg, {Rect, Path, Circle} from 'react-native-svg';

const AudioSvgIcon = ({color = '#ffffff', width = '33', height = '36'}) => (
  <Svg
    width="33"
    height="36"
    viewBox="0 0 33 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M5.19971 34H27.5997C28.4484 34 29.2623 33.6629 29.8624 33.0627C30.4626 32.4626 30.7997 31.6487 30.7997 30.8V10L22.7997 2H8.39971C7.55101 2 6.73708 2.33714 6.13697 2.93726C5.53685 3.53737 5.19971 4.35131 5.19971 5.2V8.4"
      stroke={color}
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M21.1997 2V8.4C21.1997 9.24869 21.5368 10.0626 22.137 10.6627C22.7371 11.2629 23.551 11.6 24.3997 11.6H30.7997"
      stroke={color}
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M3.6 27.5999C4.48366 27.5999 5.2 26.8836 5.2 25.9999C5.2 25.1162 4.48366 24.3999 3.6 24.3999C2.71634 24.3999 2 25.1162 2 25.9999C2 26.8836 2.71634 27.5999 3.6 27.5999Z"
      stroke={color}
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M2 25.9998V21.1998C2 19.5024 2.67428 17.8746 3.87452 16.6743C5.07475 15.4741 6.70261 14.7998 8.4 14.7998C10.0974 14.7998 11.7253 15.4741 12.9255 16.6743C14.1257 17.8746 14.8 19.5024 14.8 21.1998V25.9998"
      stroke={color}
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M13.2001 27.5999C14.0838 27.5999 14.8001 26.8836 14.8001 25.9999C14.8001 25.1162 14.0838 24.3999 13.2001 24.3999C12.3164 24.3999 11.6001 25.1162 11.6001 25.9999C11.6001 26.8836 12.3164 27.5999 13.2001 27.5999Z"
      stroke={color}
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default AudioSvgIcon;
