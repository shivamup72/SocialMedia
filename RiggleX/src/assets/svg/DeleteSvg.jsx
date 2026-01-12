import Svg, {Rect, Path, Circle} from 'react-native-svg';

const DeleteSvg = ({color = '#ffffff', width = '13', height = '18'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 13 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M12.8731 1.64412H9.65485L8.73534 0.724609H4.13779L3.21829 1.64412H0V3.48314H12.8731M0.91951 15.4368C0.91951 15.9245 1.11326 16.3923 1.45815 16.7372C1.80303 17.082 2.27079 17.2758 2.75853 17.2758H10.1146C10.6023 17.2758 11.0701 17.082 11.415 16.7372C11.7599 16.3923 11.9536 15.9245 11.9536 15.4368V4.40265H0.91951V15.4368Z"
      fill={color}
    />
  </Svg>
);

export default DeleteSvg;
