import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue
	}
) => (
	<div className={classNames('content-box_kkp9lc', props.className)}>
		{props.children}
	</div>
);