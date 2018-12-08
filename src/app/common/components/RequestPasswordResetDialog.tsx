import * as React from 'react';
import InputField from './controls/InputField';
import Dialog, { Props as DialogProps, State } from './controls/Dialog';
import Captcha from '../Captcha';
import { Intent } from './Toaster';

interface Props {
	captcha: Captcha,
	onRequestPasswordReset: (email: string, captchaResponse: string) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	constructor(props: Props & DialogProps) {
		super(
			{
				title: 'Request Password Reset',
				submitButtonText: 'Submit Request',
				successMessage: 'Password reset email has been sent'
			},
			props
		);
	}
	protected renderFields() {
		return [
			<InputField
				key="emailAddress"
				type="email"
				label="Email Address"
				value={this.state.email}
				autoFocus
				required
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>
		];
	}
	protected getClientErrors() {
		return [{ email: this.state.emailError }];
	}
	protected submitForm() {
		return this.props.captcha
			.execute('requestPasswordReset')
			.then(captchaResponse => this.props.onRequestPasswordReset(
				this.state.email,
				captchaResponse
			));
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some(error => error === 'RequestLimitExceeded')) {
			this.setState({ errorMessage: 'Password reset rate limit exceeded.\nPlease try again later.' });
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