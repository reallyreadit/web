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
import FormDialog from '../../../../common/components/FormDialog';
import { Intent } from '../../../../common/components/Toaster';

interface Props {
	email: string,
	onCloseDialog: () => void,
	onSendPasswordCreationEmail: () => Promise<any>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
}
export default class SetPasswordDialog extends React.PureComponent<Props> {
	private readonly _submit = () => {
		return this.props
			.onSendPasswordCreationEmail()
			.then(
				() => {
					this.props.onShowToast('Email sent', Intent.Success);
				}
			)
			.catch(
				(errors: string[]) => {
					let errorMessage: React.ReactNode;
					if (errors && errors.includes('RequestLimitExceeded')) {
						errorMessage = <>An email was already sent.<br />Please check your spam folder.</>
					} else {
						errorMessage = <>Error sending email.<br />Please try again later.</>
					}
					this.props.onShowToast(errorMessage, Intent.Danger);
					throw errors;
				}
			);
	};
	public render() {
		return (
			<FormDialog
				className="set-password-dialog_oreurf"
				closeButtonText="Cancel"
				onClose={this.props.onCloseDialog}
				onSubmit={this._submit}
				size="small"
				submitButtonText="Send Email"
				textAlign="center"
				title="Set Password"
			>
				<p>An email with a link to set a password will be sent to the following address:</p>
				<p>{this.props.email}</p>
			</FormDialog>
		);
	}
}