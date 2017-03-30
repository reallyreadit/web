import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import Button from './Button';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import { Link } from 'react-router';

export default class AccountManager extends PureContextComponent<{}, { isLoading: boolean }> {
	private showSignInDialog = () => this.context.dialog.show(React.createElement(SignInDialog));
	private showCreateAccountDialog = () => this.context.dialog.show(React.createElement(CreateAccountDialog));
	private goToMyAccount = () => this.context.router.push('/account');
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
					<div className="user-details">
						<Link to="/inbox">
							<svg className="icon"><use xlinkHref="#icon-mail"></use></svg>
						</Link>	
						<strong>{currentUser.name}</strong>
					</div>
					<Button onClick={this.goToMyAccount} style="preferred" state={this.state.isLoading ? 'disabled' : 'normal'}>My Account</Button>
					<Button onClick={this.signOut} state={this.state.isLoading ? 'busy' : 'normal'}>Sign Out</Button>
				</div> :
				<div className="account-manager">
					<Button onClick={this.showSignInDialog}>Sign In</Button>
					<Button onClick={this.showCreateAccountDialog} style="preferred">Create Account</Button>
				</div>
		);
	}
}