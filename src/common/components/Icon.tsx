import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import AlertBadge from './AlertBadge';

export type IconName = 'article-details-star' | 'at-sign' | 'backward' | 'bell' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'checkmark' | 'chevron-left' | 'chevron-right' | 'clock' | 'comments' | 'email' | 'exclamation' | 'fire' | 'forbid' | 'graduation' | 'group-circle' | 'link' | 'locked' | 'medal' | 'megaphone' | 'menu2' | 'paper-plane' | 'plus' | 'podium' | 'power' | 'question-circle' | 'quill' | 'refresh' | 'refresh2' | 'share' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'user' | 'warning' | 'write';
export default (props: {
	badge?: number,
	display?: 'inline' | 'block',
	name: IconName,
	title?: string,
	className?: ClassValue,
	onClick?: () => void
}) => (
	<span
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
	</span>
);