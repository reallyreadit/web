import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	onOpenMenu: () => void,
	onViewHome: () => void,
	onViewInbox: () => void,
	user: UserAccount | null
}
export default class extends React.PureComponent<Props> {
	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onViewHome();
	};
	public render() {
		return (
			<header className={
				classNames(
					'header_cvm3v7',
					{ 'menu': !!this.props.user }
				)
			}>
				<a
					className="logo-container"
					href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
					onClick={this._handleLogoClick}
				>
					<img src="/images/logo.svg" alt="logo" />
				</a>
				{this.props.user ?
					<div className="menu-container">
						<Icon
							badge={this.props.user.replyAlertCount + this.props.user.loopbackAlertCount}
							name="bell"
							onClick={this.props.onViewInbox}
						/>
						<Icon
							name="menu2"
							onClick={this.props.onOpenMenu}
						/>
					</div> :
					null}
			</header>
		);
	}
}