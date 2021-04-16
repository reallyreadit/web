import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import Icon from '../../../../common/components/Icon';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import classNames from 'classnames';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from '../../../../common/components/Button';
import StoreLinks from '../StoreLinks';
import { Screen } from '../Root';

interface Props {
	isClosing: boolean,
	onClose: () => void,
	onClosed: () => void,
	onViewAdminPage: () => void,
	onViewFaq: () => void,
	onViewLeaderboards: () => void,
	onViewProfile: () => void,
	onViewSearch: () => void,
	onViewSettings: () => void,
	onViewStats: () => void,
	selectedScreen: Screen,
	userAccount: UserAccount | null
}
export default class extends React.PureComponent<Props, { isSigningOut: boolean }> {
	private readonly _handleAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'menu_v25ec5-drawer-close') {
			this.props.onClosed();
		}
	};
	private readonly _stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
	private readonly _viewProfile = () => {
		this.props.onViewProfile();
	};
	private _cachedUser: UserAccount | undefined;
	constructor(props: Props) {
		super(props);
		this.state = { isSigningOut: false };
	}
	public render() {
		// cache the user account so that we can animate
		// the menu closing even after the user has signed out
		let user: UserAccount;
		if (this.props.userAccount) {
			user = this.props.userAccount;
			this._cachedUser = this.props.userAccount;
		} else {
			user = this._cachedUser;
		}
		const profileRoute = findRouteByKey(routes, ScreenKey.Profile);
		return (
			<div
				className={classNames('menu_v25ec5', { 'closing': this.props.isClosing })}
				onAnimationEnd={this._handleAnimationEnd}
				onClick={this.props.onClose}
			>
				<div
					className="drawer"
					onClick={this._stopPropagation}
				>
					<div className="header">
						<label>{user.name}</label>
						<Icon
							name="cancel"
							onClick={this.props.onClose}
						/>
					</div>
					<ol>
						{user.role === UserAccountRole.Admin ?
							<li>
								<Button
									href={findRouteByKey(routes, ScreenKey.Admin).createUrl()}
									onClick={this.props.onViewAdminPage}
									state={this.props.selectedScreen.key === ScreenKey.Admin ? 'selected' : 'normal'}
									text="Admin"
									size="x-large"
									display="block"
								/>
							</li> :
							null}
						<li>
							<Button
								badge={user.followerAlertCount}
								href={profileRoute.createUrl({ userName: user.name })}
								onClick={this._viewProfile}
								state={
									(
										this.props.selectedScreen.key === ScreenKey.Profile &&
										profileRoute.getPathParams(this.props.selectedScreen.location.path)['userName'].toLowerCase() === user.name.toLowerCase()
									) ?
										'selected' :
										'normal'
								}
								text="My Profile"
								size="x-large"
								display="block"
							/>
						</li>
						<li>
							<Button
								href={findRouteByKey(routes, ScreenKey.Stats).createUrl()}
								onClick={this.props.onViewStats}
								state={this.props.selectedScreen.key === ScreenKey.Stats ? 'selected' : 'normal'}
								text="My Stats"
								size="x-large"
								display="block"
							/>
						</li>
						<li>
							<Button
								badge="beta"
								href={findRouteByKey(routes, ScreenKey.Search).createUrl()}
								onClick={this.props.onViewSearch}
								state={this.props.selectedScreen.key === ScreenKey.Search ? 'selected' : 'normal'}
								text="Search"
								size="x-large"
								display="block"
							/>
						</li>
						<li>
							<Button
								badge="beta"
								href={findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()}
								onClick={this.props.onViewLeaderboards}
								state={this.props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : 'normal'}
								text="Leaderboards"
								size="x-large"
								display="block"
							/>
						</li>
						<li>
							<Button
								href={findRouteByKey(routes, ScreenKey.Faq).createUrl()}
								onClick={this.props.onViewFaq}
								state={this.props.selectedScreen.key === ScreenKey.Faq ? 'selected' : 'normal'}
								text="Help"
								size="x-large"
								display="block"
							/>
						</li>
						<li>
							<Button
								href={findRouteByKey(routes, ScreenKey.Settings).createUrl()}
								onClick={this.props.onViewSettings}
								state={this.props.selectedScreen.key === ScreenKey.Settings ? 'selected' : 'normal'}
								text="Settings"
								size="x-large"
								display="block"
							/>
						</li>
					</ol>
					<StoreLinks />
				</div>
			</div>
		);
	}
}