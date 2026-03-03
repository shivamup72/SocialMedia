import Svg, {Rect, Path, Circle} from 'react-native-svg';

const EditLinePencilIcon = ({
  color = '#263238',
  width = '21',
  height = '21',
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M5.61225 13.9032L14.4865 5.0289L13.2493 3.79165L4.375 12.6659V13.9032H5.61225ZM6.33763 15.6531H2.625V11.9405L12.6306 1.9349C12.7947 1.77086 13.0172 1.67871 13.2493 1.67871C13.4813 1.67871 13.7038 1.77086 13.8679 1.9349L16.3432 4.41027C16.5073 4.57436 16.5994 4.79688 16.5994 5.0289C16.5994 5.26092 16.5073 5.48344 16.3432 5.64752L6.33763 15.6531ZM2.625 17.4031H18.375V19.1531H2.625V17.4031Z"
      fill={color}
      fill-opacity="0.8"
    />
  </Svg>
);

export default EditLinePencilIcon;
