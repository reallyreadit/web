import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import AlertBadge from './AlertBadge';

export type IconName = 'arrow-left' | 'arrow-down' | 'arrow-right' | 'arrow-up' | 'article-details-star' | 'at-sign' | 'backward' | 'bell' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'cc-amex' | 'cc-diners-club' | 'cc-discover' | 'cc-jcb' | 'cc-mastercard' | 'cc-visa' | 'checkmark' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'clock' | 'comments' | 'credit-card' | 'dollar' | 'earth' | 'email' | 'equalizer' | 'exclamation' | 'fire' | 'flag' | 'forbid' | 'graduation' | 'group-circle' | 'link' | 'locked' | 'medal' | 'megaphone' | 'menu2' | 'padlock' | 'paper-plane' | 'plus' | 'podium' | 'power' | 'question-circle' | 'quill' | 'refresh' | 'refresh2' | 'share' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'warning' | 'write';
export default (props: {
	badge?: number | false,
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
		{props.badge !== false ?
			<AlertBadge count={props.badge} /> :
			null}
		<svg className="icon">
			{props.title ?
				<title>{props.title}</title> :
				null}
			<use xlinkHref={'#icon-' + props.name}></use>
		</svg>
	</span>
);