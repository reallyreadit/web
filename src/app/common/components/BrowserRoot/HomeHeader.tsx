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
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import {
	NavOptions,
	NavReference,
	Screen,
} from '../../../common/components/Root';
import Link from '../../../../common/components/Link';
import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import UserAccount from '../../../../common/models/UserAccount';
import GetStartedButton from './GetStartedButton';

interface Props {
	currentScreen: Screen;
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
	user: UserAccount | null;
}

type State = {
	menuOpen: boolean;
};

const analyticsAction = 'Header';

export default class HomeHeader extends React.PureComponent<Props, State> {
	state: State = {
		menuOpen: false,
	};

	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		this.props.onViewHome();
	};

	private _toggleMenu() {
		this.setState((prevState) => ({ menuOpen: !prevState.menuOpen }));
	}

	private readonly _openSignInPrompt = () => {
		this.props.onOpenSignInPrompt(analyticsAction);
	};

	// capture the page navigation and close the mobile menu
	private pageNavigation(
		navFunction: (e: React.MouseEvent) => void,
		event?: React.MouseEvent
	) {
		// prevent default navigation synchronously
		event?.preventDefault();
		this.setState({ menuOpen: false }, () => {
			// perform navigation asynchrounsly
			navFunction(event);
		});
	}

	constructor(props: Props) {
		super(props);
	}

	public render() {
		const menuLinks = [
			// TODO: this causes the app to crash due to this.state.blogPosts.value is undefined
			// maybe the URL format is unexpected?
			// {
			// 	screenKey: ScreenKey.Home,
			// 	linkText: 'How it works',
			// 	navFunction: () => { window.location.href = "/#how-it-works" }
			// },
			{
				screenKey: ScreenKey.About,
				linkText: 'About',
			},
			{
				screenKey: ScreenKey.Faq,
				linkText: 'FAQ',
			},
		];

		return (
			<header className="home-header_2afwll responsive">
				<div className="menu-controls-container">
					<a
						className="logo"
						href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
						onClick={(event) =>
							this.pageNavigation(this._handleLogoClick, event)
						}
					></a>
					<Icon
						className="mobile-menu-toggle"
						name={this.state.menuOpen ? 'cross' : 'menu'}
						onClick={this._toggleMenu.bind(this)}
					/>
				</div>
				<div
					className={classNames('menu-container', {
						open: this.state.menuOpen,
					})}
				>
					<>
						{menuLinks.map((link) => (
							<Link
								key={link.linkText}
								screen={link.screenKey}
								className={
									(this.props.currentScreen && this.props.currentScreen.key) ===
									link.screenKey
										? 'active'
										: ''
								}
								onClick={(navRef: NavReference) =>
									this.pageNavigation(this.props.onNavTo.bind(this, navRef))
								}
							>
								{link.linkText}
							</Link>
						))}
						<Link
							href="https://github.com/reallyreadit"
							onClick={this.props.onNavTo}
						>
							<Icon name="github"></Icon>
						</Link>
						{!isMobileDevice(this.props.deviceType) ? (
							<Button
								text="Log In"
								size="large"
								onClick={this.pageNavigation.bind(this, this._openSignInPrompt)}
							/>
						) : null}
						{this.props.deviceType !== DeviceType.Android ? (
							<GetStartedButton
								analyticsAction={analyticsAction}
								deviceType={this.props.deviceType}
								iosPromptType="download"
								location={this.props.currentScreen.location}
								onBeginOnboarding={(analyticsAction: string) =>
									this.pageNavigation(() =>
										this.props.onBeginOnboarding(analyticsAction)
									)
								}
								onCopyAppReferrerTextToClipboard={
									this.props.onCopyAppReferrerTextToClipboard
								}
								onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
								onOpenNewPlatformNotificationRequestDialog={
									this.props.onOpenNewPlatformNotificationRequestDialog
								}
								size="large"
							/>
						) : null}
						{/* TODO PROXY EXT */}
						{/* <Button
							text="Download App"
							size="large"
							intent="loud"
							onClick={(ev) => this.pageNavigation(() => this.props.onNavTo({ key: ScreenKey.Download }, { method: NavMethod.ReplaceAll }), ev)}
						/> */}
					</>
				</div>
			</header>
		);
	}
}
