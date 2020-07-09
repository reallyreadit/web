import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import Icon from '../../../../common/components/Icon';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import classNames from 'classnames';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from '../../../../common/components/Button';
import { Screen } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';

interface Props {
	isClosing: boolean,
	onClose: () => void,
	onClosed: () => void,
	onSignOut: () => void,
	onViewAdminPage: () => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: () => void,
	onViewSettings: () => void,
	onViewStats: () => void,
	selectedScreen: Screen,
	userAccount: UserAccount | null
}
export default class extends React.PureComponent<Props, { isSigningOut: boolean }> {
	private readonly _handleAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'menu_fk9ujy-drawer-close') {
			this.props.onClosed();
		}
	};
	private readonly _signOut = () => {
		this.setState({ isSigningOut: true });
		this.props.onSignOut();
	};
	private readonly _stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
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
		return (
			<div
				className={classNames('menu_fk9ujy', { 'closing': this.props.isClosing })}
				onAnimationEnd={this._handleAnimationEnd}
				onClick={this.props.onClose}
			>
				<div
					className="drawer"
					onClick={this._stopPropagation}
				>
					<div className="header">
						<label>{user.name}</label>
						<div
							className="close-button"
							onClick={this.props.onClose}
						>
							<Icon name="cancel" />
						</div>
					</div>
					<ol>
						{user.role === UserAccountRole.Admin ?
							<li>
								<Button
									state={this.props.selectedScreen.key === ScreenKey.Admin ? 'selected' : 'normal'}
									onClick={this.props.onViewAdminPage}
									text="Admin"
									size="large"
									display="block"
								/>
							</li> :
							null}
						<li>
							<Button
								badge={this.props.userAccount.followerAlertCount}
								state={
									(
										this.props.selectedScreen.key === ScreenKey.Profile &&
										findRouteByKey(routes, ScreenKey.Profile).getPathParams(this.props.selectedScreen.location.path)['userName'].toLowerCase() === this.props.userAccount.name.toLowerCase()
									) ?
										'selected' :
										'normal'
								}
								onClick={this._viewProfile}
								text="Profile"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Stats ? 'selected' : 'normal'}
								onClick={this.props.onViewStats}
								text="Stats"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Settings ? 'selected' : 'normal'}
								onClick={this.props.onViewSettings}
								text="Settings"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.state.isSigningOut ? 'busy' : 'normal'}
								onClick={this._signOut}
								text="Log Out"
								size="large"
								display="block"
							/>
						</li>
					</ol>
					<div className="footer">
						Need help? Got feedback?<br />
						<strong>Send us an email!</strong><br />
						<a href="mailto:support@readup.com">support@readup.com</a>
						<a
							href="#"
							onClick={this._viewPrivacyPolicy}
						>
							Terms of Service
						</a>
					</div>
				</div>
			</div>
		);
	}
}