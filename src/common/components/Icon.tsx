import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import AlertBadge from './AlertBadge';

export type IconName = 'android' | 'apple' | 'arrow-left' | 'arrow-down' | 'arrow-right' | 'arrow-ne' | 'arrow-up' | 'article-details-star' | 'at-sign' | 'backward' | 'bell' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'candy' | 'cc-amex' | 'cc-diners-club' | 'cc-discover' | 'cc-jcb' | 'cc-mastercard' | 'cc-visa' | 'charity' | 'chart' | 'checkmark' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chrome' |'clock' | 'comments' | 'credit-card' | 'cross' | 'dollar' | 'earth' | 'edge' | 'email' | 'envelope' | 'equalizer' | 'exclamation' | 'fire' | 'flag' | 'firefox' | 'forbid' | 'graduation' | 'group-circle' | 'hourglass' | 'internet' | 'link' | 'linkedin' | 'linux' | 'locked' | 'medal' | 'megaphone' | 'menu' | 'menu2' | 'money-pouch' | 'padlock' | 'paper-plane' | 'phone' | 'pie-chart' | 'piggy-bank' | 'plus' | 'podium' | 'power' | 'question-circle' | 'quill' | 'rating-seal' | 'refresh' | 'refresh2' | 'rocket' | 'safari' | 'share' | 'share-android' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'user' | 'verified-user' | 'warning' | 'windows' | 'write';
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