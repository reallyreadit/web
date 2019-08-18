import * as React from 'react';
import FormDialog, { Props as FormDialogProps, State } from './controls/FormDialog';
import EmailAddressField from './controls/authentication/EmailAddressField';
import PasswordField from './controls/authentication/PasswordField';
import UsernameField from './controls/authentication/UsernameField';
import Captcha from '../../server/Captcha';
import { Intent } from '../../../common/components/Toaster';

interface Props {
	captcha: Captcha,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>
}
export default class CreateAccountDialog extends FormDialog<void, Props, Partial<State> & {
	name?: string,
	nameError?: string,
	email?: string,
	emailError?: string,
	password?: string,
	passwordError?: string
}> {
	private _handleNameChange = (name: string, nameError: string) => this.setState({ name, nameError });
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private _handlePasswordChange = (password: string, passwordError: string) => this.setState({ password, passwordError });
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: 'Sign Up',
				submitButtonText: 'Sign Up'
			},
			props
		);
	}
	protected renderFields() {
		return [
			<UsernameField
				autoFocus
				error={this.state.nameError}
				key="username"
				onChange={this._handleNameChange}
				showError={this.state.showErrors}
				value={this.state.name}
			/>,
			<EmailAddressField
				error={this.state.emailError}
				key="emailAddress"
				onChange={this._handleEmailChange}
				showError={this.state.showErrors}
				value={this.state.email}
			/>,
			<PasswordField
				error={this.state.passwordError}
				key="password"
				onChange={this._handlePasswordChange}
				showError={this.state.showErrors}
				value={this.state.password}
			/>
		];
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
			.then(captchaResponse => this.props.onCreateAccount(
				this.state.name,
				this.state.email,
				this.state.password,
				captchaResponse
			));
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