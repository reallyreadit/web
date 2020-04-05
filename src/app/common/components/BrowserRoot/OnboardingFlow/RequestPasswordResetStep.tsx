import * as React from 'react';
import EmailAddressField from '../../controls/authentication/EmailAddressField';
import Button from '../../../../../common/components/Button';
import PasswordResetRequestForm from '../../../../../common/models/userAccounts/PasswordResetRequestForm';
import Captcha from '../../../Captcha';

interface Props {
	authServiceToken?: string,
	captcha: Captcha,
	onRequestPasswordReset: (form: PasswordResetRequestForm) => Promise<void>
}
enum GlobalError {
	Unknown,
	InvalidCaptcha,
	LimitExceeded
}
enum FormState {
	Filling,
	Submitting,
	Submitted
}
interface State {
	email: string,
	emailError: string | null,
	globalError: GlobalError | null,
	formState: FormState,
	showErrors: boolean
}
export default class RequestPasswordResetStep extends React.PureComponent<Props, State> {
	private readonly _changeEmail = (email: string, emailError?: string) => {
		this.setState({
			email,
			emailError
		});
	};
	private readonly _request = () => {
		this.setState({
			showErrors: true
		});
		if (this.state.emailError) {
			return;
		}
		this.setState(
			{
				formState: FormState.Submitting,
				globalError: null
			},
			() => {
				this.props
					.captcha
					.execute('requestPasswordReset')
					.then(
						captchaResponse => this.props.onRequestPasswordReset({
							authServiceToken: this.props.authServiceToken,
							captchaResponse,
							email: this.state.email
						})
					)
					.then(
						() => {
							this.setState({
								formState: FormState.Submitted
							});
						}
					)
					.catch(
						(errors?: string[]) => {
							let nextState = {
								emailError: null as string,
								formState: FormState.Filling,
								globalError: null as GlobalError
							};
							if (Array.isArray(errors)) {
								if (errors.includes('UserAccountNotFound')) {
									nextState.emailError = 'User account not found.';
								}
								if (errors.includes('RequestLimitExceeded')) {
									nextState.globalError = GlobalError.LimitExceeded;
								}
								if (errors.includes('InvalidCaptcha')) {
									nextState.globalError = GlobalError.InvalidCaptcha;
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
			email: '',
			emailError: null,
			formState: FormState.Filling,
			globalError: null,
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
		let globalError: React.ReactNode;
		switch (this.state.globalError) {
			case GlobalError.InvalidCaptcha:
				globalError = (
					<>
						Invalid Captcha.<br />
						Please try again.
					</>
				);
				break;
			case GlobalError.LimitExceeded:
				globalError = (
					<>
						Password reset rate limit exceeded.<br />
						Please try again later.
					</>
				);
				break;
			case GlobalError.Unknown:
				globalError = (
					<>
						An unknown error occurred.<br />
						Please try again.
					</>
				);
				break;
		}
		return (
			<div className="request-password-reset-step_em0y1x">
				{this.state.formState === FormState.Submitted ?
					<>
						<h1>Password reset email sent.</h1>
						<h2>Check your spam folder if you don't see it in your inbox.</h2>
					</> :
					<>
						{globalError ?
							<div className="global-error">{globalError}</div> :
							null}
						<EmailAddressField
							autoFocus
							error={this.state.emailError}
							onChange={this._changeEmail}
							showError={this.state.showErrors}
							value={this.state.email}
						/>
						<Button
							align="center"
							display="block"
							intent="loud"
							onClick={this._request}
							size="large"
							state={
								this.state.formState === FormState.Submitting ?
									'busy' :
									'normal'
							}
							text="Request Password Reset"
						/>
					</>}
			</div>
		);
	}
}