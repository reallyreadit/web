import * as React from 'react';
import BrowserHeader from './BrowserRoot/BrowserHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import BrowserNav from './BrowserRoot/BrowserNav';
import Root, { Props as RootProps, State as RootState } from './Root';
import LocalStorageApi from '../LocalStorageApi';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import ScreenKey from '../ScreenKey';
import DialogKey from '../DialogKey';
import routes from '../routes';
import { findRouteByKey } from '../Route';
import BrowserMenu from './BrowserRoot/BrowserMenu';
import UserArticle from '../../../common/models/UserArticle';

interface Props extends RootProps {
	localStorageApi: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null
}
interface State extends RootState {
	menuState: 'opened' | 'closing' | 'closed',
	showNewReplyIndicator: boolean
}
export default class extends Root<Props, State> {

	// dialogs
	private readonly _openCreateAccountDialog = () => {
		this._openDialog(this._dialogCreatorMap[DialogKey.CreateAccount]({
			path: window.location.pathname,
			queryString: window.location.search
		}));
	};
	private readonly _openSignInDialog = () => {
		this._openDialog(this._dialogCreatorMap[DialogKey.SignIn]({
			path: window.location.pathname,
			queryString: window.location.search
		}));
	};

	// menu
	private readonly _closeMenu = () => {
		this.setState({ menuState: 'closing' });
	};
	private readonly _hideMenu = () => {
		this.setState({ menuState: 'closed' });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: 'opened' });
	};

	// screens
	private readonly _viewAdminPage = () => {
		this.replaceScreen(ScreenKey.AdminPage);
	};
	private readonly _viewHistory = () => {
		this.replaceScreen(ScreenKey.History);
	};
	private readonly _viewHome = () => {
		this.replaceScreen(ScreenKey.Home);
	};
	private readonly _viewInbox = () => {
		this.replaceScreen(ScreenKey.Inbox);
	};
	private readonly _viewLeaderboards = () => {
		this.replaceScreen(ScreenKey.Leaderboards);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.replaceScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.replaceScreen(ScreenKey.Settings);
	};
	private readonly _viewStarred = () => {
		this.replaceScreen(ScreenKey.Starred);
	};

	constructor(props: Props) {
		super(props);
		const locationState = this.getLocationDependentState(props.initialLocation);
		this.state = {
			...this.state,
			dialog: locationState.dialog,
			menuState: 'closed',
			screens: [locationState.screen],
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification)
		};
		props.localStorageApi.addListener('user', user => {
			this.setState({ user });
		});
	}
	private handleUserChange(userAccount: UserAccount) {
		this.setState({ user: userAccount });
		this.props.localStorageApi.updateUser(userAccount);
	}
	private replaceScreen(key: ScreenKey, urlParams?: { [key: string]: string }) {
		const
			url = findRouteByKey(routes, key).createUrl(urlParams),
			[path, queryString] = url.split('?');
		this.setState({
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed',
			screens: [this._screenFactoryMap[key].create({ path, queryString })]
		});
		window.history.pushState(
			null,
			window.document.title,
			url
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
	protected viewComments(article: UserArticle) {
		const [sourceSlug, articleSlug] = article.slug.split('_');
		this.replaceScreen(ScreenKey.ArticleDetails, {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		});
	}
	public componentDidMount() {
		this.clearQueryStringKvps();
		window.addEventListener('popstate', () => {
			this.setState({
				screens: [
					this
						.getLocationDependentState({ path: window.location.pathname })
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
					onViewHome={this._viewHome}
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
						{this._screenFactoryMap[this.state.screens[0].key].render()}
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
						selectedScreenKey={this.state.screens[0].key}
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