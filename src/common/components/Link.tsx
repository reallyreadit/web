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
import Icon, { IconName } from './Icon';
import SpinnerIcon from './SpinnerIcon';
import AlertBadge from './AlertBadge';
import ScreenKey, {
	ScreenKeyNavParams,
	ScreenParams,
} from '../routing/ScreenKey';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import { NavReference } from '../../app/common/components/Root';

type BaseProps = {
	badge?: number;
	className?: ClassValue;
	iconLeft?: IconName;
	iconRight?: IconName;
	onAnimationEnd?: (event: React.AnimationEvent) => void;
	state?: 'normal' | 'disabled' | 'busy';
	stopPropagation?: boolean;
};
type NoHrefProps = BaseProps & {
	onClick: () => void;
};
type StringHrefProps = BaseProps & {
	href: string;
	onClick: (href: string) => void;
};
type ScreenHrefProps = BaseProps & {
	screen: ScreenKey;
	params?: ScreenParams;
	onClick: (params: ScreenKeyNavParams) => void;
};
type AttrContentProps = BaseProps & {
	text: string;
};
type ChildContentProps = BaseProps & {
	children?: React.ReactNode;
};
export type Props = (NoHrefProps | StringHrefProps | ScreenHrefProps) &
	(AttrContentProps | ChildContentProps);

function isStringHrefProps(
	props: NoHrefProps | StringHrefProps | ScreenHrefProps
): props is StringHrefProps {
	return typeof (props as StringHrefProps).href === 'string';
}
function isScreenHrefProps(
	props: NoHrefProps | StringHrefProps | ScreenHrefProps
): props is ScreenHrefProps {
	return typeof (props as ScreenHrefProps).screen === 'number';
}

class Link extends React.Component<Props> {
	private _handleClick = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		if (
			this.props.stopPropagation != null &&
			this.props.stopPropagation !== false
		) {
			e.stopPropagation();
		}
		if (this.props.state === 'busy' || this.props.state === 'disabled') {
			return;
		}
		if (isStringHrefProps(this.props)) {
			this.props.onClick(this.props.href);
		} else if (isScreenHrefProps(this.props)) {
			this.props.onClick({
				key: this.props.screen,
				params: this.props.params,
			});
		} else {
			this.props.onClick();
		}
	};
	public render() {
		const cssClass = classNames('link_ke15oa', this.props.className, {
				disabled: this.props.state === 'disabled',
				busy: this.props.state === 'busy',
			}),
			childContent =
				(this.props as AttrContentProps).text ??
				(this.props as ChildContentProps).children,
			content = (
				<>
					{this.props.state === 'busy' ? (
						<SpinnerIcon key="spinner" />
					) : this.props.iconLeft ? (
						<Icon
							className="icon-left"
							badge={this.props.badge}
							key="icon-left"
							name={this.props.iconLeft}
						/>
					) : null}
					{childContent ? <span>{childContent}</span> : null}
					{this.props.iconRight ? (
						<Icon
							className="icon-right"
							badge={this.props.badge}
							key="icon-right"
							name={this.props.iconRight}
						/>
					) : null}
					{this.props.badge != null ? (
						<AlertBadge count={this.props.badge} />
					) : null}
				</>
			),
			href = isStringHrefProps(this.props)
				? this.props.href
				: isScreenHrefProps(this.props)
				? findRouteByKey(routes, this.props.screen).createUrl(this.props.params)
				: null;
		return href ? (
			<a
				onAnimationEnd={this.props.onAnimationEnd}
				className={cssClass}
				href={href}
				onClick={this._handleClick}
			>
				{content}
			</a>
		) : (
			<span
				onAnimationEnd={this.props.onAnimationEnd}
				className={cssClass}
				onClick={this._handleClick}
			>
				{content}
			</span>
		);
	}
}

export default Link;

export const DiscordInviteLink = (props: {
	children: React.ReactNode;
	onClick: (ref: NavReference) => void;
}) => (
	<Link onClick={props.onClick} href="https://discord.gg/XQZa8pHdVs">
		{props.children}
	</Link>
);
