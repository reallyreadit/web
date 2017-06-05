import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import NavBar from '../../../common/components/NavBar';
import ActionLink from '../../../common/components/ActionLink';
import Separator from '../../../common/components/Separator';
import * as className from 'classnames';
import { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';

export default class AccountManager extends PureContextComponent<{}, { isSigningOut: boolean }> {
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	private _goToInbox = () => {
		if (hasNewUnreadReply(this.context.page.newReplyNotification)) {
			this.context.api.ackNewReply();
		}
		this.context.router.push('/inbox')
	};
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
		return (
			<div className="account-manager">
				{this.context.user.isSignedIn ?
					<div className={className('user-name', { 'signing-out': this.state.isSigningOut })}>
						<span>{this.state.isSigningOut ? 'Later' : 'Sup'}, <strong>{this.context.user.userAccount.name}</strong></span>
						<Separator />
						<ActionLink text="Sign Out" iconLeft="switch" onClick={this._signOut} state={this.state.isSigningOut ? 'busy' : 'normal'} />
					</div> :
					null}
				<NavBar
					isSignedIn={this.context.user.isSignedIn}
					showNewReplyIndicator={hasNewUnreadReply(this.context.page.newReplyNotification)}
					state={this.state.isSigningOut ? 'disabled' : 'normal'}
					onSignIn={this._showSignInDialog}
					onCreateAccount={this._showCreateAccountDialog}
					onGoToInbox={this._goToInbox}
					onGoToReadingList={this._goToReadingList}
					onGoToSettings={this._goToSettings}
					/>
			</div>
		);
	}
}