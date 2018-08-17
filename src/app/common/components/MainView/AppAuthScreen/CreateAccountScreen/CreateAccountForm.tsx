import * as React from 'react';
import UserAccount from '../../../../../../common/models/UserAccount';
import Captcha from '../../../../Captcha';
import { Intent } from '../../../../Page';

export default class extends React.PureComponent<{
	captcha: Captcha,
	createAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<UserAccount>,
	onCreateAccount: (userAccount: UserAccount) => void,
	showToast: (text: string, intent: Intent) => void
}, {
	email: string,
	emailError: string | null,
	isSubmitting: boolean,
	name: string,
	nameError: string | null,
	password: string,
	passwordError: string | null,
	showErrors: boolean
}> {
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
				.createAccount(
					this.state.name,
					this.state.email,
					this.state.password,
					this.props.captcha.getResponse(this._captchaId)
				)
				.then(this.props.onCreateAccount)
				.catch((errors: string[]) => {
					this.setState({ isSubmitting: false });
					if (errors.includes('DuplicateName')) {
						this.setState({ nameError: 'Username already in use.' });
					}
					if (errors.includes('DuplicateEmail')) {
						this.setState({ emailError: 'Email address already in use.' });
					}
					if (errors.includes('InvalidCaptcha')) {
						this.props.showToast('Invalid Captcha\nPlease Try Again', Intent.Danger);
					}
					this.props.captcha.reset(this._captchaId);
				});
		}
	};
	constructor() {
		super();
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
			this._captchaId = captcha.render(this._captchaElement, '6LcxOV4UAAAAAGZTappGq7UwQ7EXSBUxAGMJNLQM');
		});
	}
	public render() {
		return (
			<div className="create-account-form">
			</div>
		)
	}
}