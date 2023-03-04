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
	Props as FormDialogProps,
	State,
} from '../controls/FieldsetDialog';
import NewPlatformNotificationRequest from '../../../../common/models/analytics/NewPlatformNotificationRequest';

interface Props {
	onSubmitRequest: (form: NewPlatformNotificationRequest) => Promise<void>;
}
export default class NewPlatformNotificationRequestDialog extends FieldsetDialog<
	void,
	Props,
	Partial<State> & {
		email?: string;
		emailError?: string;
	}
> {
	private _handleEmailChange = (email: string, emailError: string) =>
		this.setState({
			email,
			emailError,
		});
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: 'Get Notified',
				submitButtonText: 'Submit',
				successMessage: 'Request received. Thank you!',
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
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
				/>
				<div className="note">
					<span>We won't email you for any other reason.</span>
				</div>
			</>
		);
	}
	protected getClientErrors() {
		return [
			{
				email: this.state.emailError,
			},
		];
	}
	protected submitForm() {
		return this.props.onSubmitRequest({
			emailAddress: this.state.email,
		});
	}
}
