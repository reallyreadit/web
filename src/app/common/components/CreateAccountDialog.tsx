import * as React from 'react';
import Context from '../Context';
import InputField from './controls/InputField';
import Dialog, { State } from './controls/Dialog';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../Page';

export default class CreateAccountDialog extends Dialog<UserAccount, {}, Partial<State> & {
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
	constructor(props: {}, context: Context) {
		super(
			{
				title: 'Create Account',
				submitButtonText: 'Create Account',
				successMessage: 'Welcome to reallyread.it!\nPlease check your email and confirm your address.'
			},
			props,
			context
		);
	}
	protected renderFields() {
		return [
			<InputField
				key="username"
				type="text"
				label="Username"
				value={this.state.name}
				autoFocus
				required
				minLength={3}
				maxLength={30}
				error={this.state.nameError}
				showError={this.state.showErrors}
				onChange={this._handleNameChange}
			/>,
			<InputField
				key="emailAddress"
				type="email"
				label="Email Address"
				value={this.state.email}
				required
				maxLength={256}
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>,
			<InputField
				key="password"
				type="password"
				label="Password"
				value={this.state.password}
				required
				minLength={8}
				maxLength={256}
				error={this.state.passwordError}
				showError={this.state.showErrors}
				onChange={this._handlePasswordChange}
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
		return this.context.api.createUserAccount(
			this.state.name,
			this.state.email,
			this.state.password,
			this.context.captcha.getResponse(this._captchaId)
		);
	}
	protected onSuccess(userAccount: UserAccount) {
		this.context.user.signIn(userAccount);
		ga('send', {
			hitType: 'event',
			eventCategory: 'UserAccount',
			eventAction: 'create',
			eventLabel: userAccount.name
		});
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'DuplicateName')) {
			this.setState({ nameError: 'Username already in use.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.setState({ emailError: 'Email address already in use.' });
		}
		if (errors.some(error => error === 'InvalidCaptcha')) {
			this.context.page.showToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
		}
		this.context.captcha.reset(this._captchaId);
	}
	public componentDidMount() {
		this.context.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, '6LcxOV4UAAAAAGZTappGq7UwQ7EXSBUxAGMJNLQM');
		});
	}
}