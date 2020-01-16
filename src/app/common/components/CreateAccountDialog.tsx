import * as React from 'react';
import FormDialog, { Props as FormDialogProps, State } from './controls/FormDialog';
import EmailAddressField from './controls/authentication/EmailAddressField';
import PasswordField from './controls/authentication/PasswordField';
import UsernameField from './controls/authentication/UsernameField';
import Captcha from '../../server/Captcha';
import { Intent } from '../../../common/components/Toaster';
import AuthServiceDialogFooter from './AuthServiceDialogFooter';
import UserAccountForm from '../../../common/models/userAccounts/UserAccountForm';

interface Props {
	analyticsAction: string,
	autoFocus?: boolean,
	captcha: Captcha,
	onCreateAccount: (form: Form) => Promise<void>,
	onSignIn?: () => void,
	onSignInWithApple?: (analyticsAction: string) => void,
	title?: string
}
export type Form = Pick<UserAccountForm, 'name' | 'email' | 'password' | 'captchaResponse'> & { analyticsAction: string }
export default class CreateAccountDialog extends FormDialog<void, Props, Partial<State> & {
	name?: string,
	nameError?: string,
	email?: string,
	emailError?: string,
	password?: string,
	passwordError?: string
}> {
	public static defaultProps: Partial<Props> = {
		autoFocus: true
	};
	private readonly _handleNameChange = (name: string, nameError: string) => this.setState({ name, nameError });
	private readonly _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private readonly _handlePasswordChange = (password: string, passwordError: string) => this.setState({ password, passwordError });
	private readonly _signInWithApple = () => {
		this.props.onSignInWithApple(this.props.analyticsAction);
	};
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: props.title || 'Sign Up',
				submitButtonText: 'Sign Up'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<UsernameField
					autoFocus={this.props.autoFocus}
					error={this.state.nameError}
					key="username"
					onChange={this._handleNameChange}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				<EmailAddressField
					error={this.state.emailError}
					key="emailAddress"
					onChange={this._handleEmailChange}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					error={this.state.passwordError}
					key="password"
					onChange={this._handlePasswordChange}
					showError={this.state.showErrors}
					value={this.state.password}
				/>
				{this.props.onSignIn ?
					<div className="link">
						<span onClick={this.props.onSignIn}>Already have an account?</span>
					</div> :
					null}
			</>
		);
	}
	protected renderFooter() {
		if (this.props.onSignInWithApple) {
			return (
				<AuthServiceDialogFooter
					onSignInWithApple={this._signInWithApple}
				/>
			);
		}
		return null;
	}
	protected getClientErrors() {
		return [{
			name: this.state.nameError,
			email: this.state.emailError,
			password: this.state.passwordError
		}];
	}
	protected submitForm() {
		return this.props.captcha
			.execute('createUserAccount')
			.then(
				captchaResponse => this.props.onCreateAccount({
					email: this.state.email,
					name: this.state.name,
					password: this.state.password,
					captchaResponse,
					analyticsAction: this.props.analyticsAction
				})
			);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'DuplicateName')) {
			this.setState({ nameError: 'Username already in use.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.setState({ emailError: 'Email address already in use.' });
		}
		if (errors.some(error => error === 'InvalidCaptcha')) {
			this.props.onShowToast(<>Invalid Captcha<br />Please Try Again</>, Intent.Danger);
		}
	}
	public componentDidMount() {
		this.props.captcha.showBadge();
	}
	public componentWillUnmount() {
		this.props.captcha.hideBadge();
	}
}