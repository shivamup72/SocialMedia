import Svg, { Path } from 'react-native-svg'

const LightDeleteSvg = ({width = '10', height = '12', color = '#F31D1D', fillOpacity = '0.8'}) => (
    <Svg width={width} height={height} viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M7.66658 4V10.6667H2.33325V4H7.66658ZM6.66658 0H3.33325L2.66659 0.666667H0.333252V2H9.66658V0.666667H7.33325L6.66658 0ZM8.99992 2.66667H0.999919V10.6667C0.999919 11.4 1.59992 12 2.33325 12H7.66658C8.39992 12 8.99992 11.4 8.99992 10.6667V2.66667Z" fill={color} fill-opacity={fillOpacity}/>
    </Svg>
)

export default LightDeleteSvg
