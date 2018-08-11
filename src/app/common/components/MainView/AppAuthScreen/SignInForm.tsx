import * as React from 'react';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import PasswordField from '../../controls/authentication/PasswordField';

export default class extends React.PureComponent<{}, {
	email: string,
	emailError: string,
	password: string,
	passwordError: string,
	showErrors: boolean
}> {
	private readonly _onEmailChange = (email: string, emailError: string) => {
		this.setState({ email, emailError });
	};
	private readonly _onPasswordChange = (password: string, passwordError: string) => {
		this.setState({ password, passwordError });
	};
	constructor() {
		super();
		this.state = {
			email: '',
			emailError: null,
			password: '',
			passwordError: null,
			showErrors: false
		};
	}
	public render() {
		return (
			<div className="sign-in-form">
				<EmailAddressField
					value={this.state.email}
					error={this.state.emailError}
					showError={this.state.showErrors}
					onChange={this._onEmailChange}
				/>
				<PasswordField
					value={this.state.password}
					error={this.state.passwordError}
					showError={this.state.showErrors}
					onChange={this._onPasswordChange}
				/>
			</div>
		);
	}
}