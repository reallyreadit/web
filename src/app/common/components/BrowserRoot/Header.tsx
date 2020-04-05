import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import UserAccount from '../../../../common/models/UserAccount';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	deviceType: DeviceType,
	onOpenMenu: () => void,
	onOpenSignInPrompt: (analyticsAction: string) => void,
	onViewHome: () => void,
	onViewInbox: () => void,
	user: UserAccount | null
}
export default class extends React.PureComponent<Props> {
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};
	private readonly _openSignInPrompt = () => {
		this.props.onOpenSignInPrompt('Header');
	};
	public render() {
		const
			showLoginButton = (
				!this.props.user &&
				this.props.deviceType !== DeviceType.Android &&
				this.props.deviceType !== DeviceType.Ios
			),
			showMenu = !!this.props.user;
		return (
			<header className={
				classNames(
					'header_cvm3v7',
					{ 'menu': showLoginButton || showMenu }
				)
			}>
				<a
					className="logo-container"
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				>
					<img src="/images/logo.svg" alt="logo" />
				</a>
				{showLoginButton || showMenu ?
					<div className="menu-container">
						{showMenu ?
							<>
								<Icon
									badge={this.props.user.replyAlertCount + this.props.user.loopbackAlertCount}
									name="bell"
									onClick={this.props.onViewInbox}
								/>
								<Icon
									name="menu2"
									onClick={this.props.onOpenMenu}
								/>
							</> :
							null}
						{showLoginButton ?
							<>
								<Button
									text="Log In"
									size="large"
									onClick={this._openSignInPrompt}
								/>
							</> :
							null}
					</div> :
					null}
			</header>
		);
	}
}