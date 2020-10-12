import * as React from 'react';
import InputField from '../../../../common/components/controls/InputField';
import FormDialog, { Props as FormDialogProps, State } from '../controls/FormDialog';
import NewPlatformNotificationRequest from '../../../../common/models/analytics/NewPlatformNotificationRequest';

interface Props {
	onSubmitRequest: (form: NewPlatformNotificationRequest) => Promise<void>
}
export default class NewPlatformNotificationRequestDialog extends FormDialog<void, Props, Partial<State> & {
	email?: string,
	emailError?: string
}> {
	private _handleEmailChange = (email: string, emailError: string) => this.setState({
		email,
		emailError
	});
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: 'Get Notified',
				submitButtonText: 'Submit',
				successMessage: 'Request received. Thank you!'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<InputField
					key="emailAddress"
					type="email"
					label="Email Address"
					value={this.state.email}
					autoFocus
					required
					error={this.state.emailError}
					showError={this.state.showErrors}
					onChange={this._handleEmailChange}
				/>
				<div className="note">
					<span>We won't email you for any other reason.</span>
				</div>
			</>
		);
	}
	protected getClientErrors() {
		return [
			{
				email: this.state.emailError
			}
		];
	}
	protected submitForm() {
		return this.props.onSubmitRequest({
			emailAddress: this.state.email
		});
	}
}