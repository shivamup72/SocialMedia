import Svg, { Path } from 'react-native-svg'

const PlusCircleSvg = ({ color = '#263238', width = '8', height = '8' }) => (
    <Svg width={width} height={height} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M7.87197 4.74117H4.7554V7.93488H3.11997V4.74117H0.0034019V3.26003H3.11997V0.0663115H4.7554V3.26003H7.87197V4.74117Z" fill={color} />
    </Svg>
)

export default PlusCircleSvg
