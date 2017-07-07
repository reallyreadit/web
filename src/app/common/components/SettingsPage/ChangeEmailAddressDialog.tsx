import * as React from 'react';
import Context from '../../Context';
import InputField from '../InputField';
import Dialog, { State } from '../Dialog';
import UserAccount from '../../../../common/models/UserAccount';

export default class ChangeEmailAddressDialog extends Dialog<UserAccount, {}, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	constructor(props: {}, context: Context) {
		super(
			{
				title: 'Change Email Address',
				submitButtonText: 'Save Changes',
				successMessage: 'Email address changed'
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
				maxLength={256}
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>
		);
	}
	protected getClientErrors() {
		const errors = { email: this.state.emailError };
		if (!errors.email && this.state.email === this.context.user.userAccount.email) {
			errors.email = 'Email address already set.';
			this.setState({ emailError: errors.email });
		}
		return [errors];
	}
	protected submitForm() {
		return this.context.api.changeEmailAddress(this.state.email);
	}
	protected onSuccess(userAccount: UserAccount) {
		this.context.user.update(userAccount);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'ResendLimitExceeded')) {
			this.setState({ errorMessage: 'Email confirmation rate limit exceeded.\nPlease try again later.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.setState({ emailError: 'Email address already in use.' });
		}
	}
}