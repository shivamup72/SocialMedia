import Svg, {Rect, Path} from 'react-native-svg';

const FolderSvgIcon = ({width = '32', height = '26', color = '#FC8C4D'}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M0.166748 25.6666V0.333313H12.8334L16.0001 3.49998H31.8334V25.6666H0.166748ZM3.33341 22.5H28.6667V6.66665H14.6938L11.5272 3.49998H3.33341V22.5Z"
        fill={color}
      />
    </Svg>
  );
};

export default FolderSvgIcon;
