import * as React from 'react';
import Dialog, { Props as DialogProps, State } from '../controls/Dialog';
import EmailAddressField from '../controls/authentication/EmailAddressField';
import PasswordField from '../controls/authentication/PasswordField';
import UsernameField from '../controls/authentication/UsernameField';
import Captcha from '../../../server/Captcha';
import { Intent } from '../Toaster';

interface Props {
	captcha: Captcha,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & {
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
	private _captchaElement: HTMLDivElement | null = null;
	private readonly _setCaptchaElement = (ref: HTMLDivElement) => {
		this._captchaElement = ref;
	};
	private _captchaId: number | null = null;
	constructor(props: Props & DialogProps) {
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
			/>,
			<div
				key="captcha"
				ref={this._setCaptchaElement}
			></div>
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
		return this.props.onCreateAccount(
			this.state.name,
			this.state.email,
			this.state.password,
			this.context.captcha.getResponse(this._captchaId)
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
			this.props.onShowToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
		}
		this.props.captcha.reset(this._captchaId);
	}
	public componentDidMount() {
		this.props.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, this.props.captcha.siteKeys.createAccount);
		});
	}
}