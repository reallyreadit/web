import * as React from 'react';
import Captcha from '../../../Captcha';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import PasswordField from '../../controls/authentication/PasswordField';
import Button from './Button';
import UsernameField from '../../controls/authentication/UsernameField';
import ActionLink from '../../../../../common/components/ActionLink';
import { Intent } from '../../Toaster';

export interface Props {
	captcha: Captcha,
	onCancel: () => void,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>,
	onShowToast: (text: string, intent: Intent) => void
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
	private readonly _changeName = (name: string, nameError: string) => {
		this.setState({ name, nameError });
	};
	private readonly _changeEmail = (email: string, emailError: string) => {
		this.setState({ email, emailError });
	};
	private readonly _changePassword = (password: string, passwordError: string) => {
		this.setState({ password, passwordError });
	};
	private _captchaElement: HTMLDivElement | null = null;
	private readonly _setCaptchaElement = (ref: HTMLDivElement) => {
		this._captchaElement = ref;
	};
	private _captchaId: number | null = null;
	private readonly _submit = () => {
		this.setState({ showErrors: true });
		if (
			!this.state.nameError &&
			!this.state.emailError &&
			!this.state.passwordError
		) {
			this.setState({ isSubmitting: true });
			this.props
				.onCreateAccount(
					this.state.name,
					this.state.email,
					this.state.password,
					this.props.captcha.getResponse(this._captchaId)
				)
				.catch((errors: string[]) => {
					this.setState({ isSubmitting: false });
					if (errors.includes('DuplicateName')) {
						this.setState({ nameError: 'Username already in use.' });
					}
					if (errors.includes('DuplicateEmail')) {
						this.setState({ emailError: 'Email address already in use.' });
					}
					if (errors.includes('InvalidCaptcha')) {
						this.props.onShowToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
					}
					this.props.captcha.reset(this._captchaId);
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
		this.props.captcha.onReady().then(captcha => {
			this._captchaId = captcha.render(this._captchaElement, captcha.siteKeys.createAccount);
		});
	}
	public render() {
		return (
			<div className="create-account-card">
				<strong>Create an account</strong>
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
				<div
					className="captcha"
					ref={this._setCaptchaElement}
				></div>
				<Button
					busy={this.state.isSubmitting}
					onClick={this._submit}
					style="loud"
					text="Sign Up"
				/>
				<ActionLink onClick={this.props.onCancel} text="Cancel" />
			</div>
		)
	}
}