import * as React from 'react';
import Captcha from '../../../Captcha';
import UserAccountForm from '../../../../../common/models/userAccounts/UserAccountForm';
import UsernameField from '../../controls/authentication/UsernameField';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import PasswordField from '../../controls/authentication/PasswordField';
import AppleIdButton from '../../../../../common/components/AppleIdButton';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';
import FormPartition from '../../controls/FormPartition';

export type Form = Pick<UserAccountForm, 'name' | 'email' | 'password' | 'captchaResponse'> & { analyticsAction: string }
interface Props {
	analyticsAction: string,
	captcha: Captcha,
	onCreateAccount: (form: Form) => Promise<void>,
	onSignIn: () => void,
	onSignInWithApple: (analyticsAction: string) => void,
}
enum GlobalError {
	Unknown,
	InvalidCaptcha
}
interface State {
	email: string,
	emailError: string | null,
	globalError: GlobalError | null,
	isSubmitting: boolean,
	name: string,
	nameError: string | null,
	password: string,
	passwordError: string | null,
	showErrors: boolean
}
export default class CreateAccountStep extends React.PureComponent<Props, State> {
	private readonly _changeEmail = (email: string, emailError?: string) => {
		this.setState({
			email,
			emailError
		});
	};
	private readonly _changeName = (name: string, nameError?: string) => {
		this.setState({
			name,
			nameError
		});
	};
	private readonly _changePassword = (password: string, passwordError?: string) => {
		this.setState({
			password,
			passwordError
		});
	};
	private readonly _createAccount = () => {
		this.setState({
			showErrors: true
		});
		if (
			this.state.emailError ||
			this.state.nameError ||
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
				this.props.captcha
					.execute('createUserAccount')
					.then(
						captchaResponse => this.props.onCreateAccount({
							email: this.state.email,
							name: this.state.name,
							password: this.state.password,
							captchaResponse,
							analyticsAction: this.props.analyticsAction
						})
					)
					.catch(
						(errors?: string[]) => {
							let nextState = {
								emailError: null as string,
								globalError: null as GlobalError,
								isSubmitting: false,
								nameError: null as string
							};
							if (Array.isArray(errors)) {
								if (errors.includes('DuplicateName')) {
									nextState.nameError = 'Username already in use.';
								}
								if (errors.includes('DuplicateEmail')) {
									nextState.emailError = 'Email address already in use.';
								}
								if (errors.includes('InvalidCaptcha')) {
									nextState.globalError = GlobalError.InvalidCaptcha;
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
	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			emailError: null,
			globalError: null,
			isSubmitting: false,
			name: '',
			nameError: null,
			password: '',
			passwordError: null,
			showErrors: false
		};
	}
	public componentDidMount() {
		this.props.captcha.showBadge();
	}
	public componentWillUnmount() {
		this.props.captcha.hideBadge();
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.InvalidCaptcha:
				globalError = 'Invalid captcha. Please try again.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		return (
			<div className="create-account-step_3cn5rp">
				<h1>Create Account</h1>
				<UsernameField
					autoFocus
					error={this.state.nameError}
					onChange={this._changeName}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				<EmailAddressField
					error={this.state.emailError}
					onChange={this._changeEmail}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					error={this.state.passwordError}
					onChange={this._changePassword}
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
					onClick={this._createAccount}
					size="large"
					state={
						this.state.isSubmitting ?
							'busy' :
							'normal'
					}
					text="Create Account"
				/>
				<FormPartition />
				<AppleIdButton onClick={this._signInWithApple} />
				<ActionLink
					onClick={this.props.onSignIn}
					state={
						this.state.isSubmitting ?
							'disabled' :
							'normal'
					}
					text="Already have an account?"
				/>
			</div>
		);
	}
}