import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import Dialog, { State } from './Dialog';
import UserAccount from '../../../common/models/UserAccount';

export default class SignInDialog extends Dialog<UserAccount, {}, Partial<State> & {
	email?: string,
	emailError?: string,
	password?: string,
	passwordError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private _handlePasswordChange = (password: string, passwordError: string) => this.setState({ password, passwordError });
	constructor(props: {}, context: Context) {
		super(
			{
				title: 'Sign In',
				submitButtonText: 'Sign In'
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
			<InputField
				type="password"
				label="Password"
				value={this.state.password}
				required
				error={this.state.passwordError}
				showError={this.state.showErrors}
				onChange={this._handlePasswordChange}
			/>
		];
	}
	protected getClientErrors() {
		return [{
			email: this.state.emailError,
			password: this.state.passwordError
		}];
	}
	protected submitForm() {
		return this.context.api.signIn(this.state.email, this.state.password);
	}
	protected onSuccess(userAccount: UserAccount) {
		this.context.user.signIn(userAccount);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some(error => error === 'IncorrectPassword')) {
			this.setState({ passwordError: 'Incorrect password.' });
		}
	}
}