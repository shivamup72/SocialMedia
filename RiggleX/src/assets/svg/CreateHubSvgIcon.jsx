import Svg, {Rect, Path} from 'react-native-svg';

const CreateHubSvg = ({
  color = '#263238',
  width = '20',
  height = '18',
  widthplus = '16',
  heightplus = '13',
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M12.47 9.23H10.34V11.39H9.49V9.23H7.37V8.46H9.49V6.29H10.34V8.46H12.47V9.23Z"
      fill={color}
    />
    <Rect
      x="2"
      y="2"
      width={widthplus}
      height={heightplus}
      rx="3.5"
      stroke={color}
    />
  </Svg>
);

export default CreateHubSvg;
