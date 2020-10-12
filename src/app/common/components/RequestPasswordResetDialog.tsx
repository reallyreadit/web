import * as React from 'react';
import InputField from './controls/InputField';
import FormDialog, { Props as FormDialogProps, State } from './controls/FormDialog';
import CaptchaBase from '../../../common/captcha/CaptchaBase';
import { Intent } from '../../../common/components/Toaster';
import PasswordResetRequestForm from '../../../common/models/userAccounts/PasswordResetRequestForm';

interface Props {
	authServiceToken?: string,
	autoFocus?: boolean,
	captcha: CaptchaBase,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>
}
export default class RequestPasswordResetDialog extends FormDialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	public static defaultProps: Partial<Props> = {
		autoFocus: true
	};
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	constructor(props: Props & FormDialogProps) {
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
				autoFocus={this.props.autoFocus}
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
			.then(
				captchaResponse => this.props.onRequestPasswordReset({
					authServiceToken: this.props.authServiceToken,
					captchaResponse,
					email: this.state.email
				})
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