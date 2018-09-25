import * as React from 'react';
import BrowserHeader from './BrowserRoot/BrowserHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import BrowserNav from './BrowserRoot/BrowserNav';
import Root, { Props as RootProps } from './Root';
import LocalStorageApi from '../LocalStorageApi';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';

interface Props {
	localStorage: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null
}
export default class extends Root<
	Props,
	{ showNewReplyIndicator: boolean }
> {
	private readonly _dismissNewReplyIndicator = () => {
		
	};
	private readonly _showCreateAccountDialog = () => {

	};
	private readonly _showSignInDialog = () => {

	};
	constructor(props: Props & RootProps) {
		super(props);
		this.state = {
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification),
			screens: [this.createScreen(props.path)],
			toasts: [],
			user: props.user
		};
		props.localStorage.addListener('user', user => {
			this.setState({ user });
		});
	}
	protected createAccount(name: string, email: string, password: string, captchaResponse: string) {
		return super
			.createAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.props.localStorage.updateUser(userAccount);
				return userAccount;
			});
	}
	protected signIn(email: string, password: string) {
		return super
			.signIn(email, password)
			.then(userAccount => {
				this.props.localStorage.updateUser(userAccount);
				return userAccount;
			});
	}
	public render() {
		return (
			<div className="browser-root">
				<EmailConfirmationBar user={this.state.user} />
				<BrowserHeader
					onDismissNewReplyIndicator={this._dismissNewReplyIndicator}
				/>
				<main>
					<BrowserNav />
					<div className="screen">
						{this.state.screens[0].render()}
					</div>
				</main>
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}