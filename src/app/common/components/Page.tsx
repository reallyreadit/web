import * as React from 'react';
import * as className from 'classnames';

export default (props: {
	title?: string,
	children: React.ReactNode,
	className?: ClassValue
}) => (
	<div className={className('page', props.className)}>
		{props.title ?
			<div className="title">{props.title}</div> :
			null}
		{props.children}
	</div>
);