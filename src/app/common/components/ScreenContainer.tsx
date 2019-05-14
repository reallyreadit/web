import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export default (props: {
	children: React.ReactNode,
	className?: ClassValue
}) => (
	<div className={classNames('screen-container_ayqss6', props.className)}>
		{props.children}
	</div>
);