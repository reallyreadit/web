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
import UserAccount from '../../../common/models/UserAccount';
import CreateAccountStep, {
	Form as CreateAccountForm,
} from '../../../common/components/BrowserOnboardingFlow/CreateAccountStep';
import CaptchaBase from '../../../common/captcha/CaptchaBase';
import SignInStep, {
	Form as SignInForm,
} from '../../../common/components/BrowserOnboardingFlow/SignInStep';
import PasswordResetRequestForm from '../../../common/models/userAccounts/PasswordResetRequestForm';
import RequestPasswordResetStep from '../../../common/components/BrowserOnboardingFlow/RequestPasswordResetStep';
import CreateAuthServiceAccountStep, {
	Form as CreateAuthServiceAccountForm,
} from '../../../common/components/BrowserOnboardingFlow/CreateAuthServiceAccountStep';
import ResetPasswordStep from './OnboardingFlow/ResetPasswordStep';
import Flow, {
	BaseProps,
} from '../../../common/components/Flow';
import { Intent } from '../../../common/components/Toaster';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceCredentialAuthResponse, { isAuthServiceCredentialAuthTokenResponse } from '../../../common/models/auth/AuthServiceCredentialAuthResponse';

export enum Step {
	CreateAccount,
	SignIn,
	CreateAuthServiceAccount,
	LinkAccount,
	RequestPasswordReset,
	ResetPassword,
}
interface CommonProps extends BaseProps {
	captcha: CaptchaBase;
	onCreateAccount: (form: CreateAccountForm) => Promise<void>;
	onCreateAuthServiceAccount: (
		form: CreateAuthServiceAccountForm
	) => Promise<void>;
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>;
	onResetPassword: (token: string, email: string) => Promise<void>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
	onSignIn: (form: SignInForm) => Promise<void>;
	onSignInWithApple: (
		analyticsAction: string
	) => Promise<AuthServiceCredentialAuthResponse>;
	onSignInWithTwitter: (
		analyticsAction: string
	) => Promise<AuthServiceCredentialAuthResponse>;
}
type AuthServiceTokenProps = CommonProps & {
	authServiceToken: string;
};
type AuthenticationProps = CommonProps & {
	analyticsAction?: string;
	initialAuthenticationStep: Step.CreateAccount | Step.SignIn;
};
type ResetPasswordProps = CommonProps & {
	passwordResetEmail: string;
	passwordResetToken: string;
};
export type Props = AuthServiceTokenProps | AuthenticationProps | ResetPasswordProps;
function isAuthServiceTokenProps(props: Props): props is AuthServiceTokenProps {
	return 'authServiceToken' in props;
}
function isAuthenticationProps(props: Props): props is AuthenticationProps {
	return 'initialAuthenticationStep' in props;
}
function isResetPasswordProps(props: Props): props is ResetPasswordProps {
	return 'passwordResetEmail' in props && 'passwordResetToken' in props;
}
export default class OnboardingFlow extends Flow<Props> {
	private _authServiceToken: string | null;
	private readonly _analyticsAction: string | null;
	private readonly _passwordResetEmail: string | null;
	private readonly _passwordResetToken: string | null;
	private readonly _createAccount = (form: CreateAccountForm) => {
		return this.props.onCreateAccount(form).then(this._handleAccountCreation);
	};
	private readonly _createAuthServiceAccount = (
		form: CreateAuthServiceAccountForm
	) => {
		return this.props
			.onCreateAuthServiceAccount(form)
			.then(this._handleAccountCreation);
	};
	private readonly _goToCreateAccountStep = () => {
		this.goToStep(Step.CreateAccount);
	};
	private readonly _goToLinkAccountStep = () => {
		this.goToStep(Step.LinkAccount);
	};
	private readonly _goToPasswordResetRequestStep = () => {
		this.goToStep(Step.RequestPasswordReset);
	};
	private readonly _goToSignInStep = () => {
		this.goToStep(Step.SignIn);
	};
	private readonly _handleAccountCreation = () => {
		this._complete();
	};
	private readonly _handleExistingUserAuthentication = () => {
		this._complete();
	};
	private readonly _resetPassword = (token: string, email: string) => {
		return this.props.onResetPassword(token, email).then(() => {
			this._abort();
		});
	};
	private readonly _signIn = (form: SignInForm) => {
		return this.props
			.onSignIn(form)
			.then(this._handleExistingUserAuthentication);
	};
	private readonly _signInWithAuthService = (
		provider: AuthServiceProvider,
		analyticsAction: string
	) => {
		let onSignIn: (analyticsAction: string) => Promise<AuthServiceCredentialAuthResponse>;
		switch (provider) {
			case AuthServiceProvider.Apple:
				onSignIn = this.props.onSignInWithApple;
				break;
			case AuthServiceProvider.Twitter:
				onSignIn = this.props.onSignInWithTwitter;
				break;
			default:
				throw new Error('Unexpected auth service provider.');
		}
		return onSignIn(analyticsAction).then(res => {
			if (isAuthServiceCredentialAuthTokenResponse(res)) {
				this._authServiceToken = res.authServiceToken;
				this.goToStep(Step.CreateAuthServiceAccount);
			} else {
				this._handleExistingUserAuthentication();
			}
		});
	};
	private readonly _stepMap = {
		[Step.CreateAccount]: (_: UserAccount) => (
			<CreateAccountStep
				analyticsAction={this._analyticsAction}
				captcha={this.props.captcha}
				onCreateAccount={this._createAccount}
				onShowToast={this.props.onShowToast}
				onSignIn={this._goToSignInStep}
				onSignInWithAuthService={this._signInWithAuthService}
			/>
		),
		[Step.SignIn]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this._analyticsAction}
				onCreateAccount={this._goToCreateAccountStep}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onShowToast={this.props.onShowToast}
				onSignIn={this._signIn}
				onSignInWithAuthService={this._signInWithAuthService}
			/>
		),
		[Step.CreateAuthServiceAccount]: (_: UserAccount) => (
			<CreateAuthServiceAccountStep
				analyticsAction={this._analyticsAction}
				authServiceToken={this._authServiceToken}
				onCreateAuthServiceAccount={this._createAuthServiceAccount}
				onLinkExistingAccount={this._goToLinkAccountStep}
			/>
		),
		[Step.LinkAccount]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this._analyticsAction}
				authServiceToken={this._authServiceToken}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onShowToast={this.props.onShowToast}
				onSignIn={this._signIn}
			/>
		),
		[Step.RequestPasswordReset]: (_: UserAccount) => (
			<RequestPasswordResetStep
				authServiceToken={this._authServiceToken}
				captcha={this.props.captcha}
				onRequestPasswordReset={this.props.onRequestPasswordReset}
			/>
		),
		[Step.ResetPassword]: (_: UserAccount) => (
			<ResetPasswordStep
				email={this._passwordResetEmail}
				onResetPassword={this._resetPassword}
				token={this._passwordResetToken}
			/>
		),
	};
	constructor(props: Props) {
		super(props);
		let step: Step;
		if (isAuthServiceTokenProps(props)) {
			step = Step.CreateAuthServiceAccount;
			this._authServiceToken = props.authServiceToken;
		} else if (isAuthenticationProps(props)) {
			step = props.initialAuthenticationStep;
			this._analyticsAction = props.analyticsAction;
		} else if (isResetPasswordProps(props)) {
			step = Step.ResetPassword;
			this._passwordResetEmail = props.passwordResetEmail;
			this._passwordResetToken = props.passwordResetToken;
		} else {
			throw new Error('Unexpected props type.');
		}
		this.state = {
			...this.state,
			step
		};
	}
	protected getStepRenderer(step: Step) {
		return this._stepMap[step];
	}
	protected shouldAllowCancellation() {
		return true;
	}
}
