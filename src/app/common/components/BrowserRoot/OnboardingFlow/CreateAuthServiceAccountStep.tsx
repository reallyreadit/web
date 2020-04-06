import * as React from 'react';
import Button from '../../../../../common/components/Button';
import AuthServiceAccountForm from '../../../../../common/models/userAccounts/AuthServiceAccountForm';
import UsernameField from '../../controls/authentication/UsernameField';
import ActionLink from '../../../../../common/components/ActionLink';

export type Form = Pick<AuthServiceAccountForm, 'token' | 'name'>;
interface Props {
	authServiceToken: string,
	onCreateAuthServiceAccount: (form: Form) => Promise<void>,
	onLinkExistingAccount: () => void,
}
enum GlobalError {
	Unknown,
	DuplicateEmail,
	InvalidSessionId,
	AuthenticationExpired
}
interface State {
	name: string,
	nameError: string | null,
	globalError: GlobalError | null,
	isSubmitting: boolean,
	showErrors: boolean
}
export default class CreateAuthServiceAccountStep extends React.PureComponent<Props, State> {
	private readonly _changeName = (name: string, nameError?: string) => {
		this.setState({
			name,
			nameError
		});
	};
	private readonly _createAccount = () => {
		this.setState({
			showErrors: true
		});
		if (this.state.nameError) {
			return;
		}
		this.setState(
			{
				globalError: null,
				isSubmitting: true
			},
			() => {
				this.props
					.onCreateAuthServiceAccount({
						token: this.props.authServiceToken,
						name: this.state.name
					})
					.catch(
						(errors?: string[]) => {
							let nextState = {
								nameError: null as string,
								globalError: null as GlobalError,
								isSubmitting: false
							};
							if (Array.isArray(errors)) {
								if (errors.includes('DuplicateName')) {
									nextState.nameError = 'Username already in use.'
								}
								if (errors.includes('DuplicateEmail')) {
									nextState.globalError = GlobalError.DuplicateEmail;
								}
								if (errors.includes('InvalidSessionId')) {
									nextState.globalError = GlobalError.InvalidSessionId;
								}
								if (errors.includes('AuthenticationExpired')) {
									nextState.globalError = GlobalError.AuthenticationExpired;
								}
							} else {
								nextState.globalError = GlobalError.Unknown;
							}
							this.setState(nextState);
						}
					);
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			name: '',
			nameError: null,
			globalError: null,
			isSubmitting: false,
			showErrors: false
		};
	}
	public render() {
		let globalError: string;
		switch (this.state.globalError) {
			case GlobalError.AuthenticationExpired:
				globalError = 'Authentication expired. Please sign in again.';
				break;
			case GlobalError.DuplicateEmail:
				globalError = 'Email address already in use.';
				break;
			case GlobalError.InvalidSessionId:
				globalError = 'Invalid session id.';
				break;
			case GlobalError.Unknown:
				globalError = 'An unknown error occurred. Please try again.';
				break;
		}
		return (
			<div className="create-auth-service-account-step_tnixn3">
				<h1>Choose a Username</h1>
				<UsernameField
					autoFocus
					error={this.state.nameError}
					key="username"
					onChange={this._changeName}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				{globalError ?
					<div className="global-error">{globalError}</div> :
					null}
				<Button
					align="center"
					display="block"
					intent="loud"
					onClick={this._createAccount}
					size="large"
					state={
						this.state.isSubmitting ?
							'busy' :
							'normal'
					}
					text="Create Account"
				/>
				<ActionLink
					onClick={this.props.onLinkExistingAccount}
					state={
						this.state.isSubmitting ?
							'disabled' :
							'normal'
					}
					text="Link an existing account?"
				/>
			</div>
		);
	}
}