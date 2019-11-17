import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import AlertBadge from './AlertBadge';

export type IconName = 'article-details-star' | 'backward' | 'bell' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'checkmark' | 'chevron-down' | 'chevron-left' | 'clock' | 'comments' | 'earth' | 'email' | 'exclamation' | 'fire' | 'forbid' | 'graduation' | 'line-chart' | 'link' | 'locked' | 'medal' | 'menu2' | 'paper-plane' | 'plus' | 'podium' | 'power' | 'question-circle' | 'quill' | 'refresh' | 'refresh2' | 'share' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'user' | 'warning' | 'write';
export default (props: {
	badge?: number,
	display?: 'inline' | 'block',
	name: IconName,
	title?: string,
	className?: ClassValue,
	onClick?: () => void
}) => (
	<div
		className={
			classNames(
				'icon_rour3d',
				props.className,
				props.display || 'inline'
			)
		}
		onClick={props.onClick}
	>
		<AlertBadge count={props.badge} />
		<svg className="icon">
			{props.title ?
				<title>{props.title}</title> :
				null}
			<use xlinkHref={'#icon-' + props.name}></use>
		</svg>
	</div>
);