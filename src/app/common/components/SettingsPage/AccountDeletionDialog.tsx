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
	State as FieldsetDialogState,
} from '../controls/FieldsetDialog';
import InfoBox from '../../../../common/components/InfoBox';
import { Intent } from '../../../../common/components/Toaster';
import { getPromiseErrorMessage } from '../../../../common/format';

interface Props {
	onDeleteAccount: () => Promise<void>;
}
type State = Partial<FieldsetDialogState> & {
	confirmation: string;
	confirmationError: string | null;
};

const confirmationValue = 'DELETE MY ACCOUNT';

export class AccountDeletionDialog extends FieldsetDialog<
	void,
	Props,
	State,
	any
> {
	private _changeConfirmation = (
		confirmation: string,
		confirmationError?: string
	) => {
		this.setState({
			confirmation,
			confirmationError,
		});
	};
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				className: 'account-deletion-dialog_yk788q',
				title: 'Delete Account',
				submitButtonText: 'Delete Account',
				successMessage: 'Account Deleted.',
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<InfoBox style="warning">
					<p>
						Type the words DELETE MY ACCOUNT to confirm that you want to
						permenantly delete your account.
					</p>
					<p>This action cannot be undone.</p>
				</InfoBox>
				<InputField
					type="text"
					label="Confirm"
					value={this.state.confirmation}
					error={this.state.confirmationError}
					showError={this.state.showErrors}
					onChange={this._changeConfirmation}
				/>
			</>
		);
	}
	protected getClientErrors() {
		const errors = {
			confirmationError: this.state.confirmationError,
		};
		if (this.state.confirmation !== confirmationValue) {
			errors.confirmationError = 'Confirmation is required.';
			this.setState({
				confirmationError: errors.confirmationError,
			});
		}
		return [errors];
	}
	protected submitForm() {
		return this.props.onDeleteAccount();
	}
	protected onError(reason: any) {
		this.props.onShowToast(getPromiseErrorMessage(reason), Intent.Danger);
	}
}
