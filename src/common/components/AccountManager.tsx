import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Button from './Button';
import CreateAccountDialog from './CreateAccountDialog';

export default class AccountManager extends ContextComponent<{}, { isLoading: boolean }> {
	private showCreateAccountDialog = () => this.context.dialog.show(React.createElement(CreateAccountDialog));
	private signOut = () => {
		this.setState({ isLoading: true });
		this.context.api.signOut().then(() => {
			this.setState({ isLoading: false });
			this.context.user.signOut();
		});
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { isLoading: false };
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
		return (
			currentUser !== undefined ? 
				<div className="account-manager">
					<strong>{currentUser.name}</strong>
					<Button style="preferred">My Account</Button>
					<Button onClick={this.signOut}>Sign Out</Button>
				</div> :
				<div className="account-manager">
					<Button>Sign In</Button>
					<Button onClick={this.showCreateAccountDialog} style="preferred">Create Account</Button>
				</div>
		);
	}
}