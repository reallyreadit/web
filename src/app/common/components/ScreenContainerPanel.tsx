import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export default (props: {
	children: React.ReactNode,
	className?: ClassValue
}) => (
	<div className={classNames('screen-container-panel_8bimi6', props.className)}>
		{props.children}
	</div>
);