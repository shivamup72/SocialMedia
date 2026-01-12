
import Svg, { Path } from 'react-native-svg';

const EditProfileIconSvg = ({ width = 13, height = 14, color = '#FFFFFF' }) => (
  <Svg width={width} height={height} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path 
      d="M2.88229 9.98981L9.54379 3.32831L8.61504 2.39956L1.95354 9.06107V9.98981H2.88229ZM3.42679 11.3035H0.639893V8.51656L8.15067 1.00579C8.27384 0.88265 8.44088 0.813477 8.61504 0.813477C8.78921 0.813477 8.95624 0.88265 9.07942 1.00579L10.9376 2.86394C11.0607 2.98711 11.1299 3.15415 11.1299 3.32831C11.1299 3.50248 11.0607 3.66951 10.9376 3.79269L3.42679 11.3035ZM0.639893 12.6171H12.4627V13.9308H0.639893V12.6171Z" 
      fill={color} 
    />
  </Svg>
);

export default EditProfileIconSvg;