import * as React from 'react';
import Context from '../../Context';
import InputField from '../InputField';
import Dialog, { State } from '../Dialog';

export default class CreateAccountDialog extends Dialog<{}, {}, Partial<State> & {
	currentPassword?: string,
	currentPasswordError?: string,
	password1?: string,
	password1Error?: string,
	password2?: string,
	password2Error?: string
}> {
	private _handleCurrentPasswordChange = (currentPassword: string, currentPasswordError: string) => this.setState({ currentPassword, currentPasswordError });
	private _handlePassword1Change = (password1: string, password1Error: string) => this.setState({ password1, password1Error });
	private _handlePassword2Change = (password2: string, password2Error: string) => this.setState({ password2, password2Error });
	constructor(props: {}, context: Context) {
		super(
			{
				title: 'Change Password',
				submitButtonText: 'Save Changes',
				successMessage: 'Password changed'
			},
			props,
			context
		);
	}
	protected renderFields() {
		const passwordProps = {
			type: 'password' as 'password',
			required: true,
			minLength: 8,
			maxLength: 256,
			showError: this.state.showErrors
		};
		return [
			<InputField
				{...passwordProps}
				key="currentPassword"
				label="Current Password"
				value={this.state.currentPassword}
				error={this.state.currentPasswordError}
				onChange={this._handleCurrentPasswordChange}
			/>,
			<InputField
				{...passwordProps}
				key="password1"
				label="New Password"
				value={this.state.password1}
				error={this.state.password1Error}
				onChange={this._handlePassword1Change}
			/>,
			<InputField
				{...passwordProps}
				key="password2"
				label="Confirm New Password"
				value={this.state.password2}
				error={this.state.password2Error}
				onChange={this._handlePassword2Change}
			/>
		];
	}
	protected getClientErrors() {
		const errors = {
			currentPassword: this.state.currentPasswordError,
			password1: this.state.password1Error,
			password2: this.state.password2Error
		};
		if (!errors.password1 && !errors.password2 && this.state.password1 !== this.state.password2) {
			errors.password2 = 'Passwords do not match.';
			this.setState({ password2Error: errors.password2 });
		}
		return [errors];
	}
	protected submitForm() {
		return this.context.api.changePassword(this.state.currentPassword, this.state.password1);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'IncorrectPassword')) {
			this.setState({ currentPasswordError: 'Incorrect password.' });
		}
	}
}