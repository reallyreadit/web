import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
import SignInForm from './AppAuthScreen/SignInForm';
import Context, { contextTypes } from '../../Context';
import MobileButton from './AppAuthScreen/MobileButton';
import UserAccount from '../../../../common/models/UserAccount';

export default class extends React.Component<{
	onSignIn: (userAccount: UserAccount) => void,
	signIn: (email: string, password: string) => Promise<UserAccount>
}> {
	public static contextTypes = contextTypes;
	private readonly _showSignUpForm = () => {

	};
	public context: Context;
	public componentWillMount() {
		this.context.page.setTitle('Log In');
	}
	public render() {
		return (
			<div className="app-auth-screen">
				<div className="content">
					<div className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></div>
					<strong>Already have an account?</strong>
					<SignInForm
						onSignIn={this.props.onSignIn}
						signIn={this.props.signIn}
					/>
					<div className="break">
						<span>or</span>
					</div>
					<MobileButton
						onClick={this._showSignUpForm}
						style="loud"
						text="Sign Up"
					/>
				</div>
			</div>
		);
	}
}