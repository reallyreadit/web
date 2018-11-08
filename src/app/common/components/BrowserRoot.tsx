import * as React from 'react';
import Header from './BrowserRoot/Header';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import NavBar from './BrowserRoot/NavBar';
import Root, { Props as RootProps, State as RootState } from './Root';
import LocalStorageApi from '../LocalStorageApi';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import Menu from './BrowserRoot/Menu';
import UserArticle from '../../../common/models/UserArticle';
import createCommentsScreenFactory from './BrowserRoot/CommentsScreen';
import createHomeScreenFactory from './BrowserRoot/HomeScreen';
import createHistoryScreenFactory from './BrowserRoot/HistoryScreen';
import createLeaderboardsScreenFactory from './BrowserRoot/LeaderboardsScreen';
import createPizzaScreenFactory from './BrowserRoot/PizzaScreen';
import createStarredScreenFactory from './BrowserRoot/StarredScreen';
import WindowApi from '../WindowApi';
import ExtensionApi from '../ExtensionApi';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';

interface Props extends RootProps {
	extensionApi: ExtensionApi,
	localStorageApi: LocalStorageApi,
	newReplyNotification: NewReplyNotification | null,
	windowApi: WindowApi
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

	// events
	private readonly _userChangeEventHandlers: ((newUser: UserAccount) => void)[] = [];
	private readonly _registerUserChangeEventHandler = (handler: (newUser: UserAccount) => void) => {
		return this.registerEventHandler(this._userChangeEventHandlers, handler);
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
		this.setState(this.replaceScreen(ScreenKey.AdminPage));
	};
	private readonly _viewHistory = () => {
		this.setState(this.replaceScreen(ScreenKey.History));
	};
	private readonly _viewHome = () => {
		this.setState(this.replaceScreen(ScreenKey.Home));
	};
	private readonly _viewInbox = () => {
		this.setState(this.replaceScreen(ScreenKey.Inbox));
	};
	private readonly _viewLeaderboards = () => {
		this.setState(this.replaceScreen(ScreenKey.Leaderboards));
	};
	private readonly _viewPizzaChallenge = () => {
		this.setState(this.replaceScreen(ScreenKey.PizzaChallenge));
	};
	private readonly _viewPrivacyPolicy = () => {
		this.setState(this.replaceScreen(ScreenKey.PrivacyPolicy));
	};
	private readonly _viewSettings = () => {
		this.setState(this.replaceScreen(ScreenKey.Settings));
	};
	private readonly _viewStarred = () => {
		this.setState(this.replaceScreen(ScreenKey.Starred));
	};

	constructor(props: Props) {
		super(props);

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onGetUser: this._getUser,
				onPostComment: this._postComment,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar
			}),
			[ScreenKey.History]: createHistoryScreenFactory(ScreenKey.History, {
				onDeleteArticle: this._deleteArticle,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onGetUser: this._getUser,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler:this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onGetHotTopics: this.props.serverApi.getHotTopics,
				onGetUser: this._getUser,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onGetLeaderboards: this.props.serverApi.getWeeklyReadingLeaderboards,
				onGetStats: this.props.serverApi.getWeeklyReadingStats,
				onGetUser: this._getUser,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler
			}),
			[ScreenKey.PizzaChallenge]: createPizzaScreenFactory(ScreenKey.PizzaChallenge, {
				onGetChallengeLeaderboard: this.props.serverApi.getChallengeLeaderboard,
				onGetChallengeState: this.props.serverApi.getChallengeState,
				onGetTimeZones: this.props.serverApi.getTimeZones,
				onGetUserAccount: this._getUser,
				onQuitChallenge: this._quitChallenge,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onStartChallenge: this._startChallenge
			}),
			[ScreenKey.Starred]: createStarredScreenFactory(ScreenKey.Starred, {
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUser: this._getUser,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			})
		};

		// state
		const locationState = this.getLocationDependentState(props.initialLocation);
		this.state = {
			...this.state,
			dialog: locationState.dialog,
			menuState: 'closed',
			screens: [locationState.screen],
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification)
		};

		// LocalStorageApi
		props.localStorageApi.addListener('user', user => {
			this.setState({ user });
		});

		// WindowApi
		props.windowApi.setTitle(locationState.screen.title);

		// ExtensionApi
		props.extensionApi.addListener('articleUpdated', ev => {
			this._articleChangeEventHandlers.forEach(handler => {
				handler(ev.article);
			});
		});
	}
	private replaceScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string): Pick<State, 'menuState' | 'screens'> {
		const { screen, url } = this.createScreen(key, urlParams, title);
		this.props.windowApi.setTitle(screen.title);
		window.history.pushState(
			null,
			screen.title,
			url
		);
		return {
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed',
			screens: [screen]
		};
	}
	protected onTitleChanged(title: string) {
		this.props.windowApi.setTitle(title);
	}
	protected onUserChanged(userAccount: UserAccount) {
		const screenAuthLevel = findRouteByKey(routes, this.state.screens[0].key).authLevel;
		if (screenAuthLevel != null && (!userAccount || userAccount.role !== screenAuthLevel)) {
			this.setState({
				...this.replaceScreen(ScreenKey.Home),
				user: userAccount
			});
		} else {
			this.setState({ user: userAccount }, () => {
				this._userChangeEventHandlers.forEach(handler => {
					handler(userAccount);
				});
			});
		}
		this.props.localStorageApi.updateUser(userAccount);
	}
	protected viewComments(article: UserArticle) {
		const [sourceSlug, articleSlug] = article.slug.split('_');
		this.setState(this.replaceScreen(
			ScreenKey.Comments, {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			},
			article.title
		));
	}
	public componentDidMount() {
		this.clearQueryStringKvps();
		window.addEventListener('popstate', () => {
			const screen = this.getLocationDependentState({ path: window.location.pathname }).screen;
			this.setState({ screens: [screen] });
			this.props.windowApi.setTitle(screen.title);
		});
	}
	public render() {
		const screen = this.state.screens[0];
		return (
			<div className="browser-root">
				<EmailConfirmationBar
					onResendConfirmationEmail={this._resendConfirmationEmail}
					user={this.state.user}
				/>
				<Header
					isUserSignedIn={!!this.state.user}
					onOpenMenu={this._openMenu}
					onShowCreateAccountDialog={this._openCreateAccountDialog}
					onShowSignInDialog={this._openSignInDialog}
					onViewHome={this._viewHome}
					showNewReplyIndicator={this.state.showNewReplyIndicator}
				/>
				<main>
					<NavBar
						onViewHistory={this._viewHistory}
						onViewHome={this._viewHome}
						onViewLeaderboards={this._viewLeaderboards}
						onViewPizzaChallenge={this._viewPizzaChallenge}
						onViewStarred={this._viewStarred}
						selectedScreenKey={screen.key}
					/>
					<div className="screen">
						{this._screenFactoryMap[screen.key].render(screen)}
					</div>
				</main>
				{this.state.menuState !== 'closed' ?
					<Menu
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