import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
import SignInForm from './AppAuthScreen/SignInForm';
import AppScreenButton from '../controls/AppScreenButton';
import UserAccount from '../../../../common/models/UserAccount';
import AppScreen from './AppScreen';
import CreateAccountScreen from './CreateAccountScreen';
import Captcha from '../../Captcha';
import { Intent } from '../../Page';

export default class extends React.PureComponent<{
	captcha: Captcha,
	createAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<UserAccount>,
	onCreateAccount: (userAccount: UserAccount) => void,
	onSignIn: (userAccount: UserAccount) => void,
	setTitle: (title: string) => void,
	showToast: (text: string, intent: Intent) => void,
	signIn: (email: string, password: string) => Promise<UserAccount>
}, {
	showCreateAccountScreen: boolean
}> {
	public state = {
		showCreateAccountScreen: false
	};
	private readonly _showCreateAccountScreen = () => {
		this.setState({ showCreateAccountScreen: true });
	};
	public componentWillMount() {
		this.props.setTitle('Log In');
	}
	public render() {
		return (
			<AppScreen className="app-auth-screen">
				<div className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></div>
				<strong>Already have an account?</strong>
				<SignInForm
					onSignIn={this.props.onSignIn}
					signIn={this.props.signIn}
				/>
				<div className="break">
					<span>or</span>
				</div>
				<AppScreenButton
					onClick={this._showCreateAccountScreen}
					style="loud"
					text="Sign Up"
				/>
				{this.state.showCreateAccountScreen ?
					<CreateAccountScreen
						captcha={this.props.captcha}
						createAccount={this.props.createAccount}
						onCreateAccount={this.props.onCreateAccount}
						showToast={this.props.showToast}
					/> :
					null}
			</AppScreen>
		);
	}
}