import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import Highlighter from './Highlighter';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue,
		highlight?: boolean
	}
) => {
	const className = classNames('content-box_kkp9lc', props.className);
	if (props.highlight) {
		return (
			<Highlighter
				className={className}
				highlight={props.highlight}
			>
				{props.children}
			</Highlighter>
		);	
	}
	return (
		<div className={className}>
			{props.children}
		</div>
	);
};