import * as React from 'react';
import ActionLink from './ActionLink';

export default (
	props: {
		isBusy: boolean,
		onClick?: () => void,
		text: string
	}
) => (
	<div className="update-banner_7zu7hd">
		<ActionLink
			onClick={props.onClick}
			state={props.isBusy ? 'busy' : 'normal'}
			text={props.text}
		/>
	</div>
);