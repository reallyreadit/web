import * as React from 'react';
import Captcha from '../../Captcha';
import { Intent } from '../../../../common/components/Toaster';
import AppleIdButton from '../../../../common/components/AppleIdButton';
import Icon from '../../../../common/components/Icon';
import CreateAccountDialog, { Form as CreateAccountDialogForm } from '../CreateAccountDialog';
import SignInDialog, { Form as SignInDialogForm } from '../SignInDialog';
import SpinnerIcon from '../../../../common/components/SpinnerIcon';
import classNames from 'classnames';
import { AppleIdAuthState } from '../AppRoot';

interface Props {
	appleIdAuthState: AppleIdAuthState,
	captcha: Captcha,
	onCloseDialog: () => void,
	onCreateAccount: (form: CreateAccountDialogForm) => Promise<void>,
	onOpenDialog: (element: React.ReactNode) => void,
	onOpenRequestPasswordResetDialog: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSignIn: (form: SignInDialogForm) => Promise<void>,
	onSignInWithApple: () => void
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
					<img
						alt="logo"
						src="/images/logo.svg"
					/>
					<div className={
						classNames(
							'apple-id-auth',
							{ 'hidden': this.props.appleIdAuthState === AppleIdAuthState.None }
						)
					}>
						{this.props.appleIdAuthState === AppleIdAuthState.Authenticating ?
							<>
								<SpinnerIcon /> Signing in with Apple ID
							</> :
							'Error signing in with Apple ID'}
					</div>
					<AppleIdButton onClick={this.props.onSignInWithApple} />
					<div className="email-button" onClick={this._openCreateAccountDialog}>
						<Icon name="at-sign" /> Sign in with Email
					</div>
				</div>
			</div>
		);
	}
}