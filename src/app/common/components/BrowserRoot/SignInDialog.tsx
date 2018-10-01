import * as React from 'react';
import Dialog, { Props as DialogProps, State } from '../controls/Dialog';
import EmailAddressField from '../controls/authentication/EmailAddressField';
import PasswordField from '../controls/authentication/PasswordField';

interface Props {
	onOpenPasswordResetDialog: () => void,
	onSignIn: (emailAddress: string, password: string) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string,
	password?: string,
	passwordError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private _handlePasswordChange = (password: string, passwordError: string) => this.setState({ password, passwordError });
	constructor(props: Props & DialogProps) {
		super(
			{
				title: 'Log In',
				submitButtonText: 'Log In'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<div className="sign-in-dialog">
				<EmailAddressField
					autoFocus
					error={this.state.emailError}
					onChange={this._handleEmailChange}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					value={this.state.password}
					error={this.state.passwordError}
					showError={this.state.showErrors}
					onChange={this._handlePasswordChange}
				/>
				<div className="forgot-password">
					<span onClick={this.props.onOpenPasswordResetDialog}>Forgot your password?</span>
				</div>
			</div>
		);
	}
	protected getClientErrors() {
		return [{
			email: this.state.emailError,
			password: this.state.passwordError
		}];
	}
	protected submitForm() {
		return this.props.onSignIn(this.state.email, this.state.password);
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