import Svg, {Rect, Path, Circle} from 'react-native-svg';

const ResumeIconSvg = ({color = '#FC8C4D', width = '4', height = '16'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M8.62782 7.73681L2.99228 10.9571C1.65896 11.719 0 10.7563 0 9.22063V6.00033V2.78002C0 1.24437 1.65896 0.281639 2.99228 1.04353L8.62782 4.26384C9.97145 5.03163 9.97145 6.96902 8.62782 7.73681Z"
      fill={color}
    />
  </Svg>
);

export default ResumeIconSvg;
