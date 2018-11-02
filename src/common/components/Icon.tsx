import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export type IconName = 'locked' | 'switch' | 'plus' | 'refresh2' | 'checkmark' |
	'cancel' | 'backward' | 'exclamation' | 'forbid' | 'spinner' | 'comments' |
	'write' | 'envelope' | 'user' | 'cog' | 'book' | 'refresh' | 'lightbulb' |
	'question' | 'hyperlink' | 'gallery' | 'clock' | 'key' | 'trophy' |
	'home' | 'box' | 'email' | 'share' | 'in-alt' | 'out-alt' |
	'three-bars' | 'arrow-up' | 'arrow-down' | 'article-details-star' |
	'thumbs-o-up' | 'retweet' | 'sort' | 'heart' | 'circle-full' | 'arrow-right2' |
	'line-chart' | 'chevron-left' | 'books' | 'star' | 'history' | 'podium' | 'pizza';
export default (props: {
	name: IconName,
	title?: string,
	className?: ClassValue,
	onClick?: () => void,
	defs?: React.ReactNode,
	fill?: string
}) => (
	<svg
		className={classNames('icon', props.className)}
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