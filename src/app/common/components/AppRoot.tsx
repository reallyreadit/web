import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster from './Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
//import { clientTypeQueryStringKey } from '../../../common/routing/queryString';
import UserArticle from '../../../common/models/UserArticle';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './AppRoot/CommentsScreen';
import createHomeScreenFactory from './AppRoot/HomeScreen';
import createHistoryScreenFactory from './AppRoot/HistoryScreen';
import createLeaderboardsScreenFactory from './AppRoot/LeaderboardsScreen';
import createPizzaScreenFactory from './AppRoot/PizzaScreen';
import createStarredScreenFactory from './AppRoot/StarredScreen';
import classNames from 'classnames';
import Menu from './AppRoot/Menu';
import AppApi from '../AppApi';

interface Props extends RootProps {
	appApi: AppApi
}
interface State extends RootState {
	isPoppingScreen: boolean,
	menuState: 'opened' | 'closing' | 'closed',
}
export default class extends Root<Props, State> {
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
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _handleScreenAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'app-root_vc3j5h-screen-slide-out') {
			this.setState({
				isPoppingScreen: false,
				screens: this.state.screens.slice(0, this.state.screens.length - 1)
			});
		}
	};
	private readonly _viewAdminPage = () => {
		this.pushScreen(ScreenKey.AdminPage);
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
	private readonly _viewPizzaChallenge = () => {
		this.replaceScreen(ScreenKey.PizzaChallenge);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.pushScreen(ScreenKey.Settings);
	};
	private readonly _viewStarred = () => {
		this.replaceScreen(ScreenKey.Starred);
	};

	constructor(props: Props) {
		super(props);

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onPostComment: this._postComment,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar
			}),
			[ScreenKey.History]: createHistoryScreenFactory(ScreenKey.History, {
				onDeleteArticle: this._deleteArticle,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onGetHotTopics: this.props.serverApi.getHotTopics,
				onOpenMenu: this._openMenu,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onResendConfirmationEmail: this._resendConfirmationEmail,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onGetLeaderboards: this.props.serverApi.getWeeklyReadingLeaderboards,
				onGetStats: this.props.serverApi.getWeeklyReadingStats,
			}),
			[ScreenKey.PizzaChallenge]: createPizzaScreenFactory(ScreenKey.PizzaChallenge, {
				onGetChallengeLeaderboard: this.props.serverApi.getChallengeLeaderboard,
				onGetChallengeScore: this.props.serverApi.getChallengeScore,
				onGetChallengeState: this.props.serverApi.getChallengeState,
				onGetTimeZones: this.props.serverApi.getTimeZones,
				onQuitChallenge: this._quitChallenge,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onStartChallenge: this._startChallenge
			}),
			[ScreenKey.Starred]: createStarredScreenFactory(ScreenKey.Starred, {
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			})
		};

		// state
		let
			dialog: React.ReactNode,
			screens: Screen[];
		if (props.initialUser) {
			const locationState = this.getLocationDependentState(props.initialLocation);
			dialog = locationState.dialog;
			screens = [locationState.screen];
		} else {
			dialog = null;
			screens = [];
		}
		this.state = {
			...this.state,
			dialog,
			isPoppingScreen: false,
			menuState: 'closed',
			screens
		};

		// AppApi
		props.appApi.addListener('articleUpdated', ev => {
			this._articleChangeEventHandlers.forEach(handler => {
				handler(ev.article, ev.isCompletionCommit);
			});
		});
	}
	private pushScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		this.setScreensState([
			...this.state.screens,
			this.createScreen(key, urlParams, title).screen
		]);
	}
	private replaceScreen(key: ScreenKey) {
		this.setScreensState([this.createScreen(key).screen]);
	}
	private setScreensState(screens: Screen[]) {
		this.setState({
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed',
			screens
		});
	}
	protected onUserChanged(userAccount: UserAccount) {
		if (userAccount) {
			const locationState = this.getLocationDependentState({
				path: window.location.pathname,
				queryString: window.location.search
			});
			if (window.location.search) {
				this.clearQueryStringKvps();
			}
			this.setState({
				dialog: locationState.dialog,
				screens: [locationState.screen],
				user: userAccount
			});
		} else {
			this.setState({
				menuState: 'closed',
				screens: [],
				user: null
			});
		}
	}
	protected readArticle(article: UserArticle, ev: React.MouseEvent) {
		ev.preventDefault();
		this.props.appApi.readArticle(article);
	}
	protected viewComments(article: UserArticle) {
		const [sourceSlug, articleSlug] = article.slug.split('_');
		this.pushScreen(
			ScreenKey.Comments,
			{
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			},
			article.title
		);
	}
	public componentDidMount() {
		//this.clearQueryStringKvps([clientTypeQueryStringKey]);
	}
	public render() {
		return (
			<div className="app-root_vc3j5h">
				{this.state.user ?
					<>
						<div className="content">
							<ol className="screens">
								{this.state.screens.map((screen, index, screens) => (
									<li
										className={classNames('screen', {
											'has-title': !!screen.title,
											'slide-out': this.state.isPoppingScreen && index === screens.length - 1
										})}
										key={screen.key}
										onAnimationEnd={this._handleScreenAnimationEnd}
									>
										{this._screenFactoryMap[screen.key].render(screen, { user: this.state.user })}
									</li>
								))}
							</ol>
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
									userAccount={this.state.user}
								/> :
								null}
						</div>
						<NavTray
							onViewHistory={this._viewHistory}
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewPizzaChallenge={this._viewPizzaChallenge}
							onViewStarred={this._viewStarred}
							selectedScreenKey={this.state.screens[0].key}
						/>
						<Header
							isTransitioningBack={this.state.isPoppingScreen}
							onBack={this._popScreen}
							titles={this.state.screens.map(screen => screen.title)}
						/>
						<DialogManager dialog={this.state.dialog} />
					</> :
					<AuthScreen
						captcha={this.props.captcha}
						onCreateAccount={this._createAccount}
						onShowToast={this._addToast}
						onSignIn={this._signIn}
					/>}
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}