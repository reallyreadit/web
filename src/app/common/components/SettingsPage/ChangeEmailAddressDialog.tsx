import * as React from 'react';
import Context from '../../Context';
import InputField from '../InputField';
import Dialog, { State } from '../Dialog';
import UserAccount from '../../../../common/models/UserAccount';

export default class ChangeEmailAddressDialog extends Dialog<UserAccount, {}, Partial<State> & {
	email?: string,
	clientError?: string,
	serverError?: string
}> {
	private _handleEmailChange = (email: string, clientError: string) => this.setState({ email, clientError });
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
			<div className="change-email-address-dialog">
				{this.state.serverError ?
					<div
						className="server-error"
						dangerouslySetInnerHTML={{ __html: this.state.serverError.replace(/\n/g, '<br />') }}
					>
					</div> :
					null}
				<InputField
					type="email"
					label="Email Address"
					value={this.state.email}
					required
					maxLength={256}
					error={this.state.clientError}
					showError={this.state.showErrors}
					onChange={this._handleEmailChange}
				/>
			</div>
		);
	}
	protected getClientErrors() {
		const errors = { email: this.state.clientError };
		if (!errors.email && this.state.email === this.context.user.userAccount.email) {
			errors.email = 'Email address already set.';
			this.setState({ clientError: errors.email });
		}
		return [errors];
	}
	protected clearServerErrors() {
		this.setState({ serverError: null });
	}
	protected submitForm() {
		return this.context.api.changeEmailAddress(this.state.email);
	}
	protected onSuccess(userAccount: UserAccount) {
		this.context.user.update(userAccount);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'ResendLimitExceeded')) {
			this.setState({ serverError: 'Email confirmation rate limit exceeded.\nPlease try again later.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.setState({ clientError: 'Email address already in use.' });
		}
	}
}