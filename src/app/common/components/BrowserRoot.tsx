import * as React from 'react';
import BrowserHeader from './BrowserRoot/BrowserHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import BrowserNav from './BrowserRoot/BrowserNav';
import Root, { Props as RootProps } from './Root';
import LocalStorageApi from '../LocalStorageApi';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import SignInDialog from './BrowserRoot/SignInDialog';
import RequestPasswordResetDialog from './BrowserRoot/SignInDialog/RequestPasswordResetDialog';
import CreateAccountDialog from './BrowserRoot/CreateAccountDialog';

interface Props {
	localStorageApi: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null
}
export default class extends Root<
	Props,
	{ showNewReplyIndicator: boolean }
> {
	private readonly _openCreateAccountDialog = () => {
		this.setState({
			dialog: (
				<CreateAccountDialog
					captcha={this.props.captcha}
					onCreateAccount={this._createAccount}
					onCloseDialog={this._closeDialog}
					onShowToast={this._addToast}
				/>
			)
		});
	};
	private readonly _openRequestPasswordResetDialog = () => {
		this.setState({
			dialog: (
				<RequestPasswordResetDialog
					captcha={this.props.captcha}
					onCloseDialog={this._closeDialog}
					onRequestPasswordReset={this.props.serverApi.requestPasswordReset}
					onShowToast={this._addToast}
				/>
			)
		});
	};
	private readonly _openSignInDialog = () => {
		this.setState({
			dialog: (
				<SignInDialog
					onCloseDialog={this._closeDialog}
					onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
					onShowToast={this._addToast}
					onSignIn={this._signIn}
				/>
			)
		});
	};
	constructor(props: Props & RootProps) {
		super(props);
		const locationState = this.getLocationState(props.initialLocation);
		this.state = {
			dialog: locationState.dialog,
			screens: [locationState.screen],
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification),
			toasts: [],
			user: props.initialUser
		};
		props.localStorageApi.addListener('user', user => {
			this.setState({ user });
		});
	}
	private handleUserChange(userAccount: UserAccount) {
		this.setState({ user: userAccount });
		this.props.localStorageApi.updateUser(userAccount);
	}
	protected createAccount(name: string, email: string, password: string, captchaResponse: string) {
		return super
			.createAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signIn(email: string, password: string) {
		return super
			.signIn(email, password)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signOut() {
		return super
			.signOut()
			.then(() => {
				this.handleUserChange(null);
			});
	}
	public componentDidMount() {
		this.clearQueryStringKvps();
	}
	public render() {
		return (
			<div className="browser-root">
				<EmailConfirmationBar
					onResendConfirmationEmail={this._resendConfirmationEmail}
					user={this.state.user}
				/>
				<BrowserHeader
					onShowCreateAccountDialog={this._openCreateAccountDialog}
					onShowSignInDialog={this._openSignInDialog}
					onSignOut={this._signOut}
					onViewAdminPage={this._viewAdminPage}
					onViewInbox={this._viewInbox}
					onViewSettings={this._viewSettings}
					showNewReplyIndicator={this.state.showNewReplyIndicator}
					user={this.state.user}
				/>
				<main>
					<BrowserNav
						items={this.getNavItems()}
					/>
					<div className="screen">
						{this.state.screens[0].render()}
					</div>
				</main>
				<DialogManager dialog={this.state.dialog} />
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}