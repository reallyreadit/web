import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import InputFieldState from './InputFieldState';
import Dialog, { DialogState } from './Dialog';
import CancelablePromise from '../CancelablePromise';

export default class SignInDialog extends Dialog<{}, Partial<DialogState> & {
	emailError?: string,
	passwordError?: string
}> {
	private email = new InputFieldState().addListener('change', () => this.setState({ emailError: undefined }));
	private password = new InputFieldState().addListener('change', () => this.setState({ passwordError: undefined }));
	protected title = 'Sign In';
	protected className = 'sign-in-dialog';
	protected submitButtonText = 'Sign In';
	constructor(props: {}, context: Context) {
		super(props, {}, context);
	}
	protected onSubmit() {
		return new CancelablePromise(this.context.api
			.signIn(this.email.value, this.password.value)
			.then(userAccount => {
				this.context.user.signIn(userAccount);
				this.context.page.closeDialog();
			})
			.catch((errors: string[]) => {
				if (errors.some(error => error === 'UserAccountNotFound')) {
					this.setState({ emailError: 'User account not found.' });
				}
				if (errors.some(error => error === 'IncorrectPassword')) {
					this.setState({ passwordError: 'Incorrect password.' });
				}
		}));
	}
	protected validate() {
		return [this.email, this.password].every(state => state.isValid) &&
			[this.state.emailError, this.state.passwordError].every(error => error === undefined);
	}
	protected renderFields() {
		return (
			<div>
				<InputField type="email" label="Email Address" autoFocus required error={this.state.emailError} showError={this.state.showErrors} onChange={this.email.handleChange} />
				<InputField type="password" label="Password" required error={this.state.passwordError} showError={this.state.showErrors} onChange={this.password.handleChange} />
			</div>
		);
	}
}