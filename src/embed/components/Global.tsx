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
import DialogManager from '../../common/components/DialogManager';
import Toaster, { Intent, Toast } from '../../common/components/Toaster';
import ClipboardTextInput from '../../common/components/ClipboardTextInput';
import DialogService, {
	DialogState,
} from '../../common/services/DialogService';
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
import AuthServiceProvider from '../../common/models/auth/AuthServiceProvider';
import BrowserPopupResponseResponse from '../../common/models/auth/BrowserPopupResponseResponse';
import KeyValuePair from '../../common/KeyValuePair';

export enum GlobalError {
	None,
	ArticleLookupFailure,
	UserSignedOut,
}
export interface Props {
	article: UserArticle;
	captcha: CaptchaBase;
	clipboardService: ClipboardService;
	dialogs: KeyValuePair<number, DialogState>[];
	dialogService: DialogService<{}>;
	error: string | null;
	onboardingAnalyticsAction: string | null;
	onCloseOnboarding: (reason: ExitReason) => void;
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
	toasterService: ToasterService;
	toasts: Toast[];
	user: UserAccount | null;
}
export default (props: Props) => (
	<div className={classNames('global_lutpij', { error: !!props.error })}>
		<ProgressIndicator article={props.article} />
		{props.onboardingAnalyticsAction ? (
			<OnboardingFlow
				analyticsAction={props.onboardingAnalyticsAction}
				captcha={props.captcha}
				onClose={props.onCloseOnboarding}
				onCreateAccount={props.onCreateAccount}
				onCreateAuthServiceAccount={props.onCreateAuthServiceAccount}
				onRequestPasswordReset={props.onRequestPasswordReset}
				onShowToast={props.onShowToast}
				onSignIn={props.onSignIn}
				onSignInWithAuthService={props.onSignInWithAuthService}
				user={props.user}
			/>
		) : null}
		<DialogManager
			dialogs={props.dialogs}
			onGetDialogRenderer={props.dialogService.getDialogRenderer}
			onTransitionComplete={props.dialogService.handleTransitionCompletion}
			sharedState={{}}
		/>
		<Toaster
			onRemoveToast={props.toasterService.removeToast}
			toasts={props.toasts}
		/>
		<ClipboardTextInput onSetRef={props.clipboardService.setTextInputRef} />
		{props.error ? (
			<InfoBox style="warning">
				<p>An error occurred while processing the article:</p>
				<p>{props.error}</p>
			</InfoBox>
		) : null}
	</div>
);
