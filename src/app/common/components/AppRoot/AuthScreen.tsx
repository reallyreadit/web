import * as React from 'react';
import CaptchaBase from '../../../../common/captcha/CaptchaBase';
import { Intent } from '../../../../common/components/Toaster';
import Icon from '../../../../common/components/Icon';
import CreateAccountDialog, { Form as CreateAccountDialogForm } from '../CreateAccountDialog';
import SignInDialog, { Form as SignInDialogForm } from '../SignInDialog';
import SpinnerIcon from '../../../../common/components/SpinnerIcon';
import classNames from 'classnames';
import { AuthStatus, AuthStep } from '../AppRoot';
import AuthServiceButton from '../../../../common/components/AuthServiceButton';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';

const authProviderNames = {
	[AuthServiceProvider.Apple]: 'Apple ID',
	[AuthServiceProvider.Twitter]: 'Twitter'
};
interface Props {
	authStatus: AuthStatus,
	captcha: CaptchaBase,
	onCloseDialog: () => void,
	onCreateAccount: (form: CreateAccountDialogForm) => Promise<void>,
	onOpenDialog: (element: React.ReactNode) => void,
	onOpenRequestPasswordResetDialog: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSignIn: (form: SignInDialogForm) => Promise<void>,
	onSignInWithApple: () => void,
	onSignInWithTwitter: () => Promise<{}>
}
export default class extends React.PureComponent<Props> {
	private readonly _openCreateAccountDialog = () => {
		this.props.onOpenDialog(
			<CreateAccountDialog
				analyticsAction="AuthScreen"
				autoFocus={false}
				captcha={this.props.captcha}
				onCreateAccount={this.props.onCreateAccount}
				onCloseDialog={this.props.onCloseDialog}
				onShowToast={this.props.onShowToast}
				onSignIn={
					() => this.props.onOpenDialog(
						<SignInDialog
							analyticsAction="AuthScreen"
							autoFocus={false}
							onCloseDialog={this.props.onCloseDialog}
							onOpenPasswordResetDialog={this.props.onOpenRequestPasswordResetDialog}
							onShowToast={this.props.onShowToast}
							onSignIn={this.props.onSignIn}
						/>
					)
				}
			/>
		);
	};
	public render() {
		return (
			<div className="auth-screen_gnq77a">
				<div className="content">
					<div className="logo"></div>
					<div className={
						classNames(
							'status',
							{
								'hidden': !this.props.authStatus
							}
						)
					}>
						{this.props.authStatus ?
							this.props.authStatus.step === AuthStep.Authenticating ?
								<>
									<SpinnerIcon /> Signing in with {authProviderNames[this.props.authStatus.provider]}
								</> :
								`Error signing in with ${authProviderNames[this.props.authStatus.provider]}` :
							null}
					</div>
					{/* <h2>Welcome to Readup!</h2> */}
					<div className="welcome-text">
						<p className="welcome-text__summary">Hi! Log in or create an account</p>
						<p className="welcome-text__free-trial small-font">Creating an account starts your free trial.<br/>No commitment or credit card required!</p>
					</div>
					<AuthServiceButton
						onClick={this.props.onSignInWithTwitter}
						provider={AuthServiceProvider.Twitter}
					/>
					<div className="twitter-notice small-font">Recommended. We'll never tweet without your permission.</div>
					<AuthServiceButton
						onClick={this.props.onSignInWithApple}
						provider={AuthServiceProvider.Apple}
					/>
					<div className="email-button" onClick={this._openCreateAccountDialog}>
						<Icon name="at-sign" /> Sign in with Email
					</div>
				</div>
			</div>
		);
	}
}