import * as React from 'react';

export default (props: { uuid: string }) => (
	<radialGradient id={props.uuid + '-shimmer-gradient'} cx="0" cy="1" r="2">
		<stop offset="-0.5" stopColor="MediumSlateBlue">
			<animate attributeName="offset" from="-0.5" to="1" dur="2500ms" repeatCount="indefinite" />
		</stop>
		<stop offset="-0.25" stopColor="DeepSkyBlue">
			<animate attributeName="offset" from="-0.25" to="1.25" dur="2500ms" repeatCount="indefinite" />
		</stop>
		<stop offset="0" stopColor="MediumSlateBlue">
			<animate attributeName="offset" from="0" to="1.5" dur="2500ms" repeatCount="indefinite" />
		</stop>
	</radialGradient>
);