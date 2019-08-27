import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';

interface Props {
	isDesktopDevice: boolean,
	isIosDevice: boolean | null,
	isUserSignedIn: boolean,
	onOpenMenu: () => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onViewHome: () => void,
	showNewReplyIndicator: boolean
}
export default class extends React.PureComponent<Props> {
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};
	public render() {
		const
			showAuthButtons = !this.props.isUserSignedIn && this.props.isDesktopDevice,
			showMenu = this.props.isUserSignedIn && this.props.isDesktopDevice;
		return (
			<header className={
				classNames(
					'header_cvm3v7',
					{ 'menu': showMenu }
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
							<div className={classNames('menu-icon-container', { 'indicator': this.props.showNewReplyIndicator })}>
								<Icon
									name="menu2"
									onClick={this.props.onOpenMenu}
								/>
							</div> :
							null}
						{showAuthButtons ?
							<>
								<Button
									text="Login"
									size="large"
									onClick={this.props.onShowSignInDialog}
								/>
								<Button
									text="Sign Up"
									size="large"
									intent="loud"
									onClick={this.props.onShowCreateAccountDialog}
								/>
							</> :
							null}
					</div> :
					null}
			</header>
		);
	}
}