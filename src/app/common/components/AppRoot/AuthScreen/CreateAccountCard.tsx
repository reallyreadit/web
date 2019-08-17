import * as React from 'react';
import Captcha from '../../../Captcha';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import PasswordField from '../../controls/authentication/PasswordField';
import UsernameField from '../../controls/authentication/UsernameField';
import ActionLink from '../../../../../common/components/ActionLink';
import { Intent } from '../../../../../common/components/Toaster';
import Button from '../../../../../common/components/Button';

export interface Props {
	captcha: Captcha,
	onCancel: () => void,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void
}
interface State {
	email: string,
	emailError: string | null,
	isSubmitting: boolean,
	name: string,
	nameError: string | null,
	password: string,
	passwordError: string | null,
	showErrors: boolean
}
export default class extends React.PureComponent<Props, State> {
	private readonly _cancel = () => {
		this.props.captcha.hideBadge();
		this.props.onCancel();
	};
	private readonly _changeName = (name: string, nameError: string) => {
		this.setState({ name, nameError });
	};
	private readonly _changeEmail = (email: string, emailError: string) => {
		this.setState({ email, emailError });
	};
	private readonly _changePassword = (password: string, passwordError: string) => {
		this.setState({ password, passwordError });
	};
	private readonly _submit = () => {
		this.setState({ showErrors: true });
		if (
			!this.state.nameError &&
			!this.state.emailError &&
			!this.state.passwordError
		) {
			this.setState({ isSubmitting: true });
			this.props.captcha
				.execute('createUserAccount')
				.then(captchaResponse => this.props.onCreateAccount(
					this.state.name,
					this.state.email,
					this.state.password,
					captchaResponse
				))
				.catch((errors: string[]) => {
					this.setState({ isSubmitting: false });
					if (errors.includes('DuplicateName')) {
						this.setState({ nameError: 'Username already in use.' });
					}
					if (errors.includes('DuplicateEmail')) {
						this.setState({ emailError: 'Email address already in use.' });
					}
					if (errors.includes('InvalidCaptcha')) {
						this.props.onShowToast(<>Invalid Captcha<br />Please Try Again</>, Intent.Danger);
					}
				});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			emailError: null,
			isSubmitting: false,
			name: '',
			nameError: null,
			password: '',
			passwordError: null,
			showErrors: false
		};
	}
	public componentDidMount() {
		this.props.captcha.showBadge();
	}
	public componentWillUnmount() {
		this.props.captcha.hideBadge();
	}
	public render() {
		return (
			<div className="create-account-card_fr4krd">
				<UsernameField
					error={this.state.nameError}
					key="username"
					labelPosition="vertical"
					onChange={this._changeName}
					showError={this.state.showErrors}
					value={this.state.name}
				/>
				<EmailAddressField
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
				<Button
					state={this.state.isSubmitting ? 'busy' : 'normal'}
					onClick={this._submit}
					style="loud"
					text="Sign Up"
					display="block"
					align="center"
					size="x-large"
				/>
				<ActionLink onClick={this._cancel} text="Cancel" />
			</div>
		)
	}
}