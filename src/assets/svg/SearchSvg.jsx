import Svg, {Rect, Path, Circle} from 'react-native-svg';

const SearchSvg = ({color = '#FFFFFF', width = '19', height = '19'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M14.2396 14.2397L16.7917 16.7918M16.0625 9.13558C16.0625 5.30986 12.9612 2.2085 9.13546 2.2085C5.30973 2.2085 2.20837 5.30986 2.20837 9.13558C2.20837 12.9613 5.30973 16.0627 9.13546 16.0627C12.9612 16.0627 16.0625 12.9613 16.0625 9.13558Z"
      stroke={color}
      stroke-width="1.19318"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default SearchSvg;
