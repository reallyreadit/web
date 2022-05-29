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
import FieldsetDialog, { Props as FieldsetDialogProps, State as FieldsetDialogState } from '../../controls/FieldsetDialog';
import { AuthorEmailVerificationRequest } from '../../../../../common/models/userAccounts/AuthorEmailVerificationRequest';
import InputField from '../../../../../common/components/controls/InputField';

interface Props {
	onSubmitRequest: (request: AuthorEmailVerificationRequest) => Promise<void>
}

interface State {
	email?: string,
	emailError?: string,
	name?: string,
	nameError?: string
}

export class EmailVerificationDialog extends FieldsetDialog<void, Props, State & FieldsetDialogState> {
	private readonly _changeEmail = (email: string, emailError: string) => {
		this.setState({
			email,
			emailError
		});
	};
	private readonly _changeName = (name: string, nameError: string) => {
		this.setState({
			name,
			nameError
		});
	};
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				title: 'What\'s your work email?',
				submitButtonText: 'Submit',
				successMessage: 'Request received. Thank you!'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<p className="instructions">
					Please provide your name and an email address that's visible on your peronsal web site, blog, or publisher's website and we'll reach out.
				</p>
				<InputField
					type="text"
					label="Full Name"
					value={this.state.name}
					autoFocus
					required
					error={this.state.nameError}
					showError={this.state.showErrors}
					onChange={this._changeName}
				/>
				<InputField
					type="email"
					label="Work Address"
					value={this.state.email}
					required
					error={this.state.emailError}
					showError={this.state.showErrors}
					onChange={this._changeEmail}
				/>
			</>
		);
	}
	protected getClientErrors() {
		return [
			{
				email: this.state.emailError,
				name: this.state.nameError
			}
		];
	}
	protected submitForm() {
		return this.props.onSubmitRequest({
			email: this.state.email,
			name: this.state.name
		});
	}
}