import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Highlighter from './Highlighter';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue,
		highlight?: boolean,
		onClick?: React.MouseEventHandler<HTMLDivElement>
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
		<div
			className={className}
			onClick={props.onClick}
		>
			{props.children}
		</div>
	);
};