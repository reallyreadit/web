import * as React from 'react';
import CaptchaBase from '../../common/captcha/CaptchaBase';
import BrowserOnboardingFlow, { BaseProps, ExitReason } from '../../common/components/BrowserOnboardingFlow';
import CreateAccountStep, { Form as CreateAccountForm } from '../../common/components/BrowserOnboardingFlow/CreateAccountStep';
import CreateAuthServiceAccountStep, { Form as CreateAuthServiceAccountForm } from '../../common/components/BrowserOnboardingFlow/CreateAuthServiceAccountStep';
import RequestPasswordResetStep from '../../common/components/BrowserOnboardingFlow/RequestPasswordResetStep';
import SignInStep, { Form as SignInForm } from '../../common/components/BrowserOnboardingFlow/SignInStep';
import UserAccount from '../../common/models/UserAccount';
import PasswordResetRequestForm from '../../common/models/userAccounts/PasswordResetRequestForm';

enum Step {
	CreateAccount,
	SignIn,
	CreateAuthServiceAccount,
	LinkAccount,
	RequestPasswordReset
}
interface Props extends BaseProps {
	analyticsAction: string,
	captcha: CaptchaBase,
	imageBasePath: string,
	onCreateAccount: (form: CreateAccountForm) => Promise<void>,
	onCreateAuthServiceAccount: (form: CreateAuthServiceAccountForm) => Promise<void>,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>,
	onSignIn: (form: SignInForm) => Promise<void>,
	onSignInWithApple: (analyticsAction: string) => void,
	onSignInWithTwitter: (analyticsAction: string) => Promise<{}>
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
		this.props.onClose(ExitReason.ExistingUserAuthenticated);
	};
	private readonly _handleExistingUserAuthentication = () => {
		this.props.onClose(ExitReason.ExistingUserAuthenticated);
	};
	private readonly _signIn = (form: SignInForm) => {
		return this.props
			.onSignIn(form)
			.then(this._handleExistingUserAuthentication);
	};
	private readonly _stepMap = {
		[Step.CreateAccount]: (_: UserAccount) => (
			<CreateAccountStep
				analyticsAction={this.props.analyticsAction}
				captcha={this.props.captcha}
				imageBasePath={this.props.imageBasePath}
				onCreateAccount={this._createAccount}
				onSignIn={this._goToSignInStep}
				onSignInWithApple={this.props.onSignInWithApple}
				onSignInWithTwitter={this.props.onSignInWithTwitter}
			/>
		),
		[Step.SignIn]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				imageBasePath={this.props.imageBasePath}
				onCreateAccount={this._goToCreateAccountStep}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onSignIn={this._signIn}
				onSignInWithApple={this.props.onSignInWithApple}
				onSignInWithTwitter={this.props.onSignInWithTwitter}
			/>
		),
		[Step.CreateAuthServiceAccount]: (_: UserAccount) => (
			<CreateAuthServiceAccountStep
				authServiceToken={''}
				onCreateAuthServiceAccount={this._createAuthServiceAccount}
				onLinkExistingAccount={this._goToLinkAccountStep}
			/>
		),
		[Step.LinkAccount]: (_: UserAccount) => (
			<SignInStep
				analyticsAction={this.props.analyticsAction}
				authServiceToken={''}
				imageBasePath={this.props.imageBasePath}
				onRequestPasswordReset={this._goToPasswordResetRequestStep}
				onSignIn={this._signIn}
			/>
		),
		[Step.RequestPasswordReset]: (_: UserAccount) => (
			<RequestPasswordResetStep
				authServiceToken={''}
				captcha={this.props.captcha}
				onRequestPasswordReset={this.props.onRequestPasswordReset}
			/>
		)
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			...this.state,
			step: Step.CreateAccount
		};
	}
	protected getStepRenderer(step: Step) {
		return this._stepMap[step];
	}
	protected shouldAllowCancellation() {
		return true;
	}
}