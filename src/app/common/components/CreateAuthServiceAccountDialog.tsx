import * as React from 'react';
import FieldsetDialog, { Props as FieldsetDialogProps, State } from './controls/FieldsetDialog';
import UsernameField from '../../../common/components/controls/authentication/UsernameField';
import { Intent } from '../../../common/components/Toaster';
import AuthServiceAccountForm from '../../../common/models/userAccounts/AuthServiceAccountForm';

interface Props {
	onCreateAuthServiceAccount: (form: Form) => Promise<void>,
	onLinkExistingAccount: (token: string) => void,
	token: string
}
export type Form = Pick<AuthServiceAccountForm, 'token' | 'name'>;
export default class CreateAuthServiceAccountDialog extends FieldsetDialog<void, Props, Partial<State> & {
	name?: string,
	nameError?: string
}> {
	private readonly _handleNameChange = (name: string, nameError: string) => this.setState({ name, nameError });
	private readonly _linkExistingAccount = () => {
		this.props.onLinkExistingAccount(this.props.token);
	};
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				title: 'Choose a Reader Name',
				submitButtonText: 'Sign Up'
			},
			props
		);
	}
	protected renderFields() {
		return (
			<>
				<UsernameField
					autoFocus
					error={this.state.nameError}
					key="username"
					onChange={this._handleNameChange}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				<div className="link">
					<span onClick={this._linkExistingAccount}>Already have an account?</span>
				</div>
			</>
		);
	}
	protected getClientErrors() {
		return [{
			name: this.state.nameError
		}];
	}
	protected submitForm() {
		return this.props.onCreateAuthServiceAccount({
			token: this.props.token,
			name: this.state.name
		});
	}
	protected onError(errors: string[]) {
		if (errors.some(error => error === 'DuplicateName')) {
			this.setState({ nameError: 'Reader name already in use.' });
		}
		if (errors.some(error => error === 'DuplicateEmail')) {
			this.props.onShowToast('Email address already in use.', Intent.Danger);
		}
		if (errors.some(error => error === 'InvalidSessionId')) {
			this.props.onShowToast('Invalid session id.', Intent.Danger);
		}
		if (errors.some(error => error === 'AuthenticationExpired')) {
			this.props.onShowToast(<>Authentication expired.<br />Please sign in again.</>, Intent.Danger);
		}
	}
}