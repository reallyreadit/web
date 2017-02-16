import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import InputFieldState from './InputFieldState';
import Dialog, { DialogState } from './Dialog';
import CancelablePromise from '../CancelablePromise';

export default class SignInDialog extends Dialog<{}, Partial<DialogState> & {
	nameError?: string,
	passwordError?: string
}> {
	private name = new InputFieldState().addListener('change', () => this.setState({ nameError: undefined }));
	private password = new InputFieldState().addListener('change', () => this.setState({ passwordError: undefined }));
	protected title = 'Sign In';
	protected className = 'sign-in-dialog';
	protected submitButtonText = 'Sign In';
	constructor(props: {}, context: Context) {
		super(props, {}, context);
	}
	protected onSubmit() {
		return new CancelablePromise(this.context.api
			.signIn(this.name.value, this.password.value)
			.then(userAccount => {
				this.context.user.signIn(userAccount);
				this.context.dialog.close();
			})
			.catch((errors: string[]) => {
				if (errors.some(error => error === 'UserAccountNotFound')) {
					this.setState({ nameError: 'Username not found.' });
				}
				if (errors.some(error => error === 'IncorrectPassword')) {
					this.setState({ passwordError: 'Incorrect password.' });
				}
		}));
	}
	protected validate() {
		return [this.name, this.password].every(state => state.isValid) &&
			[this.state.nameError, this.state.passwordError].every(error => error === undefined);
	}
	protected renderFields() {
		return (
			<div>
				<InputField type="text" label="Username" autoFocus required error={this.state.nameError} showError={this.state.showErrors} onChange={this.name.handleChange} />
				<InputField type="password" label="Password" required error={this.state.passwordError} showError={this.state.showErrors} onChange={this.password.handleChange} />
			</div>
		);
	}
}