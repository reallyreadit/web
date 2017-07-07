import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import Dialog, { State } from './Dialog';

export default class RequestPasswordResetDialog extends Dialog<{}, {}, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
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
		return (
			<InputField
				type="email"
				label="Email Address"
				value={this.state.email}
				autoFocus
				required
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>
		);
	}
	protected getClientErrors() {
		return [{ email: this.state.emailError }];
	}
	protected submitForm() {
		return this.context.api.requestPasswordReset(this.state.email);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some(error => error === 'RequestLimitExceeded')) {
			this.setState({ errorMessage: 'Password reset rate limit exceeded.\nPlease try again later.' });
		}
	}
}