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
import InputField from '../../../common/components/controls/InputField';
import FieldsetDialog, {
	Props as FieldsetDialogProps,
	State,
} from './controls/FieldsetDialog';
import CaptchaBase from '../../../common/captcha/CaptchaBase';
import { Intent } from '../../../common/components/Toaster';
import PasswordResetRequestForm from '../../../common/models/userAccounts/PasswordResetRequestForm';

interface Props {
	authServiceToken?: string;
	autoFocus?: boolean;
	captcha: CaptchaBase;
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>;
}
export default class RequestPasswordResetDialog extends FieldsetDialog<
	void,
	Props,
	Partial<State> & {
		email?: string;
		emailError?: string;
	}
> {
	public static defaultProps: Pick<Props, 'autoFocus'> = {
		autoFocus: true,
	};
	private _handleEmailChange = (email: string, emailError: string) =>
		this.setState({ email, emailError });
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				title: 'Request Password Reset',
				submitButtonText: 'Submit Request',
				successMessage: 'Password reset email has been sent',
			},
			props
		);
	}
	protected renderFields() {
		return [
			<InputField
				key="emailAddress"
				type="email"
				label="Email Address"
				value={this.state.email}
				autoFocus={this.props.autoFocus}
				required
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>,
		];
	}
	protected getClientErrors() {
		return [{ email: this.state.emailError }];
	}
	protected submitForm() {
		return this.props.captcha
			.execute('requestPasswordReset')
			.then((captchaResponse) =>
				this.props.onRequestPasswordReset({
					authServiceToken: this.props.authServiceToken,
					captchaResponse,
					email: this.state.email,
				})
			);
	}
	protected onError(errors: string[]) {
		if (errors.some((error) => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some((error) => error === 'RequestLimitExceeded')) {
			this.setState({
				errorMessage:
					'Password reset rate limit exceeded.\nPlease try again later.',
			});
		}
		if (errors.some((error) => error === 'InvalidCaptcha')) {
			this.props.onShowToast(
				<>
					Invalid Captcha
					<br />
					Please Try Again
				</>,
				Intent.Danger
			);
		}
	}
	public componentDidMount() {
		this.props.captcha.showBadge();
	}
	public componentWillUnmount() {
		this.props.captcha.hideBadge();
	}
}
