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
import InstallExtensionStep from './OnboardingFlow/InstallExtensionStep';
import { DeviceType, isCompatibleBrowser } from '../../../common/DeviceType';
import ExtensionInstalledStep from './OnboardingFlow/ExtensionInstalledStep';
import ButtonTutorialStep from './OnboardingFlow/ButtonTutorialStep';
import TrackingAnimationStep from './OnboardingFlow/TrackingAnimationStep';
import BrowserOnboardingFlow, {
	BaseProps,
	ExitReason,
} from '../../../common/components/BrowserOnboardingFlow';
import { Intent } from '../../../common/components/Toaster';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import ImportStep from './OnboardingFlow/ImportStep';
import NotificationsStep from './OnboardingFlow/NotificationsStep';
import NotificationAuthorizationRequestResult from '../../../common/models/app/NotificationAuthorizationRequestResult';
import { AppPlatform } from '../../../common/AppPlatform';
import AuthServiceCredentialAuthResponse, { isAuthServiceCredentialAuthTokenResponse } from '../../../common/models/auth/AuthServiceCredentialAuthResponse';

export enum Step {
	CreateAccount,
	SignIn,
	CreateAuthServiceAccount,
	LinkAccount,
	RequestPasswordReset,
	ResetPassword,
	InstallExtension,
	ExtensionInstalled,
	ButtonTutorial,
	TrackingAnimation,
	Import,
	Notifications
}
export interface Props extends BaseProps {
	analyticsAction?: string;
	appPlatform: AppPlatform | null;
	authServiceToken?: string;
	captcha: CaptchaBase;
	deviceType: DeviceType;
	initialAuthenticationStep?: Step.CreateAccount | Step.SignIn;
	isExtensionInstalled: boolean;
	onCreateAccount: (form: CreateAccountForm) => Promise<void>;
	onCreateAuthServiceAccount: (
		form: CreateAuthServiceAccountForm
	) => Promise<void>;
	onCreateStaticContentUrl: (path: string) => string;
	onRequestNotificationAuthorization: () => Promise<NotificationAuthorizationRequestResult>;
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
	passwordResetEmail?: string;
	passwordResetToken?: string;
}
export default class OnboardingFlow extends BrowserOnboardingFlow<Props> {
	private _authServiceToken: string;
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
	private readonly _goToButtonTutorialStep = () => {
		this.goToStep(Step.ButtonTutorial);
	};
	private readonly _goToLinkAccountStep = () => {
		this.goToStep(Step.LinkAccount);
	};
	private readonly _goToNotificationsStep = () => {
		this.goToStep(Step.Notifications);
	};
	private readonly _goToPasswordResetRequestStep = () => {
		this.goToStep(Step.RequestPasswordReset);
	};
	private readonly _goToSignInStep = () => {
		this.goToStep(Step.SignIn);
	};
	private readonly _goToTrackingAnimationStep = () => {
		this.goToStep(Step.TrackingAnimation);
	};
	private readonly _handleAccountCreation = () => {
		if (this.props.appPlatform != null) {
			this.goToStep(Step.TrackingAnimation);
		} else if (this.props.isExtensionInstalled) {
			this.goToStep(Step.ExtensionInstalled);
		} else {
			this.goToStep(Step.InstallExtension);
		}
	};
	private readonly _handleExistingUserAuthentication = () => {
		if (this.props.appPlatform != null) {
			if (this.props.user.dateOrientationCompleted == null) {
				this.goToStep(Step.TrackingAnimation);
			} else {
				this._beginClosing(ExitReason.ExistingUserAuthenticated);
			}
		} else if (
			this.props.isExtensionInstalled &&
			this.props.user.dateOrientationCompleted
		) {
			this._beginClosing(ExitReason.ExistingUserAuthenticated);
		} else if (!this.props.isExtensionInstalled) {
			this.goToStep(Step.InstallExtension);
		} else {
			this.goToStep(Step.ExtensionInstalled);
		}
	};
	private readonly _handleTrackingAnimationStepCompletion = () => {
		switch (this.props.appPlatform) {
			case AppPlatform.Ios:
				this.goToStep(Step.Import);
				break;
			case AppPlatform.MacOs:
				this.goToStep(Step.Notifications);
				break;
			default:
				this._complete();
				break;
		}
	};
	private readonly _requestNotificationAuthorization = () => {
		this.props
			.onRequestNotificationAuthorization()
			.then(this._complete)
			.catch(this._complete);
	};
	private readonly _resetPassword = (token: string, email: string) => {
		return this.props.onResetPassword(token, email).then(() => {
			this._beginClosing(ExitReason.Aborted);
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
		[Step.ResetPassword]: (_: UserAccount) => (
			<ResetPasswordStep
				email={this.props.passwordResetEmail}
				onResetPassword={this._resetPassword}
				token={this.props.passwordResetToken}
			/>
		),
		[Step.InstallExtension]: (_: UserAccount) => (
			<InstallExtensionStep
				deviceType={this.props.deviceType}
				onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
				onSkip={this._goToTrackingAnimationStep}
			/>
		),
		[Step.ExtensionInstalled]: (_: UserAccount) => (
			<ExtensionInstalledStep
				deviceType={this.props.deviceType}
				onContinue={this._goToButtonTutorialStep}
				onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
			/>
		),
		[Step.ButtonTutorial]: (_: UserAccount) => (
			<ButtonTutorialStep onContinue={this._goToTrackingAnimationStep} />
		),
		[Step.TrackingAnimation]: (_: UserAccount) => (
			<TrackingAnimationStep onContinue={this._handleTrackingAnimationStepCompletion} />
		),
		[Step.Import]: (_: UserAccount) => (
			<ImportStep
				onContinue={this._goToNotificationsStep}
				onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
			/>
		),
		[Step.Notifications]: (_: UserAccount) => (
			<NotificationsStep
				onRequestAuthorization={this._requestNotificationAuthorization}
				onSkip={this._complete}
			/>
		)
	};
	constructor(props: Props) {
		super(props);
		this._authServiceToken = props.authServiceToken;
		this.state = {
			...this.state,
			step: !props.user
				? props.authServiceToken
					? Step.CreateAuthServiceAccount
					: props.passwordResetToken
					? Step.ResetPassword
					: props.initialAuthenticationStep != null
					? props.initialAuthenticationStep
					: Step.SignIn
				: props.appPlatform != null
				? Step.TrackingAnimation
				: !props.isExtensionInstalled
					? Step.InstallExtension
					: Step.ExtensionInstalled,
		};
	}
	protected getStepRenderer(step: Step) {
		return this._stepMap[step];
	}
	protected shouldAllowCancellation() {
		return (
			!this.props.user ||
			!isCompatibleBrowser(this.props.deviceType) ||
			this.state.step === Step.InstallExtension
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.state.step === Step.InstallExtension &&
			this.props.isExtensionInstalled &&
			!prevProps.isExtensionInstalled
		) {
			this._abort();
		}
	}
}
