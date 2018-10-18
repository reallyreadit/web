import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import Icon from '../../../../common/components/Icon';
import Separator from '../../../../common/components/Separator';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import classNames from 'classnames';
import Spinner from '../../../../common/components/Spinner';
import ScreenKey from '../../../../common/routing/ScreenKey';

interface Props {
	isClosing: boolean,
	onClose: () => void,
	onClosed: () => void,
	onSignOut: () => void,
	onViewAdminPage: () => void,
	onViewInbox: () => void,
	onViewPrivacyPolicy: () => void,
	onViewSettings: () => void,
	selectedScreenKey: ScreenKey,
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
						<Icon
							name="cancel"
							onClick={this.props.onClose}
						/>
					</div>
					<ol>
						{user.role === UserAccountRole.Admin ?
							<li>
								<button
									className={this.props.selectedScreenKey === ScreenKey.AdminPage ? 'selected' : null}
									onClick={this.props.onViewAdminPage}
								>
									Admin
								</button>
							</li> :
							null}
						<li>
							<button
								className={this.props.selectedScreenKey === ScreenKey.Inbox ? 'selected' : null}
								onClick={this.props.onViewInbox}
							>
								Inbox
							</button>
						</li>
						<li>
							<button
								className={this.props.selectedScreenKey === ScreenKey.Settings ? 'selected' : null}
								onClick={this.props.onViewSettings}
							>
								Settings
							</button>
						</li>
						<li>
							<button onClick={this._signOut}>
								<label>Log Out</label>
								{this.state.isSigningOut ?
									<Spinner /> :
									null}
							</button>
						</li>
					</ol>
					<div className="footer">
						<a href="https://blog.reallyread.it">Blog</a>
						<Separator />
						<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
						<Separator />
						<span
							className="link"
							onClick={this._viewPrivacyPolicy}
						>
							Privacy Policy
						</span>
						<br />
						<a href="mailto:support@reallyread.it">support@reallyread.it</a>
					</div>
				</div>
			</div>
		);
	}
}