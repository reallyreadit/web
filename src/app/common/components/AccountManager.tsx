import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
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
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { isSigningOut: false };
	}
	public componentWillMount() {
		this.context.user
			.addListener('signIn', this._forceUpdate)
			.addListener('signOut', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this._forceUpdate)
			.removeListener('signOut', this._forceUpdate);
	}
	public render() {
		const currentUser = this.context.user.getUserAccount();
		const buttonState = this.state.isSigningOut ? 'disabled' : 'normal';
		return (
			currentUser ? 
				<div className="account-manager">
					<div className={className('user-name', { 'signing-out': this.state.isSigningOut })}>
						<div>
							<span>{this.state.isSigningOut ? 'Later' : 'Sup'}, <strong>{currentUser.name}</strong></span>
							<Separator />
							<ActionLink text="Sign Out" iconLeft="switch" onClick={this._signOut} state={this.state.isSigningOut ? 'busy' : 'normal'} />
						</div>
					</div>
					<div className="buttons">
						<Button text="Inbox" iconLeft="envelope" onClick={this._goToInbox} state={buttonState} />
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