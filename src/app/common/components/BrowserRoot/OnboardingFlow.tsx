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
import TwitterStep from './OnboardingFlow/TwitterStep';
import BrowserOnboardingFlow, { BaseProps, ExitReason } from '../../../../common/components/BrowserOnboardingFlow';

export enum Step {
	Twitter,
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
	initialAuthenticationStep?: Step.Twitter | Step.SignIn,
	isExtensionInstalled: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onCreateAccount: (form: CreateAccountForm) => Promise<void>,
	onCreateAuthServiceAccount: (form: CreateAuthServiceAccountForm) => Promise<void>,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>,
	onResetPassword: (token: string, email: string) => Promise<void>,
	onShare: (data: ShareData) => ShareResponse,
	onSignIn: (form: SignInForm) => Promise<void>,
	onSignInWithApple: (analyticsAction: string) => void,
	onSignInWithTwitter: (analyticsAction: string) => Promise<{}>,
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
	private readonly _imageBasePath = '/images/';
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
	private readonly _stepMap = {
		[Step.Twitter]: (_: UserAccount) => (
			<TwitterStep
				analyticsAction={this.props.analyticsAction}
				onSignIn={this._goToSignInStep}
				onSignInWithTwitter={this.props.onSignInWithTwitter}
				onSkip={this._goToCreateAccountStep}
			/>
		),
		[Step.CreateAccount]: (_: UserAccount) => (
			<CreateAccountStep
				analyticsAction={this.props.analyticsAction}
				captcha={this.props.captcha}
				imageBasePath={this._imageBasePath}
				onCreateAccount={this._createAccount}
				onSignIn={this._goToSignInStep}
				onSignInWithApple={this.props.onSignInWithApple}
				onSignInWithTwitter={this.props.onSignInWithTwitter}
			/>
		),
		[Step.SignIn]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				imageBasePath={this._imageBasePath}
				onCreateAccount={this._goToCreateAccountStep}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onSignIn={this._signIn}
				onSignInWithApple={this.props.onSignInWithApple}
				onSignInWithTwitter={this.props.onSignInWithTwitter}
			/>
		),
		[Step.CreateAuthServiceAccount]: (_: UserAccount) => (
			<CreateAuthServiceAccountStep
				authServiceToken={this.props.authServiceToken}
				onCreateAuthServiceAccount={this._createAuthServiceAccount}
				onLinkExistingAccount={this._goToLinkAccountStep}
			/>
		),
		[Step.LinkAccount]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				authServiceToken={this.props.authServiceToken}
				imageBasePath={this._imageBasePath}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
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
								Step.Twitter :
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