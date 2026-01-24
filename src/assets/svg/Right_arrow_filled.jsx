import Svg, {Path} from 'react-native-svg';

const RightArrowFilled = ({color = '#FFFFFF', width = '12', height = '24'}) => (

<Svg width={width} height={height} viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path fill-rule="evenodd" clip-rule="evenodd" d="M10.1569 12.7116L4.49994 18.3686L3.08594 16.9546L8.03594 12.0046L3.08594 7.05463L4.49994 5.64062L10.1569 11.2976C10.3444 11.4852 10.4497 11.7395 10.4497 12.0046C10.4497 12.2698 10.3444 12.5241 10.1569 12.7116Z" fill={color} fill-opacity="0.8"/>
</Svg>
)

export default RightArrowFilled
