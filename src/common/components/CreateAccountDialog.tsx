import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import InputFieldState from './InputFieldState';
import Dialog from './Dialog';

export default class CreateAccountDialog extends Dialog<{}, {
	nameError?: string,
	emailError?: string
}> {
	private name = new InputFieldState().addListener('change', () => this.setState({ nameError: undefined }));
	private email = new InputFieldState().addListener('change', () => this.setState({ emailError: undefined }));;
	private password = new InputFieldState();
	protected title = 'Create Account';
	protected className = 'create-account-dialog';
	constructor(props: {}, context: Context) {
		super(props, {}, context);
	}
	protected onSubmit() {
		return this.context.api
			.createUserAccount(this.name.value, this.email.value, this.password.value)
			.then(userAccount => {
				this.context.user.signIn(userAccount);
				this.context.dialog.close();
			})
			.catch((errors: string[]) => {
				if (errors.some(error => error === 'DuplicateName')) {
					this.setState({ nameError: 'Username already in use.' });
				}
				if (errors.some(error => error === 'DuplicateEmail')) {
					this.setState({ emailError: 'Email address already in use.' });
				}
			});
	}
	protected validate() {
		return [this.name, this.email, this.password].every(state => state.isValid) &&
			[this.state.nameError, this.state.emailError].every(error => error === undefined);
	}
	protected renderFields() {
		return (
			<div>
				<InputField type="text" label="Username" required minLength={3} maxLength={30} error={this.state.nameError} showError={this.state.showErrors} onChange={this.name.handleChange} />
				<InputField type="email" label="Email Address" required maxLength={256} error={this.state.emailError} showError={this.state.showErrors} onChange={this.email.handleChange} />
				<InputField type="password" label="Password" required minLength={8} maxLength={256} showError={this.state.showErrors} onChange={this.password.handleChange} />
			</div>
		);
	}
}