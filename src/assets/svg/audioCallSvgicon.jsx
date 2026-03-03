import Svg, {Path} from 'react-native-svg';

const AudioCallSvgicon = ({color = '#263238', width = '19', height = '19'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M17.875 15.75V14.2069C17.875 13.4402 17.4082 12.7508 16.6964 12.466L14.7894 11.7032C13.8839 11.3411 12.8521 11.7334 12.4159 12.6056L12.25 12.9375C12.25 12.9375 9.90625 12.4688 8.03125 10.5938C6.15625 8.71875 5.6875 6.375 5.6875 6.375L6.01939 6.20905C6.89161 5.77295 7.28393 4.74107 6.92176 3.83565L6.15896 1.92864C5.87421 1.21678 5.18476 0.75 4.41806 0.75H2.875C1.83947 0.75 1 1.58947 1 2.625C1 10.9093 7.71573 17.625 16 17.625C17.0355 17.625 17.875 16.7855 17.875 15.75Z"
      stroke={color}
      strokeWidth="1.40625"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AudioCallSvgicon;
