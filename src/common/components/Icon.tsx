// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import AlertBadge from './AlertBadge';

export type IconName = 'android' | 'apple' | 'arrow-left' | 'arrow-down' | 'arrow-right' | 'arrow-ne' | 'arrow-up' | 'article-details-star' | 'at-sign' | 'backward' | 'bell' | 'binoculars' | 'bookmark' | 'box' | 'cancel' | 'candy' | 'charity' | 'chart' | 'checkmark' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chrome' |'clock' | 'comments' | 'cross' | 'dollar' | 'earth' | 'edge' | 'email' | 'envelope' | 'equalizer' | 'exclamation' | 'fire' | 'flag' | 'firefox' | 'forbid' | 'gear2' | 'graduation' | 'group-circle' | 'hourglass' | 'history-simple' | 'internet' | 'link' | 'linkedin' | 'linux' | 'locked' | 'medal' | 'megaphone' | 'menu' | 'menu2' | 'money-pouch' | 'padlock' | 'paper-plane' | 'phone' | 'pie-chart' | 'piggy-bank' | 'plus' | 'podium' | 'power' | 'question-circle' | 'quill' | 'rating-seal' | 'refresh' | 'refresh2' | 'rocket' | 'safari' | 'share' | 'share-android' | 'spinner' | 'star' | 'trophy' | 'twitter' | 'user' | 'verified-user' | 'warning' | 'windows' | 'write';
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