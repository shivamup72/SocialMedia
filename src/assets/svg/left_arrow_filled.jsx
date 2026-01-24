import Svg, {Rect, Path, Circle} from 'react-native-svg';

const LeftArrowFilled = ({color = '#FFFFFF', width = '12', height = '24'}) => (


<Svg width={width} height={height} viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path fill-rule="evenodd" clip-rule="evenodd" d="M1.84306 12.7116L7.50006 18.3686L8.91406 16.9546L3.96406 12.0046L8.91406 7.05463L7.50006 5.64062L1.84306 11.2976C1.65559 11.4852 1.55028 11.7395 1.55028 12.0046C1.55028 12.2698 1.65559 12.5241 1.84306 12.7116Z" fill={color} fill-opacity="0.8"/>
</Svg>
)

export default LeftArrowFilled