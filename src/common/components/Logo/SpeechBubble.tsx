import * as React from 'react';

interface Props {
  percentComplete?: number,
  renderLabel?: boolean,
  isRead?: boolean,
  uuid?: string,
  children?: React.ReactNode
}
const style = {
  stroke: '#000000',
  strokeWidth: 1.49261832
};
const render: React.SFC<Props> = (props: Props) => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="speech-bubble">
    {props.percentComplete && props.uuid ?
      <defs>
        <linearGradient id={props.uuid + '-bubble-fill'} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset={props.percentComplete + '%'} stopColor={props.isRead ? 'palegreen' : 'pink'} />
          <stop offset={props.percentComplete + '%'} stopColor="white" />
        </linearGradient>
      </defs> :
      null}
    <path
      style={style}
      d="m 14.7385,0.56637537 h 98.69526 c 9.27905,0 13.91857,4.62798733 13.91857,13.88396163 v 70.681992 c 0,9.255975 -4.63952,13.883963 -13.91857,13.883963 H 62.820808 C 49.324019,115.21425 32.30046,124.56611 4.4633354,126.8801 20.49077,119.93812 24.86109,110.58627 24.86109,99.016292 H 14.7385 c -9.2790415,0 -13.91856227,-4.627988 -13.91856227,-13.883963 V 14.450337 C 0.81993773,5.1943627 5.4594585,0.56637537 14.7385,0.56637537 Z"
      fill={props.percentComplete && props.uuid ? `url(#${props.uuid + '-bubble-fill'})` : '#ffffff'}
    />
    {props.renderLabel ?
      <text
        x="50%"
        y="52%"
        style={{
          fill: 'gray',
          fontSize: '325%',
          textAnchor: 'middle'
        }}
      >
        {props.percentComplete.toFixed() + '%'}
      </text> :
      null}
    {props.children}
  </svg>
);
render.defaultProps = {
  percentComplete: 0,
  isRead: false
};
export default render;