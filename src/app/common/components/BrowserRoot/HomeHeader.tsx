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
// import classNames from 'classnames';
// import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import {
	NavOptions,
	NavReference,
	NavMethod,
} from '../../../common/components/Root';
import Link from '../../../../common/components/Link';
import { DeviceType } from '../../../../common/DeviceType';
import UserAccount from '../../../../common/models/UserAccount';
import Popover, { MenuState, MenuPosition } from '../../../../common/components/Popover';
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
	rootScreenKey: ScreenKey;
	topScreenTitle: string,
	user: UserAccount | null;
}

type State = {
	menuState: MenuState
};

const analyticsAction = 'Header';

export default class HomeHeader extends React.Component<Props, State> {
	state: State = {
		menuState: MenuState.Closed,
	};

	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};

	private readonly _handleLinkClick = (ref: NavReference) => {
		this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });
		this._beginClosingMenu();
	};

	private readonly _openMenu = () => {
		this.setState({ menuState: MenuState.Opened });
	};

	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};

	private readonly _closeMenu = () => {
		this.setState({ menuState: MenuState.Closed });
	};

	private readonly _openSignInPrompt = () => {
		this.props.onOpenSignInPrompt(analyticsAction);
	};

	constructor(props: Props) {
		super(props);
	}

	public render() {
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
		].map((link) => (
				<Link
					key={link.linkText}
					screen={link.screenKey}
					className={
						this.props.rootScreenKey ===
							link.screenKey
							? 'active'
							: ''
					}
					onClick={this._handleLinkClick}
				>
					{link.linkText}
				</Link>
			));
		const logInButton = (
			<Button
				className="log-in"
				text="Log In"
				onClick={this._openSignInPrompt}
			/>
		);
		return (
			<header className="home-header_2afwll">
				<div className="content">
					<div className="left">
						<a
							className="logo"
							href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
							onClick={this._handleLogoClick}
						></a>
						<div
							className="links"
						>
							{menuLinks}
						</div>
					</div>
					<div className="right">
						{logInButton}
						<Popover
							className="menu"
							menuChildren={
								<span className="content">
									{menuLinks}
									{logInButton}
								</span>
							}
							menuPosition={MenuPosition.BottomRight}
							menuState={this.state.menuState}
							onBeginClosing={this._beginClosingMenu}
							onClose={this._closeMenu}
							onOpen={this._openMenu}
						>
							<span className="label">{this.props.topScreenTitle}</span>
							<Icon
								name="chevron-down"
							/>
						</Popover>
					</div>
				</div>
			</header>
		);
	}
}
