import * as React from 'react';
import { Link } from 'react-router-dom';
import * as className from 'classnames';

export default (props: {
	to?: string,
	onClick?: () => void,
	selected?: boolean,
	loud?: boolean,
	children: React.ReactNode,
	className?: ClassValue
}) => {
	const
		classValue = className(
			'header-button', {
				selected: props.selected,
				loud: props.loud
			},
			props.className
		),
		children = (
			<label>{props.children}</label>
		);
	return props.to ?
		<Link
			className={classValue}
			onClick={props.onClick}
			to={props.to}
		>
			{children}
		</Link> :
		<span
			className={classValue}
			onClick={props.onClick}
		>
			{children}
		</span>
	;
};