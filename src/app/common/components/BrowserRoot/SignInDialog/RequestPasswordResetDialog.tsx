import * as React from 'react';
import InputField from '../../controls/InputField';
import Dialog, { Props as DialogProps, State } from '../../controls/Dialog';
import Captcha from '../../../Captcha';
import { Intent } from '../../Toaster';

interface Props {
	captcha: Captcha,
	onRequestPasswordReset: (email: string, captchaResponse: string) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private _captchaElement: HTMLDivElement | null = null;
	private readonly _setCaptchaElement = (ref: HTMLDivElement) => {
		this._captchaElement = ref;
	};
	private _captchaId: number | null = null;
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
			/>,
			<div
				key="captcha"
				ref={this._setCaptchaElement}
			></div>
		];
	}
	protected getClientErrors() {
		return [{ email: this.state.emailError }];
	}
	protected submitForm() {
		return this.props.onRequestPasswordReset(
			this.state.email,
			this.props.captcha.getResponse(this._captchaId)
		);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some(error => error === 'RequestLimitExceeded')) {
			this.setState({ errorMessage: 'Password reset rate limit exceeded.\nPlease try again later.' });
		}
		if (errors.some(error => error === 'InvalidCaptcha')) {
			this.props.onShowToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
		}
		this.props.captcha.reset(this._captchaId);
	}
	public componentDidMount() {
		this.props.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, this.props.captcha.siteKeys.forgotPassword);
		});
	}
}