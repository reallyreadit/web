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
import Button from '../Button';
import AuthServiceAccountForm from '../../models/userAccounts/AuthServiceAccountForm';
import UsernameField from '../controls/authentication/UsernameField';
import Link from '../Link';

export type Form = Pick<AuthServiceAccountForm, 'token' | 'name'> & {
	analyticsAction: string
};
interface Props {
	analyticsAction: string,
	authServiceToken: string,
	onCreateAuthServiceAccount: (form: Form) => Promise<void>,
	onLinkExistingAccount: () => void,
}
enum GlobalError {
	Unknown,
	DuplicateEmail,
	InvalidSessionId,
	AuthenticationExpired
}
interface State {
	name: string,
	nameError: string | null,
	globalError: GlobalError | null,
	isSubmitting: boolean,
	showErrors: boolean
}
export default class CreateAuthServiceAccountStep extends React.PureComponent<Props, State> {
	private readonly _changeName = (name: string, nameError?: string) => {
		this.setState({
			name,
			nameError
		});
	};
	private readonly _createAccount = () => {
		if (this.state.isSubmitting) {
			return;
		}
		this.setState({
			showErrors: true
		});
		if (this.state.nameError) {
			return;
		}
		this.setState(
			{
				globalError: null,
				isSubmitting: true
			},
			() => {
				this.props
					.onCreateAuthServiceAccount({
						analyticsAction: this.props.analyticsAction,
						token: this.props.authServiceToken,
						name: this.state.name
					})
					.catch(
						(errors?: string[]) => {
							let nextState = {
								nameError: null as string,
								globalError: null as GlobalError,
								isSubmitting: false
							};
							if (Array.isArray(errors)) {
								if (errors.includes('DuplicateName')) {
									nextState.nameError = 'Reader name already in use.'
								}
								if (errors.includes('DuplicateEmail')) {
									nextState.globalError = GlobalError.DuplicateEmail;
								}
								if (errors.includes('InvalidSessionId')) {
									nextState.globalError = GlobalError.InvalidSessionId;
								}
								if (errors.includes('AuthenticationExpired')) {
									nextState.globalError = GlobalError.AuthenticationExpired;
								}
							} else {
								nextState.globalError = GlobalError.Unknown;
							}
							this.setState(nextState);
						}
					);
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			name: '',
			nameError: null,
			globalError: null,
			isSubmitting: false,
			showErrors: false
		};
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.AuthenticationExpired:
				globalError = 'Authentication expired. Please sign in again.';
				break;
			case GlobalError.DuplicateEmail:
				globalError = 'Email address already in use.';
				break;
			case GlobalError.InvalidSessionId:
				globalError = 'Invalid session id.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		return (
			<div className="create-auth-service-account-step_7minpy">
				<h1>Choose a Reader Name</h1>
				<UsernameField
					autoFocus
					error={this.state.nameError}
					key="username"
					onChange={this._changeName}
					onEnterKeyPressed={this._createAccount}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				{globalError ?
					<div className="global-error">{globalError}</div> :
					null}
				<Button
					align="center"
					display="block"
					intent="loud"
					onClick={this._createAccount}
					size="large"
					state={
						this.state.isSubmitting ?
							'busy' :
							'normal'
					}
					text="Create Account"
				/>
				<Link
					onClick={this.props.onLinkExistingAccount}
					state={
						this.state.isSubmitting ?
							'disabled' :
							'normal'
					}
					text="Link an existing account?"
				/>
			</div>
		);
	}
}