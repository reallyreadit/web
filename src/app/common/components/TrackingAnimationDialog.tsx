import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import TrackingAnimation from './Animations/Tracking/TrackingAnimation';

export default (
	props: {
		onClose: () => void
	}
) => (
	<Dialog
		title="Powered by Reading"
		onClose={props.onClose}
	>
		<TrackingAnimation />
	</Dialog>
);
