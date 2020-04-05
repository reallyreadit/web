import * as React from 'react';
import AdFreeAnimation from '../AdFreeAnimation';
import Button from '../../../../../common/components/Button';

export default (
	props: {
		onContinue: () => void
	}
) => (
	<div className="button-tutorial-step_12zrbe">
		<h1>The button removes distractions and tracks your progress.</h1>
		<AdFreeAnimation orientation="landscape" />
		<Button
			intent="loud"
			onClick={props.onContinue}
			size="large"
			text="Got It"
		/>
	</div>
);