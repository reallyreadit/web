import * as React from 'react';
import * as className from 'classnames';

export default (props: {
	title?: string,
	subTitle?: string,
	children: React.ReactNode,
	className?: ClassValue
}) => (
	<div className={className('page', props.className)}>
		{props.title ?
			<div className="title">
				<span>{props.title}</span>
			</div> :
			null}
		{props.subTitle ?
			<div className="sub-title">{props.subTitle}</div> :
			null}
		{props.children}
	</div>
);