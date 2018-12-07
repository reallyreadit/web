import * as React from 'react';
import InfoBox from './controls/InfoBox';

export default () => (
	<InfoBox
		position="static"
		style="success"
	>
		<p>Welcome!</p>
		<p><strong>To get started, read something.</strong></p>
		<p>The articles below are automatically selected based on what the community is reading.</p>
	</InfoBox>
);