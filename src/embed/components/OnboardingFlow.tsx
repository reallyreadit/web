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
import CaptchaBase from '../../common/captcha/CaptchaBase';
import Flow, {
	BaseProps,
} from '../../common/components/Flow';
import CreateAccountStep, {
	Form as CreateAccountForm,
} from '../../common/components/BrowserOnboardingFlow/CreateAccountStep';
import CreateAuthServiceAccountStep, {
	Form as CreateAuthServiceAccountForm,
} from '../../common/components/BrowserOnboardingFlow/CreateAuthServiceAccountStep';
import RequestPasswordResetStep from '../../common/components/BrowserOnboardingFlow/RequestPasswordResetStep';
import SignInStep, {
	Form as SignInForm,
} from '../../common/components/BrowserOnboardingFlow/SignInStep';
import { Intent } from '../../common/components/Toaster';
import AuthServiceProvider from '../../common/models/auth/AuthServiceProvider';
import BrowserPopupResponseResponse from '../../common/models/auth/BrowserPopupResponseResponse';
import UserAccount from '../../common/models/UserAccount';
import PasswordResetRequestForm from '../../common/models/userAccounts/PasswordResetRequestForm';

enum Step {
	CreateAccount,
	SignIn,
	CreateAuthServiceAccount,
	LinkAccount,
	RequestPasswordReset,
}
interface Props extends BaseProps {
	analyticsAction: string;
	captcha: CaptchaBase;
	onCreateAccount: (form: CreateAccountForm) => Promise<void>;
	onCreateAuthServiceAccount: (
		form: CreateAuthServiceAccountForm
	) => Promise<void>;
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
	onSignIn: (form: SignInForm) => Promise<void>;
	onSignInWithAuthService: (
		provider: AuthServiceProvider
	) => Promise<BrowserPopupResponseResponse>;
}
export default class OnboardingFlow extends Flow<Props> {
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
		this._abort();
	};
	private readonly _signIn = (form: SignInForm) => {
		return this.props
			.onSignIn(form)
			.then(this._handleExistingUserAuthentication);
	};
	private readonly _signInWithAuthService = (provider: AuthServiceProvider) =>
		this.props.onSignInWithAuthService(provider).then((response) => {
			if (response.error) {
				// handle in calling component
			} else if (response.authServiceToken) {
				// switch to auth service account creation step
				this._authServiceToken = response.authServiceToken;
				this.goToStep(Step.CreateAuthServiceAccount);
			} else {
				// user was signed in
				this._handleExistingUserAuthentication();
			}
			return response;
		});
	private readonly _stepMap = {
		[Step.CreateAccount]: (_: UserAccount) => (
			<CreateAccountStep
				analyticsAction={this.props.analyticsAction}
				captcha={this.props.captcha}
				onCreateAccount={this._createAccount}
				onShowToast={this.props.onShowToast}
				onSignIn={this._goToSignInStep}
				onSignInWithAuthService={this._signInWithAuthService}
			/>
		),
		[Step.SignIn]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				onCreateAccount={this._goToCreateAccountStep}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onShowToast={this.props.onShowToast}
				onSignIn={this._signIn}
				onSignInWithAuthService={this._signInWithAuthService}
			/>
		),
		[Step.CreateAuthServiceAccount]: (_: UserAccount) => (
			<CreateAuthServiceAccountStep
				analyticsAction={this.props.analyticsAction}
				authServiceToken={this._authServiceToken}
				onCreateAuthServiceAccount={this._createAuthServiceAccount}
				onLinkExistingAccount={this._goToLinkAccountStep}
			/>
		),
		[Step.LinkAccount]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
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
	};
	private _authServiceToken: string | null;
	constructor(props: Props) {
		super(props);
		this.state = {
			...this.state,
			step: Step.CreateAccount,
		};
	}
	protected getStepRenderer(step: Step) {
		return this._stepMap[step];
	}
}
