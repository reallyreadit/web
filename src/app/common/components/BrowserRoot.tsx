import * as React from 'react';
import { Intent, Toast } from './Toaster';
import UserAccount from '../../../common/models/UserAccount';
import User from '../User';
import Captcha from '../Captcha';
import Api from '../api/Api';

interface Props {
	api: Api,
	captcha: Captcha,
	path: string,
	user: User
}
export default class extends React.Component<Props, {
	screens: Screen[],
	toasts: Toast[],
	user: UserAccount | null
}> {
	private readonly _addToast = (text: string, intent: Intent) => {
		const toast = {
			text,
			intent,
			timeoutHandle: window.setTimeout(() => {
				const toasts = this.state.toasts.slice();
				toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
				this.setState({ toasts });
			}, 5000),
			remove: false
		};
		this.setState({ toasts: [...this.state.toasts, toast] });
	};
	private readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.props.api
			.createUserAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.setState({ user: userAccount });
				this.props.user.signIn(userAccount);
				this._addToast('Welcome to reallyread.it!\nPlease check your email and confirm your address.', Intent.Success);
				ga('send', {
					hitType: 'event',
					eventCategory: 'UserAccount',
					eventAction: 'create',
					eventLabel: userAccount.name
				});
			});
	};
	private readonly _removeToast = (timeoutHandle: number) => {
		this.setState({
			toasts: this.state.toasts.filter(toast => toast.timeoutHandle !== timeoutHandle)
		});
	};
	public render() {
		return (
			<div className="browser-root">

			</div>
		);
	}
}