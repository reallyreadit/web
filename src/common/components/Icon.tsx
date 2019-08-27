import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export type IconName = 'article-details-star' | 'backward' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'checkmark' | 'chevron-down' | 'chevron-left' | 'clock' | 'comments' | 'earth' | 'email' | 'exclamation' | 'fire' | 'forbid' | 'graduation' | 'line-chart' | 'link' | 'locked' | 'medal' | 'menu2' | 'paper-plane' | 'pin' | 'plus' | 'podium' | 'question-circle' | 'quill' | 'refresh' | 'refresh2' | 'share' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'user' | 'warning' | 'write';
export default (props: {
	display?: 'inline' | 'block',
	name: IconName,
	title?: string,
	className?: ClassValue,
	onClick?: () => void,
	defs?: React.ReactNode,
	fill?: string
}) => (
	<svg
		className={
			classNames(
				'icon_rour3d',
				props.className,
				props.display
			)
		}
		onClick={props.onClick}
	>
		{props.defs ?
			<defs>
				{props.defs}
			</defs> :
			null}
		{props.title ?
			<title>{props.title}</title> :
			null}
		<use xlinkHref={'#icon-' + props.name} fill={props.fill}></use>
	</svg>
);