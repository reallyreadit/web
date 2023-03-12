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
import CaptchaBase from '../../captcha/CaptchaBase';
import UserAccountForm from '../../models/userAccounts/UserAccountForm';
import UsernameField from '../controls/authentication/UsernameField';
import EmailAddressField from '../controls/authentication/EmailAddressField';
import PasswordField from '../controls/authentication/PasswordField';
import Button from '../../components/Button';
import Link from '../Link';
import FormPartition from '../controls/FormPartition';
import AuthServiceButton from '../AuthServiceButton';
import BrowserPopupResponseResponse from '../../models/auth/BrowserPopupResponseResponse';
import { Intent } from '../Toaster';
import AuthenticationError, {
	errorMessage as authenticationErrorMessage,
} from '../../models/auth/AuthenticationError';
import AuthServiceProvider from '../../models/auth/AuthServiceProvider';
import { getPromiseErrorMessage } from '../../format';

export type Form = Pick<
	UserAccountForm,
	'name' | 'email' | 'password' | 'captchaResponse'
> & { analyticsAction: string };
interface Props {
	analyticsAction: string;
	captcha: CaptchaBase;
	onCreateAccount: (form: Form) => Promise<void>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
	onSignIn: () => void;
	onSignInWithAuthService: (
		provider: AuthServiceProvider,
		analyticsAction: string
	) => Promise<BrowserPopupResponseResponse>;
}
enum GlobalError {
	Unknown,
	InvalidCaptcha,
}
interface State {
	email: string;
	emailError: string | null;
	globalError: GlobalError | null;
	isSubmitting: boolean;
	name: string;
	nameError: string | null;
	password: string;
	passwordError: string | null;
	showErrors: boolean;
}
export default class CreateAccountStep extends React.PureComponent<
	Props,
	State
> {
	private readonly _changeEmail = (email: string, emailError?: string) => {
		this.setState({
			email,
			emailError,
		});
	};
	private readonly _changeName = (name: string, nameError?: string) => {
		this.setState({
			name,
			nameError,
		});
	};
	private readonly _changePassword = (
		password: string,
		passwordError?: string
	) => {
		this.setState({
			password,
			passwordError,
		});
	};
	private readonly _createAccount = () => {
		if (this.state.isSubmitting) {
			return;
		}
		this.setState({
			showErrors: true,
		});
		if (
			this.state.emailError ||
			this.state.nameError ||
			this.state.passwordError
		) {
			return;
		}
		this.setState(
			{
				globalError: null,
				isSubmitting: true,
			},
			() => {
				this.props.captcha
					.execute('createUserAccount')
					.then((captchaResponse) =>
						this.props.onCreateAccount({
							email: this.state.email,
							name: this.state.name,
							password: this.state.password,
							captchaResponse,
							analyticsAction: this.props.analyticsAction,
						})
					)
					.catch((errors?: string[]) => {
						let nextState = {
							emailError: null as string,
							globalError: null as GlobalError,
							isSubmitting: false,
							nameError: null as string,
						};
						if (Array.isArray(errors)) {
							if (errors.includes('DuplicateName')) {
								nextState.nameError = 'Reader name already in use.';
							}
							if (errors.includes('DuplicateEmail')) {
								nextState.emailError = 'Email address already in use.';
							}
							if (errors.includes('InvalidCaptcha')) {
								nextState.globalError = GlobalError.InvalidCaptcha;
							}
						} else {
							nextState.globalError = GlobalError.Unknown;
						}
						this.setState(nextState);
					});
			}
		);
	};
	private readonly _signInWithAuthService = (provider: AuthServiceProvider) => {
		return this.props
			.onSignInWithAuthService(provider, this.props.analyticsAction)
			.then((response) => {
				if (response.error != null) {
					this.props.onShowToast(
						authenticationErrorMessage[response.error],
						response.error === AuthenticationError.Cancelled
							? Intent.Neutral
							: Intent.Danger
					);
				}
				return response;
			})
			.catch((reason) => {
				this.props.onShowToast(getPromiseErrorMessage(reason), Intent.Danger);
			});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			emailError: null,
			globalError: null,
			isSubmitting: false,
			name: '',
			nameError: null,
			password: '',
			passwordError: null,
			showErrors: false,
		};
	}
	public componentDidMount() {
		this.props.captcha.showBadge();
	}
	public componentWillUnmount() {
		this.props.captcha.hideBadge();
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.InvalidCaptcha:
				globalError = 'Invalid captcha. Please try again.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		return (
			<div className="create-account-step_wf72jc">
				<h1>Create Account</h1>
				<UsernameField
					autoFocus
					error={this.state.nameError}
					onChange={this._changeName}
					onEnterKeyPressed={this._createAccount}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				<EmailAddressField
					error={this.state.emailError}
					onChange={this._changeEmail}
					onEnterKeyPressed={this._createAccount}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					error={this.state.passwordError}
					onChange={this._changePassword}
					onEnterKeyPressed={this._createAccount}
					showError={this.state.showErrors}
					value={this.state.password}
				/>
				{globalError ? <div className="global-error">{globalError}</div> : null}
				<Button
					align="center"
					display="block"
					intent="loud"
					onClick={this._createAccount}
					size="large"
					state={this.state.isSubmitting ? 'busy' : 'normal'}
					text="Create Account"
				/>
				<FormPartition />
				<AuthServiceButton
					onClick={this._signInWithAuthService}
					provider={AuthServiceProvider.Apple}
				/>
				<AuthServiceButton
					onClick={this._signInWithAuthService}
					provider={AuthServiceProvider.Twitter}
				/>
				<Link
					onClick={this.props.onSignIn}
					state={this.state.isSubmitting ? 'disabled' : 'normal'}
					text="Already have an account?"
				/>
			</div>
		);
	}
}
