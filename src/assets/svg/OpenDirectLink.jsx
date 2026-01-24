import Svg, { Rect, Path, Circle } from 'react-native-svg';

const OpenDirectLink = ({ color = '#263238', width = '13', height = '13' }) => (


<Svg width={width} height={height} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path d="M6.75 4V6.25C6.75 6.38261 6.69732 6.50979 6.60355 6.60355C6.50979 6.69732 6.38261 6.75 6.25 6.75H0.75C0.617392 6.75 0.490215 6.69732 0.396447 6.60355C0.302678 6.50979 0.25 6.38261 0.25 6.25V0.75C0.25 0.617392 0.302678 0.490215 0.396447 0.396447C0.490215 0.302678 0.617392 0.25 0.75 0.25H3M5 0.25H6.75M6.75 0.25V2M6.75 0.25L3.5 3.5" stroke={color} stroke-opacity="0.8" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
)


export default OpenDirectLink