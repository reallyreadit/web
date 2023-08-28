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
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import {
	NavOptions,
	NavReference,
	NavMethod,
	Screen,
} from '../../../common/components/Root';
import Link from '../../../../common/components/Link';
import { DeviceType } from '../../../../common/DeviceType';
import UserAccount from '../../../../common/models/UserAccount';
import Icon from '../../../../common/components/Icon';

interface Props {
	deviceType: DeviceType;
	onBeginOnboarding: (analyticsAction: string) => void;
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onCreateStaticContentUrl: (path: string) => string;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onOpenMenu: () => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onOpenSignInPrompt: (analyticsAction: string) => void;
	onViewHome: () => void;
	onViewNotifications: () => void;
	topScreen: Screen,
	user: UserAccount | null;
}

type State = {
	isMenuOpen: boolean
};

const analyticsAction = 'Header';

const menuLinks = [
	{
		screenKey: ScreenKey.Home,
		linkText: 'Article of the Day',
	},
	{
		screenKey: ScreenKey.Leaderboards,
		linkText: 'Leaderboards',
	},
	{
		screenKey: ScreenKey.MyReads,
		linkText: 'My Reads',
	},
	{
		screenKey: ScreenKey.MyFeed,
		linkText: 'My Feed',
	},
];

export default class HomeHeader extends React.Component<Props, State> {
	state: State = {
		isMenuOpen: false
	};

	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
		this.closeMenu();
	};

	private readonly _handleLinkClick = (ref: NavReference) => {
		this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });
		this.closeMenu();
	};

	private readonly _toggleMenu = () => {
		this.setState((prev) => {
			return { isMenuOpen: !prev.isMenuOpen };
		});
	};

	private readonly _openSignInPrompt = () => {
		this.props.onOpenSignInPrompt(analyticsAction);
		this.closeMenu();
	};

	constructor(props: Props) {
		super(props);
	}

	private closeMenu() {
		this.setState({ isMenuOpen: false });
	}

	public render() {
		let hideLandscapeTitle = false;
		const linkElements = menuLinks.map((link) => {
			let className = '';
			if (link.screenKey === this.props.topScreen.key) {
				hideLandscapeTitle = true;
				className = 'active';
			}
			return (
				<Link
					key={link.linkText}
					screen={link.screenKey}
					className={className}
					onClick={this._handleLinkClick}
				>
					{link.linkText}
				</Link>
			);
		});
		return (
			<header className={classNames('home-header_2afwll', { 'hide-landscape-title': hideLandscapeTitle })}>
				<div className={classNames('nav', { 'menu-open': this.state.isMenuOpen })}>
					<div className="content">
						<a
							className="logo"
							href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
							onClick={this._handleLogoClick}
						></a>
						<div
							className="links"
						>
							<div className="pages">
								{linkElements}
							</div>
							<div className="auth">
								<Button
									className="log-in"
									text="Log In"
									onClick={this._openSignInPrompt}
								/>
							</div>
						</div>
						<Icon
							className="menu-button"
							display="block"
							name={this.state.isMenuOpen ? 'cross' : 'menu'}
							onClick={this._toggleMenu}
						/>
					</div>
				</div>
				<div className="title">
					<div className="content">{this.props.topScreen.title.default}</div>
				</div>
			</header>
		);
	}
}
