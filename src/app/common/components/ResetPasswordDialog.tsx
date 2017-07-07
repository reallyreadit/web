import * as React from 'react';
import Context from '../Context';
import InputField from './InputField';
import Dialog, { State } from './Dialog';

interface Props {
	email: string,
	token: string
}
export default class ResetPasswordDialog extends Dialog<{}, Props, Partial<State> & {
	password1?: string,
	password1Error?: string,
	password2?: string,
	password2Error?: string
}> {
	private _handlePassword1Change = (password1: string, password1Error: string) => this.setState({ password1, password1Error });
	private _handlePassword2Change = (password2: string, password2Error: string) => this.setState({ password2, password2Error });
	constructor(props: Props, context: Context) {
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
		return this.context.api.resetPassword(this.props.token, this.state.password1);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'RequestNotFound')) {
			this.setState({ errorMessage: 'This password reset request is invalid.\nPlease generate a new request.' });
		}
		if (errors.some(error => error === 'RequestExpired')) {
			this.setState({ errorMessage: 'This password reset request has expired.\nPlease generate a new request.' });
		}
	}
}