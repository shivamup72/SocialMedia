import Svg, {Path} from 'react-native-svg';

const MailAddIcon = ({width = '17', height = '17', color = '#263238'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M10.1193 4.45251H3.6431C3.2137 4.45251 2.80189 4.62309 2.49826 4.92672C2.19463 5.23035 2.02405 5.64216 2.02405 6.07156V11.7382C2.02405 12.1676 2.19463 12.5794 2.49826 12.8831C2.80189 13.1867 3.2137 13.3573 3.6431 13.3573H11.7383C12.1677 13.3573 12.5795 13.1867 12.8832 12.8831C13.1868 12.5794 13.3574 12.1676 13.3574 11.7382V7.69061"
      stroke={color}
      stroke-opacity="0.8"
      stroke-width="0.809524"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M3.64294 6.88096L7.69056 9.30953L11.7382 6.88096M13.3572 2.83334V6.07144M11.7382 4.45239H14.9763"
      stroke={color}
      stroke-opacity="0.8"
      stroke-width="0.809524"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default MailAddIcon;
