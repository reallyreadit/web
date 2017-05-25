import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import AccountManager from '../../../common/components/AccountManager';

export default class AppAccountManager extends PureContextComponent<{}, { isSigningOut: boolean }> {
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	private _goToInbox = () => this.context.router.push('/inbox');
	private _goToReadingList = () => this.context.router.push('/list');
	private _goToSettings = () => this.context.router.push('/settings');
	private _signOut = () => {
		this.setState({ isSigningOut: true });
		this.context.api.signOut().then(() => {
			this.setState({ isSigningOut: false });
			this.context.user.signOut();
		});
	};
	public state = { isSigningOut: false };
	public componentDidMount() {
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.page.addListener('newReplyNotificationChange', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.page.removeListener('newReplyNotificationChange', this._forceUpdate);
	}
	public render() {
		const newReplyNotification = this.context.page.newReplyNotification;
		return (
			<AccountManager
				userName={this.context.user.isSignedIn ? this.context.user.userAccount.name : null}
				showNewReplyIndicator={newReplyNotification.lastReply > newReplyNotification.lastNewReplyAck}
				isSigningOut={this.state.isSigningOut}
				onSignIn={this._showSignInDialog}
				onSignOut={this._signOut}
				onCreateAccount={this._showCreateAccountDialog}
				onGoToInbox={this._goToInbox}
				onGoToReadingList={this._goToReadingList}
				onGoToSettings={this._goToSettings}
				/>
		);
	}
}