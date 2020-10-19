import * as React from 'react';
import EmailAddressField from '../controls/authentication/EmailAddressField';
import PasswordField from '../controls/authentication/PasswordField';
import AppleIdButton from '../AppleIdButton';
import Button from '../Button';
import ActionLink from '../ActionLink';
import SignInForm from '../../models/userAccounts/SignInForm';
import FormPartition from '../controls/FormPartition';
import TwitterAuthButton from '../TwitterAuthButton';

export type Form = Pick<SignInForm, 'authServiceToken' | 'email' | 'password'> & { analyticsAction: string };
interface Props {
	analyticsAction: string,
	authServiceToken?: string,
	imageBasePath: string,
	onCreateAccount?: () => void,
	onRequestPasswordReset: (authServiceToken?: string) => void,
	onSignIn: (form: Form) => Promise<void>,
	onSignInWithApple?: (analyticsAction: string) => void,
	onSignInWithTwitter?: (analyticsAction: string) => Promise<{}>
}
enum GlobalError {
	Unknown,
	AuthenticationExpired,
	InvalidSessionId
}
interface State {
	email: string,
	emailError: string | null,
	globalError: GlobalError | null,
	isSubmitting: boolean,
	password: string,
	passwordError: string | null,
	showErrors: boolean
}
export default class SignInStep extends React.PureComponent<Props, State> {
	private readonly _changeEmail = (email: string, emailError?: string) => {
		this.setState({
			email,
			emailError
		});
	};
	private readonly _changePassword = (password: string, passwordError?: string) => {
		this.setState({
			password,
			passwordError
		});
	};
	private readonly _requestPasswordReset = () => {
		this.props.onRequestPasswordReset(this.props.authServiceToken);
	};
	private readonly _signIn = () => {
		if (this.state.isSubmitting) {
			return;
		}
		this.setState({
			showErrors: true
		});
		if (
			this.state.emailError ||
			this.state.passwordError
		) {
			return;
		}
		this.setState(
			{
				globalError: null,
				isSubmitting: true
			},
			() => {
				this.props
					.onSignIn({
						authServiceToken: this.props.authServiceToken,
						email: this.state.email,
						password: this.state.password,
						analyticsAction: this.props.analyticsAction
					})
					.catch(
						(errors?: string[]) => {
							let nextState = {
								emailError: null as string,
								globalError: null as GlobalError,
								isSubmitting: false,
								passwordError: null as string
							};
							if (Array.isArray(errors)) {
								if (errors.includes('UserAccountNotFound')) {
									nextState.emailError = 'User account not found.';
								}
								if (errors.includes('IncorrectPassword')) {
									nextState.passwordError = 'Incorrect password.';
								}
								if (errors.includes('AuthenticationExpired')) {
									nextState.globalError = GlobalError.AuthenticationExpired;
								}
								if (errors.includes('InvalidSessionId')) {
									nextState.globalError = GlobalError.InvalidSessionId;
								}
							} else {
								nextState.globalError = GlobalError.Unknown;
							}
							this.setState(nextState);
						}
					);
			}
		);
	};
	private readonly _signInWithApple = () => {
		this.props.onSignInWithApple(this.props.analyticsAction);
	};
	private readonly _signInWithTwitter = () => {
		return this.props.onSignInWithTwitter(this.props.analyticsAction);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			emailError: null,
			globalError: null,
			isSubmitting: false,
			password: '',
			passwordError: null,
			showErrors: false
		};
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.AuthenticationExpired:
				globalError = 'Authentication expired. Please sign in again.';
				break;
			case GlobalError.InvalidSessionId:
				globalError = 'Invalid session id.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		return (
			<div className="sign-in-step_cg2uy5">
				<h1>
					{this.props.authServiceToken ?
						'Link Existing Account' :
						'Log In'}
				</h1>
				<EmailAddressField
					autoFocus
					error={this.state.emailError}
					onChange={this._changeEmail}
					onEnterKeyPressed={this._signIn}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					error={this.state.passwordError}
					onChange={this._changePassword}
					onEnterKeyPressed={this._signIn}
					showError={this.state.showErrors}
					value={this.state.password}
				/>
				{globalError ?
					<div className="global-error">{globalError}</div> :
					null}
				<Button
					align="center"
					display="block"
					intent="loud"
					onClick={this._signIn}
					size="large"
					state={
						this.state.isSubmitting ?
							'busy' :
							'normal'
					}
					text={
						this.props.authServiceToken ?
							'Link Account' :
							'Log In'
					}
				/>
				{this.props.onSignInWithApple || this.props.onSignInWithTwitter ?
					<FormPartition /> :
					null}
				{this.props.onSignInWithApple ?
					<AppleIdButton onClick={this._signInWithApple} /> :
					null}
				{this.props.onSignInWithTwitter ?
					<TwitterAuthButton
						imageBasePath={this.props.imageBasePath}
						onClick={this._signInWithTwitter}
					/> :
					null}
				<ActionLink
					onClick={this._requestPasswordReset}
					state={
						this.state.isSubmitting ?
							'disabled' :
							'normal'
					}
					text="Forgot your password?"
				/>
				{this.props.onCreateAccount ?
					<>
						<br />
						<ActionLink
							onClick={this.props.onCreateAccount}
							state={
								this.state.isSubmitting ?
									'disabled' :
									'normal'
							}
							text="Create an Account"
						/>
					</> :
					null}
			</div>
		);
	}
}