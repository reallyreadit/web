import * as React from 'react';
import InputField from '../../../../common/components/controls/InputField';
import FieldsetDialog, { Props as FormDialogProps, State } from '../controls/FieldsetDialog';

interface Props {
	currentEmailAddress: string,
	onChangeEmailAddress: (email: string) => Promise<void>
}
export default class ChangeEmailAddressDialog extends FieldsetDialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({ email, emailError });
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: 'Change Email Address',
				submitButtonText: 'Save Changes',
				successMessage: 'Email address changed'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<InputField
				type="email"
				label="Email Address"
				value={this.state.email}
				autoFocus
				required
				maxLength={256}
				error={this.state.emailError}
				showError={this.state.showErrors}
				onChange={this._handleEmailChange}
			/>
		);
	}
	protected getClientErrors() {
		const errors = { email: this.state.emailError };
		if (!errors.email && this.state.email === this.props.currentEmailAddress) {
			errors.email = 'Email address already set.';
			this.setState({ emailError: errors.email });
		}
		return [errors];
	}
	protected submitForm() {
		return this.props.onChangeEmailAddress(this.state.email);
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'ResendLimitExceeded')) {
			this.setState({ errorMessage: 'Email confirmation rate limit exceeded.\nPlease try again later.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.setState({ emailError: 'Email address already in use.' });
		}
	}
}