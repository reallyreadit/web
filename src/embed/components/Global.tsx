import * as React from 'react';
import DialogManager from '../../common/components/DialogManager';
import Toaster, { Toast } from '../../common/components/Toaster';
import ClipboardTextInput from '../../common/components/ClipboardTextInput';
import DialogService, { Dialog } from '../../common/services/DialogService';
import ToasterService from '../../common/services/ToasterService';
import ClipboardService from '../../common/services/ClipboardService';
import InfoBox from '../../common/components/InfoBox';
import * as classNames from 'classnames';
import ProgressIndicator from './ProgressIndicator';
import UserArticle from '../../common/models/UserArticle';
import OnboardingFlow from './OnboardingFlow';
import UserAccount from '../../common/models/UserAccount';
import CaptchaBase from '../../common/captcha/CaptchaBase';
import { Form as CreateAccountForm } from '../../common/components/BrowserOnboardingFlow/CreateAccountStep';
import { Form as SignInForm } from '../../common/components/BrowserOnboardingFlow/SignInStep';
import { Form as CreateAuthServiceAccountForm } from '../../common/components/BrowserOnboardingFlow/CreateAuthServiceAccountStep';
import PasswordResetRequestForm from '../../common/models/userAccounts/PasswordResetRequestForm';
import { ExitReason } from '../../common/components/BrowserOnboardingFlow';

export enum GlobalError {
	None,
	ArticleLookupFailure,
	UserSignedOut
}
export interface Props {
	article: UserArticle,
	captcha: CaptchaBase,
	clipboardService: ClipboardService,
	dialogs: Dialog[],
	dialogService: DialogService,
	error: string | null,
	imageBasePath: string,
	isOnboarding: boolean,
	onCloseOnboarding: (reason: ExitReason) => void,
	onCreateAccount: (form: CreateAccountForm) => Promise<void>,
	onCreateAuthServiceAccount: (form: CreateAuthServiceAccountForm) => Promise<void>,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>,
	onSignIn: (form: SignInForm) => Promise<void>,
	onSignInWithApple: (analyticsAction: string) => void,
	onSignInWithTwitter: (analyticsAction: string) => Promise<{}>,
	toasterService: ToasterService,
	toasts: Toast[],
	user: UserAccount | null
}
export default (props: Props) => (
	<div className={classNames('global_lutpij', { 'error': !!props.error })}>
		<ProgressIndicator
			article={props.article}
		/>
		{props.isOnboarding ?
			<OnboardingFlow
				analyticsAction=""
				captcha={props.captcha}
				imageBasePath={props.imageBasePath}
				onClose={props.onCloseOnboarding}
				onCreateAccount={props.onCreateAccount}
				onCreateAuthServiceAccount={props.onCreateAuthServiceAccount}
				onRequestPasswordReset={props.onRequestPasswordReset}
				onSignIn={props.onSignIn}
				onSignInWithApple={props.onSignInWithApple}
				onSignInWithTwitter={props.onSignInWithTwitter}
				user={props.user}
			/> :
			null}
		<DialogManager
			dialogs={props.dialogs}
			onTransitionComplete={props.dialogService.handleTransitionCompletion}
		/>
		<Toaster
			onRemoveToast={props.toasterService.removeToast}
			toasts={props.toasts}
		/>
		<ClipboardTextInput onSetRef={props.clipboardService.setTextInputRef} />
		{props.error ?
			<InfoBox
				position="absolute"
				style="warning"
			>
				<p>An error occurred while processing the article:</p>
				<p>{props.error}</p>
			</InfoBox> :
			null}
	</div>
);