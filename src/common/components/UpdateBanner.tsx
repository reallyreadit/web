import * as React from 'react';
import Link from './Link';

export default (
	props: {
		isBusy: boolean,
		onClick?: () => void,
		text: string
	}
) => (
	<div className="update-banner_7zu7hd">
		<Link
			onClick={props.onClick}
			state={props.isBusy ? 'busy' : 'normal'}
			text={props.text}
		/>
	</div>
);