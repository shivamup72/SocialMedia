import Svg, {Path} from 'react-native-svg';

const UnStarSvg = ({color = '#ffffff', width = '15', height = '15'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M13.8125 13.438L1.5 1.06299L0.6875 1.87549L4.3125 5.50049L1.25 5.75049L4.6875 8.75049L3.6875 13.1255L7.5625 10.813L11.4375 13.1255L11.25 12.3755L13.0625 14.188L13.8125 13.438ZM9.875 11.063L7.5 9.62549L5.125 11.063L5.75 8.37549L3.6875 6.56299L5.25 6.43799L9.875 11.063ZM7 5.00049L6.25 4.25049L7.5 1.25049L9.25 5.37549L13.75 5.75049L10.5625 8.50049L9.875 7.81299L11.375 6.56299L8.625 6.31299L7.5625 3.81299L7 5.00049Z"
      fill={color}
      fill-opacity="0.5"
    />
  </Svg>
);

export default UnStarSvg;
