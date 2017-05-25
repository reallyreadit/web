import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Button from './Button';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import ActionLink from '../../../common/components/ActionLink';
import Separator from './Separator';
import * as className from 'classnames';

export default class AccountManager extends PureContextComponent<{}, { isSigningOut: boolean }> {
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
		const buttonState = this.state.isSigningOut ? 'disabled' : 'normal';
		const newReplyNotification = this.context.page.newReplyNotification;
		return (
			this.context.user.isSignedIn ? 
				<div className="account-manager">
					<div className={className('user-name', { 'signing-out': this.state.isSigningOut })}>
						<div>
							<span>{this.state.isSigningOut ? 'Later' : 'Sup'}, <strong>{this.context.user.userAccount.name}</strong></span>
							<Separator />
							<ActionLink text="Sign Out" iconLeft="switch" onClick={this._signOut} state={this.state.isSigningOut ? 'busy' : 'normal'} />
						</div>
					</div>
					<div className="buttons">
						<Button
							text="Inbox"
							iconLeft="envelope"
							onClick={this._goToInbox}
							state={buttonState}
							showIndicator={newReplyNotification.lastReply > newReplyNotification.lastNewReplyAck} />
						<Button text="Reading List" iconLeft="book" onClick={this._goToReadingList} state={buttonState} />
						<Button text="Settings" iconLeft="cog" onClick={this._goToSettings} state={buttonState} />
					</div>
				</div> :
				<div className="account-manager">
					<div className="buttons">
						<Button text="Sign In" iconLeft="user" onClick={this._showSignInDialog} />
						<Button text="Create Account" iconLeft="plus" onClick={this._showCreateAccountDialog} style="preferred" />
					</div>
				</div>
		);
	}
}