import * as React from 'react';
import * as className from 'classnames';

export default (props: {
	children: React.ReactNode,
	className?: ClassValue
}) => (
	<div className={className('app-screen', props.className)}>
		<div className="content">
			{props.children}
		</div>
	</div>
);