import * as React from 'react';
import Context from '../../Context';
import InputField from '../controls/InputField';
import Dialog, { State } from '../controls/Dialog';
import { Intent } from '../../Page';

export default class RequestPasswordResetDialog extends Dialog<{}, {}, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private _captchaElement: HTMLDivElement | null = null;
	private readonly _setCaptchaElement = (ref: HTMLDivElement) => {
		this._captchaElement = ref;
	};
	private _captchaId: number | null = null;
	constructor(props: {}, context: Context) {
		super(
			{
				title: 'Request Password Reset',
				submitButtonText: 'Submit Request',
				successMessage: 'Password reset email has been sent'
			},
			props,
			context
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
		return this.context.api.requestPasswordReset(
			this.state.email,
			this.context.captcha.getResponse(this._captchaId)
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
			this.context.page.showToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
		}
		this.context.captcha.reset(this._captchaId);
	}
	public componentDidMount() {
		this.context.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, '6LeSR14UAAAAAHLt_KcHJTjOIZiy2txFnXf4UmUr');
		});
	}
}