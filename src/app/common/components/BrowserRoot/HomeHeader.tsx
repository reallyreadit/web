import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import UserAccount from '../../../../common/models/UserAccount';
import { Screen }  from '../../../common/components/Root'
// import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	currentScreen: Screen,
	deviceType: DeviceType,
	onBeginOnboarding: (analyticsAction: string) => void,
	onOpenMenu: () => void,
	onOpenSignInPrompt: (analyticsAction: string) => void,
	onViewFaq: () => void,
	onViewHome: () => void,
	onViewMission: () => void,
	onViewNotifications: () => void,
	user: UserAccount | null,
}

type State = {
	menuOpen: boolean
}

export default class HomeHeader extends React.PureComponent<Props, State> {
	state: State = {
		menuOpen: false,
	}

	private readonly _beginOnboarding = () => {
		this.props.onBeginOnboarding('Header');
	};
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
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
		// prevent default navigation synchronously
		event?.preventDefault();
		this.setState({menuOpen: false}, () => {
			// perform navigation asynchrounsly
			navFunction(event);
		});
	};

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
					{ 'responsive': !this.props.user }
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
					<div className={
						classNames(
							"menu-container",
							{ open: this.state.menuOpen }
						)}>
					{this.props.user ?
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
							<>
								{menuLinks.map(link =>
									<a
										key={link.linkText}
										className={(this.props.currentScreen && this.props.currentScreen.key) === link.screenKey ? 'active' : ''}
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
						</>}
				</div>
			</header>
		);
	}
}