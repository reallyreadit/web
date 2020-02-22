import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	isExtensionInstalled: boolean,
	onOpenMenu: () => void,
	onOpenCreateAccountDialog: (analyticsAction: string) => void,
	onOpenSignInDialog: (analyticsAction: string) => void,
	onViewHome: () => void,
	onViewInbox: () => void,
	user: UserAccount | null
}
export default class extends React.PureComponent<Props> {
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};
	private readonly _openCreateAccountDialog = () => {
		this.props.onOpenCreateAccountDialog('Header');
	};
	private readonly _openSignInDialog = () => {
		this.props.onOpenSignInDialog('Header');
	};
	public render() {
		const
			showAuthButtons = !this.props.user && this.props.isExtensionInstalled,
			showMenu = this.props.user;
		return (
			<header className={
				classNames(
					'header_cvm3v7',
					{ 'menu': showAuthButtons || showMenu }
				)
			}>
				<a
					className="logo-container"
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				>
					<img src="/images/logo.svg" alt="logo" />
				</a>
				{showAuthButtons || showMenu ?
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
						{showAuthButtons ?
							<>
								<Button
									text="Login"
									size="large"
									onClick={this._openSignInDialog}
								/>
								<Button
									text="Sign Up"
									size="large"
									intent="loud"
									onClick={this._openCreateAccountDialog}
								/>
							</> :
							null}
					</div> :
					null}
			</header>
		);
	}
}