import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import UserAccount from '../../../../common/models/UserAccount';
import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';

interface Props {
	deviceType: DeviceType,
	onBeginOnboarding: (analyticsAction: string) => void,
	onOpenMenu: () => void,
	onOpenSignInPrompt: (analyticsAction: string) => void,
	onViewHome: () => void,
	onViewNotifications: () => void,
	user: UserAccount | null
}
export default class extends React.PureComponent<Props> {
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
	public render() {
		const
			showLoginButtons = (
				!this.props.user &&
				!isMobileDevice(this.props.deviceType)
			),
			showMenu = !!this.props.user;
		return (
			<header className={
				classNames(
					'header_cvm3v7',
					{ 'menu': showLoginButtons || showMenu }
				)
			}>
				<a
					className="logo"
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				>
				</a>
				{showLoginButtons || showMenu ?
					<div className="menu-container">
						{showMenu ?
							<>
								<Icon
									badge={this.props.user.replyAlertCount}
									name="bell"
									onClick={this.props.onViewNotifications}
								/>
								<Icon
									badge={this.props.user.followerAlertCount}
									name="menu2"
									onClick={this.props.onOpenMenu}
								/>
							</> :
							null}
						{showLoginButtons ?
							<>
								<Button
									text="Log In"
									size="large"
									onClick={this._openSignInPrompt}
								/>
								<Button
									intent="loud"
									text="Get Started"
									size="large"
									onClick={this._beginOnboarding}
								/>
							</> :
							null}
					</div> :
					null}
			</header>
		);
	}
}