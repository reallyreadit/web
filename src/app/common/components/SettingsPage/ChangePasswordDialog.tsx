// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import InputField from '../../../../common/components/controls/InputField';
import FieldsetDialog, {
	Props as FieldsetDialogProps,
	State,
} from '../controls/FieldsetDialog';

interface Props {
	onChangePassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<void>;
}
export default class ChangePasswordDialog extends FieldsetDialog<
	void,
	Props,
	Partial<State> & {
		currentPassword?: string;
		currentPasswordError?: string;
		password1?: string;
		password1Error?: string;
		password2?: string;
		password2Error?: string;
	}
> {
	private _handleCurrentPasswordChange = (
		currentPassword: string,
		currentPasswordError: string
	) => this.setState({ currentPassword, currentPasswordError });
	private _handlePassword1Change = (
		password1: string,
		password1Error: string
	) => this.setState({ password1, password1Error });
	private _handlePassword2Change = (
		password2: string,
		password2Error: string
	) => this.setState({ password2, password2Error });
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				title: 'Change Password',
				submitButtonText: 'Save Changes',
				successMessage: 'Password changed',
			},
			props
		);
	}
	protected renderFields() {
		const passwordProps = {
			type: 'password' as 'password',
			required: true,
			minLength: 8,
			maxLength: 256,
			showError: this.state.showErrors,
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
			/>,
		];
	}
	protected getClientErrors() {
		const errors = {
			currentPassword: this.state.currentPasswordError,
			password1: this.state.password1Error,
			password2: this.state.password2Error,
		};
		if (
			!errors.password1 &&
			!errors.password2 &&
			this.state.password1 !== this.state.password2
		) {
			errors.password2 = 'Passwords do not match.';
			this.setState({ password2Error: errors.password2 });
		}
		return [errors];
	}
	protected submitForm() {
		return this.props.onChangePassword(
			this.state.currentPassword,
			this.state.password1
		);
	}
	protected onError(errors: string[]) {
		if (errors.some((error) => error === 'IncorrectPassword')) {
			this.setState({ currentPasswordError: 'Incorrect password.' });
		}
	}
}
