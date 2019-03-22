import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';

interface Props {
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
		return (
			<header className={classNames('header_cvm3v7', { authenticated: this.props.isUserSignedIn })}>
				<a
					className="logo-container"
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				>
					<img src="/images/logo.svg" alt="logo" />
				</a>
				<div className="menu-container">
					{this.props.isUserSignedIn ?
						<div className={classNames('menu-icon-container', { 'indicator': this.props.showNewReplyIndicator })}>
							<Icon
								name="user"
								onClick={this.props.onOpenMenu}
							/>
						</div> :
						<>
							<button onClick={this.props.onShowSignInDialog}>
								Login
							</button>
							<button
								className="loud"
								onClick={this.props.onShowCreateAccountDialog}
							>
								Sign Up
							</button>
						</>}
				</div>
			</header>
		);
	}
}