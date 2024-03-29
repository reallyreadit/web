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
import Button from '../../../../common/components/Button';
import InputField from '../../../../common/components/controls/InputField';

interface Props {
	email: string;
	onResetPassword: (token: string, email: string) => Promise<void>;
	token: string;
}
enum GlobalError {
	Unknown,
	PasswordMismatch,
	RequestNotFound,
	RequestExpired,
}
interface State {
	globalError: GlobalError | null;
	isSubmitting: boolean;
	password1: string;
	password1Error: string | null;
	password2: string;
	password2Error: string | null;
	showErrors: boolean;
}
export default class ResetPasswordStep extends React.PureComponent<
	Props,
	State
> {
	private readonly _changePassword1 = (
		password1: string,
		password1Error?: string
	) => {
		this.setState({
			password1,
			password1Error,
		});
	};
	private readonly _changePassword2 = (
		password2: string,
		password2Error?: string
	) => {
		this.setState({
			password2,
			password2Error,
		});
	};
	private readonly _resetPassword = () => {
		if (this.state.isSubmitting) {
			return;
		}
		this.setState({
			showErrors: true,
		});
		if (this.state.password1Error || this.state.password2Error) {
			return;
		}
		if (this.state.password1 !== this.state.password2) {
			this.setState({
				globalError: GlobalError.PasswordMismatch,
			});
			return;
		}
		this.setState(
			{
				globalError: null,
				isSubmitting: true,
			},
			() => {
				this.props
					.onResetPassword(this.props.token, this.state.password1)
					.catch((errors?: string[]) => {
						let nextState = {
							globalError: null as GlobalError,
							isSubmitting: false,
							password1Error: null as string,
							password2Error: null as string,
						};
						if (Array.isArray(errors)) {
							if (errors.includes('RequestNotFound')) {
								nextState.globalError = GlobalError.RequestNotFound;
							}
							if (errors.includes('RequestExpired')) {
								nextState.globalError = GlobalError.RequestExpired;
							}
						} else {
							nextState.globalError = GlobalError.Unknown;
						}
						this.setState(nextState);
					});
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			globalError: null,
			isSubmitting: false,
			password1: '',
			password1Error: null,
			password2: '',
			password2Error: null,
			showErrors: false,
		};
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.PasswordMismatch:
				globalError = 'Passwords do not match.';
				break;
			case GlobalError.RequestNotFound:
				globalError =
					'This password reset request is invalid. Please generate a new request.';
				break;
			case GlobalError.RequestExpired:
				globalError =
					'This password reset request has expired. Please generate a new request.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		const passwordProps = {
			type: 'password' as 'password',
			required: true,
			minLength: 8,
			maxLength: 256,
			showError: this.state.showErrors,
		};
		return (
			<div className="reset-password-step_oygm48">
				<h1>Set Password</h1>
				<InputField
					{...passwordProps}
					key="password1"
					label="New Password"
					value={this.state.password1}
					error={this.state.password1Error}
					onChange={this._changePassword1}
					onEnterKeyPressed={this._resetPassword}
				/>
				<InputField
					{...passwordProps}
					key="password2"
					label="Confirm New Password"
					value={this.state.password2}
					error={this.state.password2Error}
					onChange={this._changePassword2}
					onEnterKeyPressed={this._resetPassword}
				/>
				{globalError ? <div className="global-error">{globalError}</div> : null}
				<Button
					align="center"
					display="block"
					intent="loud"
					onClick={this._resetPassword}
					size="large"
					state={this.state.isSubmitting ? 'busy' : 'normal'}
					text="Set Password"
				/>
			</div>
		);
	}
}
