import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import Button from './Button';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';

export default class AccountManager extends PureContextComponent<{}, { isSigningOut: boolean }> {
	private showSignInDialog = () => this.context.dialog.show(React.createElement(SignInDialog));
	private showCreateAccountDialog = () => this.context.dialog.show(React.createElement(CreateAccountDialog));
	private goToInbox = () => this.context.router.push('/inbox');
	private goToReadingList = () => this.context.router.push('/list');
	private goToSettings = () => this.context.router.push('/settings');
	private signOut = () => {
		this.setState({ isSigningOut: true });
		this.context.api.signOut().then(() => {
			this.setState({ isSigningOut: false });
			this.context.user.signOut();
		});
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { isSigningOut: false };
		context.user
			.addListener('signIn', this.forceUpdate)
			.addListener('signOut', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this.forceUpdate)
			.removeListener('signOut', this.forceUpdate);
	}
	public render() {
		const currentUser = this.context.user.getUserAccount();
		const buttonState = this.state.isSigningOut ? 'disabled' : 'normal';
		return (
			currentUser !== undefined ? 
				<div className="account-manager">
					<div className="user-name">
						<div>
							<span>Sup, <strong>{currentUser.name}</strong></span>
							<svg title="Sign Out" className="icon" onClick={this.signOut}><use xlinkHref="#icon-in-alt"></use></svg>
						</div>
					</div>
					<div className="buttons">
						<Button text="Inbox" iconLeft="envelope" onClick={this.goToInbox} state={buttonState} />
						<Button text="Reading List" iconLeft="book" onClick={this.goToReadingList} state={buttonState} />
						<Button text="Settings" iconLeft="cog" onClick={this.goToSettings} state={buttonState} />
					</div>
				</div> :
				<div className="account-manager">
					<div className="buttons">
						<Button text="Sign In" iconLeft="user" onClick={this.showSignInDialog} />
						<Button text="Create Account" iconLeft="plus" onClick={this.showCreateAccountDialog} style="preferred" />
					</div>
				</div>
		);
	}
}