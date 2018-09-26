import * as React from 'react';
import BrowserHeader from './BrowserRoot/BrowserHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import BrowserNav from './BrowserRoot/BrowserNav';
import Root, { Props as RootProps } from './Root';
import LocalStorageApi from '../LocalStorageApi';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import UserAccount from '../../../common/models/UserAccount';

interface Props {
	localStorage: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null
}
export default class extends Root<
	Props,
	{ showNewReplyIndicator: boolean }
> {
	private readonly _showCreateAccountDialog = () => {

	};
	private readonly _showSignInDialog = () => {

	};
	constructor(props: Props & RootProps) {
		super(props);
		this.state = {
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification),
			screens: [this.createScreen(props.path)],
			toasts: [],
			user: props.user
		};
		props.localStorage.addListener('user', user => {
			this.setState({ user });
		});
	}
	private handleUserChange(userAccount: UserAccount) {
		this.setState({ user: userAccount });
		this.props.localStorage.updateUser(userAccount);
	}
	protected createAccount(name: string, email: string, password: string, captchaResponse: string) {
		return super
			.createAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signIn(email: string, password: string) {
		return super
			.signIn(email, password)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signOut() {
		return super
			.signOut()
			.then(() => {
				this.handleUserChange(null);
			});
	}
	public render() {
		return (
			<div className="browser-root">
				<EmailConfirmationBar
					onResendConfirmationEmail={this._resendConfirmationEmail}
					user={this.state.user}
				/>
				<BrowserHeader
					onShowCreateAccountDialog={this._showCreateAccountDialog}
					onShowSignInDialog={this._showSignInDialog}
					onSignOut={this._signOut}
					onViewAdminPage={this._viewAdminPage}
					onViewInbox={this._viewInbox}
					onViewSettings={this._viewSettings}
					showNewReplyIndicator={this.state.showNewReplyIndicator}
					user={this.state.user}
				/>
				<main>
					<BrowserNav
						items={this.getNavItems()}
					/>
					<div className="screen">
						{this.state.screens[0].render()}
					</div>
				</main>
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}