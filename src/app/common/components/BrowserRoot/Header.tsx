import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
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
			<header className="header_cvm3v7">
				<a
					className="logo-container"
					dangerouslySetInnerHTML={{ __html: logoText }}
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				></a>
				<div className="menu-container">
					{this.props.isUserSignedIn ?
						<div className={classNames('menu-icon-container', { 'indicator': this.props.showNewReplyIndicator })}>
							<Icon
								name="three-bars"
								onClick={this.props.onOpenMenu}
							/>
						</div> :
						<>
							<button onClick={this.props.onShowSignInDialog}>
								Log In
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