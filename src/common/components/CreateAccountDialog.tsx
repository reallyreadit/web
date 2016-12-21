import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import Button from './Button';
import InputField from './InputField';
import InputFieldState from './InputFieldState';

export default class CreateAccountDialog extends PureContextComponent<{}, {
	nameError?: string,
	emailError?: string,
	isLoading: boolean,
	showErrors: boolean
}> {
	private name = new InputFieldState().addListener('change', () => this.setState({ nameError: undefined }));
	private email = new InputFieldState().addListener('change', () => this.setState({ emailError: undefined }));;
	private password = new InputFieldState();
	private handleSubmit = () => {
		this.setState({ showErrors: true });
		if (
			[this.name, this.email, this.password].every(state => state.isValid) &&
			[this.state.nameError, this.state.emailError].every(error => error === undefined)
		) {
			this.setState({ isLoading: true });
			this.context.api
				.createUserAccount(this.name.value, this.email.value, this.password.value)
				.then(userAccount => {
					this.context.user.signIn(userAccount);
					this.context.dialog.close();
				})
				.catch((errors: string[]) => {	
					this.setState({ isLoading: false });
					if (errors.some(error => error === 'DuplicateName')) {
						this.setState({ nameError: 'Username already in use.' });
					}
					if (errors.some(error => error === 'DuplicateEmail')) {
						this.setState({ emailError: 'Email address already in use.' });
					}
				});
		}
	};
	private handleCancel = () => this.context.dialog.close();
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			isLoading: false,
			showErrors: false
		};
	}
	public render() {
		console.log('CreateAccounDialog: render');
		return (
			<div className="create-account-dialog">
				<h3>Create Account</h3>
				<InputField type="text" label="Username" required minLength={3} maxLength={30} error={this.state.nameError} showError={this.state.showErrors} onChange={this.name.handleChange} />
				<InputField type="email" label="Email Address" required maxLength={256} error={this.state.emailError} showError={this.state.showErrors} onChange={this.email.handleChange} />
				<InputField type="password" label="Password" required minLength={8} maxLength={256} showError={this.state.showErrors} onChange={this.password.handleChange} />
				<div className="buttons">
					<Button onClick={this.handleCancel} state={this.state.isLoading ? 'disabled' : 'normal'}>Cancel</Button>
					<Button onClick={this.handleSubmit} style="preferred" state={this.state.isLoading ? 'busy' : 'normal'}>Create Account</Button>
				</div>
			</div>
		);
	}
}