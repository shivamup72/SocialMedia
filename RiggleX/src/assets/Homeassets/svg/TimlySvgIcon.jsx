import Svg, {Rect, Path, Circle, G} from 'react-native-svg';
const TimelySvgIcon = ({color = '#404040', width = '19', height = '19'}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <G opacity="1">
      <Path
        d="M11.3672 11.7109H14.0652V14.4746H11.3672V11.7109Z"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M14.1253 2.17773H13.9174C13.661 2.17773 13.4531 2.38561 13.4531 2.64205V4.46328C13.4531 4.71971 13.661 4.92759 13.9174 4.92759H14.1253C14.3817 4.92759 14.5896 4.71971 14.5896 4.46328V2.64205C14.5896 2.38561 14.3817 2.17773 14.1253 2.17773Z"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M5.1565 2.17773H4.94869C4.69225 2.17773 4.48438 2.38561 4.48438 2.64205V4.46328C4.48438 4.71971 4.69225 4.92759 4.94869 4.92759H5.1565C5.41293 4.92759 5.62081 4.71971 5.62081 4.46328V2.64205C5.62081 2.38561 5.41293 2.17773 5.1565 2.17773Z"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M5.56088 2.82422H13.4498M16.491 6.34793V16.5058C16.491 16.6816 16.3881 16.8241 16.261 16.8241H2.7374C2.61073 16.8241 2.50781 16.6816 2.50781 16.5058M4.48421 2.82422H2.73779C2.61113 2.82422 2.50781 2.96672 2.50781 3.14286V16.4967"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M14.5859 2.82422H16.2694C16.3921 2.82422 16.491 2.96672 16.491 3.14286V16.4967M2.50781 6.34793H16.491"
        stroke={color}
        stroke-width="1.1"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </G>
  </Svg>
);
export default TimelySvgIcon;
