import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import CreateAccountStep, { Form as CreateAccountForm } from '../../../../common/components/BrowserOnboardingFlow/CreateAccountStep';
import CaptchaBase from '../../../../common/captcha/CaptchaBase';
import SignInStep, { Form as SignInForm } from '../../../../common/components/BrowserOnboardingFlow/SignInStep';
import PasswordResetRequestForm from '../../../../common/models/userAccounts/PasswordResetRequestForm';
import RequestPasswordResetStep from '../../../../common/components/BrowserOnboardingFlow/RequestPasswordResetStep';
import CreateAuthServiceAccountStep, { Form as CreateAuthServiceAccountForm } from '../../../../common/components/BrowserOnboardingFlow/CreateAuthServiceAccountStep';
import ResetPasswordStep from './OnboardingFlow/ResetPasswordStep';
import InstallExtensionStep from './OnboardingFlow/InstallExtensionStep';
import { DeviceType, isCompatibleBrowser } from '../../../../common/DeviceType';
import ExtensionInstalledStep from './OnboardingFlow/ExtensionInstalledStep';
import ButtonTutorialStep from './OnboardingFlow/ButtonTutorialStep';
import TrackingAnimationStep from './OnboardingFlow/TrackingAnimationStep';
import ShareStep from './OnboardingFlow/ShareStep';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import ShareData from '../../../../common/sharing/ShareData';
import BrowserOnboardingFlow, { BaseProps, ExitReason } from '../../../../common/components/BrowserOnboardingFlow';
import { Intent } from '../../../../common/components/Toaster';
import BrowserPopupResponseResponse from '../../../../common/models/auth/BrowserPopupResponseResponse';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';

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
	Share
}
export interface Props extends BaseProps {
	analyticsAction?: string,
	authServiceToken?: string,
	captcha: CaptchaBase,
	deviceType: DeviceType,
	initialAuthenticationStep?: Step.CreateAccount | Step.SignIn,
	isExtensionInstalled: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onCreateAccount: (form: CreateAccountForm) => Promise<void>,
	onCreateAuthServiceAccount: (form: CreateAuthServiceAccountForm) => Promise<void>,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>,
	onResetPassword: (token: string, email: string) => Promise<void>,
	onShare: (data: ShareData) => ShareResponse,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSignIn: (form: SignInForm) => Promise<void>,
	onSignInWithApple: (analyticsAction: string) => Promise<BrowserPopupResponseResponse>,
	onSignInWithTwitter: (analyticsAction: string) => Promise<BrowserPopupResponseResponse>,
	passwordResetEmail?: string,
	passwordResetToken?: string
}
export default class OnboardingFlow extends BrowserOnboardingFlow<Props> {
	private readonly _createAccount = (form: CreateAccountForm) => {
		return this.props
			.onCreateAccount(form)
			.then(this._handleAccountCreation);
	};
	private readonly _createAuthServiceAccount = (form: CreateAuthServiceAccountForm) => {
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
	private readonly _goToPasswordResetRequestStep = () => {
		this.goToStep(Step.RequestPasswordReset);
	};
	private readonly _goToShareStep = () => {
		this.goToStep(Step.Share);
	};
	private readonly _goToSignInStep = () => {
		this.goToStep(Step.SignIn);
	};
	private readonly _goToTrackingAnimationStep = () => {
		this.goToStep(Step.TrackingAnimation);
	};
	private readonly _handleAccountCreation = () => {
		if (this.props.isExtensionInstalled) {
			this.goToStep(Step.ExtensionInstalled);
		} else {
			this.goToStep(Step.InstallExtension);
		}
	};
	private readonly _handleExistingUserAuthentication = () => {
		if (
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
	private readonly _resetPassword = (token: string, email: string) => {
		return this.props
			.onResetPassword(token, email)
			.then(this._handleExistingUserAuthentication);
	};
	private readonly _signIn = (form: SignInForm) => {
		return this.props
			.onSignIn(form)
			.then(this._handleExistingUserAuthentication);
	};
	private readonly _signInWithAuthService = (provider: AuthServiceProvider, analyticsAction: string) => {
		switch (provider) {
			case AuthServiceProvider.Apple:
				return this.props.onSignInWithApple(analyticsAction);
			case AuthServiceProvider.Twitter:
				return this.props.onSignInWithTwitter(analyticsAction);
		}
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
				authServiceToken={this.props.authServiceToken}
				onCreateAuthServiceAccount={this._createAuthServiceAccount}
				onLinkExistingAccount={this._goToLinkAccountStep}
			/>
		),
		[Step.LinkAccount]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				authServiceToken={this.props.authServiceToken}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onShowToast={this.props.onShowToast}
				onSignIn={this._signIn}
			/>
		),
		[Step.RequestPasswordReset]: (_: UserAccount) => (
			<RequestPasswordResetStep
				authServiceToken={this.props.authServiceToken}
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
			/>
		),
		[Step.ExtensionInstalled]: (_: UserAccount) => (
			<ExtensionInstalledStep
				deviceType={this.props.deviceType}
				onContinue={this._goToButtonTutorialStep}
			/>
		),
		[Step.ButtonTutorial]: (_: UserAccount) => (
			<ButtonTutorialStep
				onContinue={this._goToTrackingAnimationStep}
			/>
		),
		[Step.TrackingAnimation]: (_: UserAccount) => (
			<TrackingAnimationStep
				onContinue={this._goToShareStep}
			/>
		),
		[Step.Share]: (user: UserAccount) => (
			<ShareStep
				onContinue={this._complete}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onShare={this.props.onShare}
				user={user}
			/>
		)
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			...this.state,
			step: (
				!props.user ?
					props.authServiceToken ?
						Step.CreateAuthServiceAccount :
						props.passwordResetToken ?
							Step.ResetPassword :
							props.initialAuthenticationStep != null ?
								props.initialAuthenticationStep :
								Step.CreateAccount :
					!props.isExtensionInstalled ?
						Step.InstallExtension :
						Step.ExtensionInstalled
			)
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