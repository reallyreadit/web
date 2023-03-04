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
import FieldsetDialog, {
	Props as FieldsetDialogProps,
	State,
} from './controls/FieldsetDialog';
import EmailAddressField from '../../../common/components/controls/authentication/EmailAddressField';
import PasswordField from '../../../common/components/controls/authentication/PasswordField';
import { Intent } from '../../../common/components/Toaster';
import SignInForm from '../../../common/models/userAccounts/SignInForm';

interface Props {
	analyticsAction: string;
	authServiceToken?: string;
	autoFocus?: boolean;
	onOpenPasswordResetDialog: (authServiceToken?: string) => void;
	onSignIn: (form: Form) => Promise<void>;
}
export type Form = Pick<
	SignInForm,
	'authServiceToken' | 'email' | 'password'
> & { analyticsAction: string };
export default class SignInDialog extends FieldsetDialog<
	void,
	Props,
	Partial<State> & {
		email?: string;
		emailError?: string;
		password?: string;
		passwordError?: string;
	}
> {
	public static defaultProps: Pick<Props, 'autoFocus'> = {
		autoFocus: true,
	};
	private readonly _handleEmailChange = (email: string, emailError: string) =>
		this.setState({ email, emailError });
	private readonly _handlePasswordChange = (
		password: string,
		passwordError: string
	) => this.setState({ password, passwordError });
	private readonly _openPasswordResetDialog = () => {
		this.props.onOpenPasswordResetDialog(this.props.authServiceToken);
	};
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				className: 'sign-in-dialog_rmrt01',
				title: props.authServiceToken ? 'Link Existing Account' : 'Log In',
				submitButtonText: props.authServiceToken ? 'Link Account' : 'Log In',
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<EmailAddressField
					autoFocus={this.props.autoFocus}
					error={this.state.emailError}
					onChange={this._handleEmailChange}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					value={this.state.password}
					error={this.state.passwordError}
					showError={this.state.showErrors}
					onChange={this._handlePasswordChange}
				/>
				<div className="link">
					<span onClick={this._openPasswordResetDialog}>
						Forgot your password?
					</span>
				</div>
			</>
		);
	}
	protected getClientErrors() {
		return [
			{
				email: this.state.emailError,
				password: this.state.passwordError,
			},
		];
	}
	protected submitForm() {
		return this.props.onSignIn({
			authServiceToken: this.props.authServiceToken,
			email: this.state.email,
			password: this.state.password,
			analyticsAction: this.props.analyticsAction,
		});
	}
	protected onError(errors: string[]) {
		if (errors.some((error) => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some((error) => error === 'IncorrectPassword')) {
			this.setState({ passwordError: 'Incorrect password.' });
		}
		if (errors.some((error) => error === 'InvalidSessionId')) {
			this.props.onShowToast('Invalid session id.', Intent.Danger);
		}
		if (errors.some((error) => error === 'AuthenticationExpired')) {
			this.props.onShowToast(
				<>
					Authentication expired.
					<br />
					Please sign in again.
				</>,
				Intent.Danger
			);
		}
	}
}
