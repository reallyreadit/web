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
import ScreenKey from '../ScreenKey';
import DialogKey from '../DialogKey';
import routes from '../routes';
import { findRouteByKey } from '../Route';
import BrowserMenu from './BrowserRoot/BrowserMenu';

interface Props {
	localStorageApi: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null
}
export default class extends Root<
	Props,
	{
		menuState: 'opened' | 'closing' | 'closed',
		showNewReplyIndicator: boolean
	}
> {
	private readonly _closeMenu = () => {
		this.setState({ menuState: 'closing' });
	};
	private readonly _hideMenu = () => {
		this.setState({ menuState: 'closed' });
	};
	private readonly _openCreateAccountDialog = () => {
		this.setState({
			dialog: this._dialogCreatorMap[DialogKey.CreateAccount](window.location.search)
		});
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: 'opened' });
	};
	private readonly _openSignInDialog = () => {
		this.setState({
			dialog: this._dialogCreatorMap[DialogKey.SignIn](window.location.search)
		});
	};
	private readonly _viewAdminPage = () => {

	};
	private readonly _viewHistory = () => {

	};
	private readonly _viewHome = () => {
		this.replaceScreen(ScreenKey.Home);
	};
	private readonly _viewInbox = () => {

	};
	private readonly _viewLeaderboards = () => {

	};
	private readonly _viewPrivacyPolicy = () => {

	};
	private readonly _viewSettings = () => {
		
	};
	private readonly _viewStarred = () => {
		this.replaceScreen(ScreenKey.Starred);
	};
	constructor(props: Props & RootProps) {
		super(props);
		const locationState = this.getLocationState(props.initialLocation);
		this.state = {
			dialog: locationState.dialog,
			menuState: 'closed',
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
	private replaceScreen(key: ScreenKey) {
		this.setState({
			screens: [this._screenCreatorMap[key]()]
		});
		window.history.pushState(
			null,
			window.document.title,
			findRouteByKey(routes, key).createUrl()
		);
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
		window.addEventListener('popstate', () => {
			this.setState({
				screens: [
					this
						.getLocationState({ path: window.location.pathname })
						.screen
				]
			});
		});
	}
	public render() {
		return (
			<div className="browser-root">
				<EmailConfirmationBar
					onResendConfirmationEmail={this._resendConfirmationEmail}
					user={this.state.user}
				/>
				<BrowserHeader
					isUserSignedIn={!!this.state.user}
					onOpenMenu={this._openMenu}
					onShowCreateAccountDialog={this._openCreateAccountDialog}
					onShowSignInDialog={this._openSignInDialog}
					showNewReplyIndicator={this.state.showNewReplyIndicator}
				/>
				<main>
					<BrowserNav
						onViewHistory={this._viewHistory}
						onViewHome={this._viewHome}
						onViewLeaderboards={this._viewLeaderboards}
						onViewStarred={this._viewStarred}
						selectedScreenKey={this.state.screens[0].key}
					/>
					<div className="screen">
						{this.state.screens[0].render()}
					</div>
				</main>
				{this.state.menuState !== 'closed' ?
					<BrowserMenu
						isClosing={this.state.menuState === 'closing'}
						onClose={this._closeMenu}
						onClosed={this._hideMenu}
						onSignOut={this._signOut}
						onViewAdminPage={this._viewAdminPage}
						onViewInbox={this._viewInbox}
						onViewPrivacyPolicy={this._viewPrivacyPolicy}
						onViewSettings={this._viewSettings}
						showNewReplyNotification={this.state.showNewReplyIndicator}
						userAccount={this.state.user}
					/> :
					null}
				<DialogManager dialog={this.state.dialog} />
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}