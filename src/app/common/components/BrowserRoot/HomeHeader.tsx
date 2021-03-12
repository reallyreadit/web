import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey, findRouteByLocation } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import UserAccount from '../../../../common/models/UserAccount';
// import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	deviceType: DeviceType,
	onBeginOnboarding: (analyticsAction: string) => void,
	onOpenMenu: () => void,
	onOpenSignInPrompt: (analyticsAction: string) => void,
	onViewFaq: () => void,
	onViewMission: () => void,
	onViewHome: () => void,
	onViewNotifications: () => void,
	user: UserAccount | null
}

type State = {
	menuOpen: boolean
	activeScreen: ScreenKey | undefined
}

export default class extends React.PureComponent<Props, State> {
	state: State = {
		menuOpen: false,
		// TODO: probably not the correct way. Also: doesn't work due to server/client mismatch error.
		activeScreen: findRouteByLocation<any, ScreenKey>(routes, { path: typeof window != 'undefined' && window.location.pathname})?.screenKey
	}

	private readonly _beginOnboarding = () => {
		this.props.onBeginOnboarding('Header');
	};
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};
	private readonly _openSignInPrompt = () => {
		this.props.onOpenSignInPrompt('Header');
	};

	private _toggleMenu() {
		this.setState((prevState) => ({menuOpen: !prevState.menuOpen}));
	};

	// capture the page navigation and close the mobile menu
	private pageNavigation(navFunction: (e: React.MouseEvent) => void, event?: React.MouseEvent) {
		this.setState({menuOpen: false}, () => {
			navFunction(event);
		});
	};

	constructor(props: Props) {
		super(props);
	}

	public render() {

		const
			showLoginButtons = (
				!this.props.user
				// removed these because we always want login buttons (= home menu too),
				// even on mobile on the marketing site.
				// TODO: maybe this file should replace Header.tsx at some point
				// &&
				// !isMobileDevice(this.props.deviceType)
			),
			showMenu = !!this.props.user;

		const menuLinks = [
				{
					screenKey: ScreenKey.Faq,
					linkText: 'How it works',
					navFunction: this.props.onViewFaq
				},
				{
					screenKey: ScreenKey.Mission,
					linkText: 'Our Mission',
					navFunction: this.props.onViewMission
				},
				{
					screenKey: ScreenKey.Faq,
					linkText: 'FAQ',
					navFunction: this.props.onViewFaq
				}
			];

		return (
			<header className={
				classNames(
					'home-header_2afwll',
					{ 'menu': showLoginButtons || showMenu }
				)
			}>
				<div className="menu-controls-container">
					<a
						className="logo"
						href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
						onClick={(event) => this.pageNavigation(this._handleLogoClick, event)}
					>
					</a>
					<Icon
						className="mobile-menu-toggle"
						name={ this.state.menuOpen ? "cross" : "menu" }
						onClick={this._toggleMenu.bind(this)}
					/>
				</div>
				{showLoginButtons || showMenu ?
					<div className={
						classNames(
							"menu-container",
							{ open: this.state.menuOpen }
						)}>
						{showMenu ?
						// TODO: these are not used here now, legacy from the Header.tsx copy
							<>
								<Icon
									badge={this.props.user.replyAlertCount + this.props.user.postAlertCount + this.props.user.loopbackAlertCount}
									name="bell"
									onClick={this.props.onViewNotifications}
								/>
								<Icon
									badge={this.props.user.followerAlertCount}
									name="user"
									onClick={this.props.onOpenMenu}
								/>
							</> :
							null}
						{showLoginButtons ?
							<>
								{menuLinks.map(link =>
									<a
										key={link.linkText}
										className={this.state.activeScreen === link.screenKey ? 'active' : ''}
										onClick={this.pageNavigation.bind(this, link.navFunction)}
									>{link.linkText}</a>)
								}
								<Button
									text="Log In"
									size="large"
									onClick={this.pageNavigation.bind(this, this._openSignInPrompt)}
								/>
								<Button
									intent="loud"
									text="Get Started"
									size="large"
									onClick={this.pageNavigation.bind(this, this._beginOnboarding)}
								/>
							</> :
							null}
					</div> :
					null}
			</header>
		);
	}
}