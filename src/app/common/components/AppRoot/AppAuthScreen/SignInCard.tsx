import * as React from 'react';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import PasswordField from '../../controls/authentication/PasswordField';
import AppScreenButton from '../../controls/AppScreenButton';

export default class extends React.PureComponent<{
	onShowCreateAccountCard: () => void,
	onSignIn: (email: string, password: string) => Promise<void>
}, {
	email: string,
	emailError: string | null,
	isSubmitting: boolean,
	password: string,
	passwordError: string | null,
	showErrors: boolean
}> {
	private readonly _changeEmail = (email: string, emailError: string) => {
		this.setState({ email, emailError });
	};
	private readonly _changePassword = (password: string, passwordError: string) => {
		this.setState({ password, passwordError });
	};
	private readonly _submit = () => {
		this.setState({ showErrors: true });
		if (!this.state.emailError && !this.state.passwordError) {
			this.setState({ isSubmitting: true });
			this.props
				.onSignIn(this.state.email, this.state.password)
				.catch((errors: string[]) => {
					this.setState({ isSubmitting: false });
					if (errors.includes('UserAccountNotFound')) {
						this.setState({ emailError: 'User account not found.' });
					}
					if (errors.includes('IncorrectPassword')) {
						this.setState({ passwordError: 'Incorrect password.' });
					}
				});
		}
	};
	constructor() {
		super();
		this.state = {
			email: '',
			emailError: null,
			isSubmitting: false,
			password: '',
			passwordError: null,
			showErrors: false
		};
	}
	public render() {
		return (
			<div className="sign-in-card">
				<strong>Already have an account?</strong>
				<EmailAddressField
					autoFocus
					error={this.state.emailError}
					labelPosition="vertical"
					onChange={this._changeEmail}
					showError={this.state.showErrors}
					value={this.state.email}
				/>
				<PasswordField
					error={this.state.passwordError}
					labelPosition="vertical"
					onChange={this._changePassword}
					showError={this.state.showErrors}
					value={this.state.password}
				/>
				<AppScreenButton
					busy={this.state.isSubmitting}
					onClick={this._submit}
					text="Log In"
				/>
				<div className="break">
					<span>or</span>
				</div>
				<AppScreenButton
					onClick={this.props.onShowCreateAccountCard}
					style="loud"
					text="Sign Up"
				/>
			</div>
		);
	}
}