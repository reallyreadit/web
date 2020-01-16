import * as React from 'react';
import FormDialog, { Props as FormDialogProps, State } from './controls/FormDialog';
import EmailAddressField from './controls/authentication/EmailAddressField';
import PasswordField from './controls/authentication/PasswordField';
import { Intent } from '../../../common/components/Toaster';
import SignInForm from '../../../common/models/userAccounts/SignInForm';
import AuthServiceDialogFooter from './AuthServiceDialogFooter';

interface Props {
	analyticsAction: string,
	authServiceToken?: string,
	autoFocus?: boolean,
	onOpenPasswordResetDialog: (authServiceToken?: string) => void,
	onSignIn: (form: Form) => Promise<void>,
	onSignInWithApple?: (analyticsAction: string) => void
}
export type Form = Pick<SignInForm, 'authServiceToken' | 'email' | 'password'> & { analyticsAction: string };
export default class SignInDialog extends FormDialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string,
	password?: string,
	passwordError?: string
}> {
	public static defaultProps: Partial<Props> = {
		autoFocus: true
	};
	private readonly _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	private readonly _handlePasswordChange = (password: string, passwordError: string) => this.setState({ password, passwordError });
	private readonly _openPasswordResetDialog = () => {
		this.props.onOpenPasswordResetDialog(this.props.authServiceToken);
	};
	private readonly _signInWithApple = () => {
		this.props.onSignInWithApple(this.props.analyticsAction);
	};
	constructor(props: Props & FormDialogProps) {
		super(
			{
				className: 'sign-in-dialog_rmrt01',
				title: (
					props.authServiceToken ?
						'Link Existing Account' :
						'Log In'
				),
				submitButtonText: (
					props.authServiceToken ?
						'Link Account' :
						'Log In'
				)
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<EmailAddressField
					autoFocus={this.props.autoFocus}
					error={this.state.emailError}
					onChange={this._handleEmailChange}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					value={this.state.password}
					error={this.state.passwordError}
					showError={this.state.showErrors}
					onChange={this._handlePasswordChange}
				/>
				<div className="link">
					<span onClick={this._openPasswordResetDialog}>Forgot your password?</span>
				</div>
			</>
		);
	}
	protected renderFooter() {
		if (this.props.onSignInWithApple) {
			return (
				<AuthServiceDialogFooter
					onSignInWithApple={this._signInWithApple}
				/>
			);
		}
		return null;
	}
	protected getClientErrors() {
		return [{
			email: this.state.emailError,
			password: this.state.passwordError
		}];
	}
	protected submitForm() {
		return this.props.onSignIn({
			authServiceToken: this.props.authServiceToken,
			email: this.state.email,
			password: this.state.password,
			analyticsAction: this.props.analyticsAction
		});
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'UserAccountNotFound')) {
			this.setState({ emailError: 'User account not found.' });
		}
		if (errors.some(error => error === 'IncorrectPassword')) {
			this.setState({ passwordError: 'Incorrect password.' });
		}
		if (errors.some(error => error === 'InvalidSessionId')) {
			this.props.onShowToast('Invalid session id.', Intent.Danger);
		}
		if (errors.some(error => error === 'AuthenticationExpired')) {
			this.props.onShowToast(<>Authentication expired.<br />Please sign in again.</>, Intent.Danger);
		}
	}
}