import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import UserArticle from '../../../common/models/UserArticle';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './AppRoot/CommentsScreen';
import createHomeScreenFactory from './AppRoot/HomeScreen';
import createHistoryScreenFactory from './AppRoot/HistoryScreen';
import createLeaderboardsScreenFactory from './AppRoot/LeaderboardsScreen';
import createStarredScreenFactory from './AppRoot/StarredScreen';
import classNames from 'classnames';
import Menu from './AppRoot/Menu';
import AppApi from '../AppApi';
import { createQueryString, clientTypeQueryStringKey } from '../../../common/routing/queryString';
import ClientType from '../ClientType';
import UpdateToast from './UpdateToast';
import AppClipboardService from '../../../common/services/AppClipboardService';
import routes from '../../../common/routing/routes';
import { findRouteByLocation, findRouteByKey } from '../../../common/routing/Route';

interface Props extends RootProps {
	appApi: AppApi
}
interface State extends RootState {
	isPoppingScreen: boolean,
	menuState: 'opened' | 'closing' | 'closed',
}
export default class extends Root<Props, State, Pick<State, 'user'>> {
	private _isUpdateAvailable: boolean = false;

	// extension
	private readonly _sendExtensionInstructions = () => {
		return this.props.serverApi
			.sendExtensionInstructions()
			.then(() => {
				this._toaster.addToast('Email sent', Intent.Success);
			});
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
	private readonly _handleScreenAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'app-root_vc3j5h-screen-slide-out') {
			this.setState({
				isPoppingScreen: false,
				screens: this.state.screens.slice(0, this.state.screens.length - 1)
			});
		}
	};
	private _hasProcessedInitialLocation: boolean;
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _readFaq = () => {
		this.props.appApi.readArticle({
			title: 'FAQ',
			url: 'https://blog.reallyread.it/beta/2017/07/12/FAQ.html'
		} as Pick<UserArticle, 'title' | 'url'>);
		this._closeMenu();
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
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.pushScreen(ScreenKey.Settings);
	};
	private readonly _viewStarred = () => {
		this.replaceScreen(ScreenKey.Starred);
	};

	// window
	private readonly _handleVisibilityChange = () => {
		if (!this._isUpdateAvailable && !window.document.hidden) {
			this.fetchUpdateStatus().then(status => {
				if (status.isAvailable) {
					this._isUpdateAvailable = true;
					this._toaster.addToast(
						<UpdateToast onReloadWindow={this._reloadWindow} />,
						Intent.Success,
						false
					);
				}
			});
		}
	};

	constructor(props: Props) {
		super('app-root_vc3j5h', AppClipboardService, props);

		// screens
		const commentsScreenFactory = createCommentsScreenFactory(ScreenKey.Comments, {
			onCopyTextToClipboard: this._clipboard.copyText,
			onCreateAbsoluteUrl: this._createAbsoluteUrl,
			onGetArticle: this.props.serverApi.getArticle,
			onGetVerificationTokenData: this.props.serverApi.getVerificationTokenData,
			onGetComments: this.props.serverApi.getComments,
			onPostComment: this._postComment,
			onReadArticle: this._readArticle,
			onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
			onSetScreenState: this._setScreenState,
			onShareArticle: this._shareArticle,
			onToggleArticleStar: this._toggleArticleStar
		});
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Comments]: commentsScreenFactory,
			[ScreenKey.History]: createHistoryScreenFactory(ScreenKey.History, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onDeleteArticle: this._deleteArticle,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onOpenMenu: this._openMenu,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onGetLeaderboards: this.props.serverApi.getLeaderboards,
				onGetStats: this.props.serverApi.getUserStats,
			}),
			[ScreenKey.Proof]: commentsScreenFactory,
			[ScreenKey.Starred]: createStarredScreenFactory(ScreenKey.Starred, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onSendExtensionInstructions: this._sendExtensionInstructions,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			})
		};

		// state
		let screens: Screen[];
		let dialog: React.ReactNode;
		const route = findRouteByLocation(routes, props.initialLocation, [clientTypeQueryStringKey]);
		if (route.screenKey === ScreenKey.Read) {
			dialog = null;
			if (props.initialUser) {
				this._hasProcessedInitialLocation = true;
				screens = [
					this._screenFactoryMap[ScreenKey.Comments].create({
						path: findRouteByKey(routes, ScreenKey.Comments).createUrl(route.getPathParams(props.initialLocation.path))
					})
				];
			} else {
				this._hasProcessedInitialLocation = false;
				screens = [];
			}
		} else {
			const locationState = this.getLocationDependentState(props.initialLocation);
			dialog = locationState.dialog;
			if (props.initialUser) {
				this._hasProcessedInitialLocation = true;
				screens = [locationState.screen];
			} else {
				this._hasProcessedInitialLocation = false;
				screens = [];
			}
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
			let screen: Screen;
			if (this._hasProcessedInitialLocation) {
				screen = this
					.createScreen(ScreenKey.Home)
					.screen;
			} else {
				const route = findRouteByLocation(routes, this.props.initialLocation, [clientTypeQueryStringKey]);
				if (route.screenKey === ScreenKey.Read) {
					const pathParams = route.getPathParams(this.props.initialLocation.path);
					screen = this._screenFactoryMap[ScreenKey.Comments].create({
						path: findRouteByKey(routes, ScreenKey.Comments).createUrl(pathParams)
					});
					// iOS versions < 2.1 crash when calling readArticle using only the slug
					this.props.serverApi.getArticle(
						{ slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'] },
						result => {
							if (result.value) {
								this.props.appApi.readArticle(result.value);
							}
						}
					);
				} else {
					screen = this
						.getLocationDependentState(this.props.initialLocation)
						.screen;
				}
				this._hasProcessedInitialLocation = true;
			}
			this.setState({
				screens: [screen],
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
	protected reloadWindow() {
		window.location.reload(true);
	}
	protected renderBody() {
		const
			rootState = { user: this.state.user },
			topScreen = this.state.screens[this.state.screens.length - (this.state.isPoppingScreen ? 2 : 1)];
		let headerContent: React.ReactNode | undefined;
		if (topScreen && this._screenFactoryMap[topScreen.key].renderHeaderContent) {
			headerContent = this._screenFactoryMap[topScreen.key].renderHeaderContent(topScreen, rootState);
		}
		return (
			<>
				{this.state.user ?
					<>
						<Header
							content={headerContent}
							isTransitioningBack={this.state.isPoppingScreen}
							onBack={this._popScreen}
							titles={this.state.screens.map(screen => screen.titleContent || screen.title)}
						/>
						<div className="content">
							<ol className="screens">
								{this.state.screens.map((screen, index, screens) => (
									<li
										className={classNames('screen', {
											'slide-out': this.state.isPoppingScreen && index === screens.length - 1
										})}
										key={screen.key}
										onAnimationEnd={this._handleScreenAnimationEnd}
									>
										{this._screenFactoryMap[screen.key].render(screen, rootState)}
									</li>
								))}
							</ol>
						</div>
						<NavTray
							onViewHistory={this._viewHistory}
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewStarred={this._viewStarred}
							selectedScreenKey={this.state.screens[0].key}
						/>
						{this.state.menuState !== 'closed' ?
							<Menu
								isClosing={this.state.menuState === 'closing'}
								onClose={this._closeMenu}
								onClosed={this._hideMenu}
								onReadFaq={this._readFaq}
								onSignOut={this._signOut}
								onViewAdminPage={this._viewAdminPage}
								onViewInbox={this._viewInbox}
								onViewPrivacyPolicy={this._viewPrivacyPolicy}
								onViewSettings={this._viewSettings}
								selectedScreenKey={this.state.screens[0].key}
								userAccount={this.state.user}
							/> :
							null}
					</> :
					<AuthScreen
						captcha={this.props.captcha}
						onCreateAccount={this._createAccount}
						onOpenRequestPasswordResetDialog={this._openRequestPasswordResetDialog}
						onShowToast={this._toaster.addToast}
						onSignIn={this._signIn}
					/>}
				<DialogManager dialog={this.state.dialog} />
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
			</>
		);
	}
	protected viewComments(article: Pick<UserArticle, 'slug' | 'title'>) {
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
		super.componentDidMount();
		window.history.replaceState(
			null,
			null,
			'/' + createQueryString({ [clientTypeQueryStringKey]: ClientType.App })
		);
		window.document.addEventListener('visibilitychange', this._handleVisibilityChange);
		// iOS keyboard scroll bug
		window.setTimeout(() => {
			if (window.scrollY !== 0) {
				window.scrollTo(0, 0);
			}
		}, 100);
		// check for read url
		const route = findRouteByLocation(routes, this.props.initialLocation, [clientTypeQueryStringKey]);
		if (route.screenKey === ScreenKey.Read && this.props.initialUser) {
			const pathParams = route.getPathParams(this.props.initialLocation.path);
			// iOS versions < 2.1 crash when calling readArticle using only the slug
			// can't call serverApi for new request until it's been initialized
			window.setTimeout(() => {
				this.props.serverApi.getArticle(
					{ slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'] },
					result => {
						if (result.value) {
							this.props.appApi.readArticle(result.value);
						}
					}
				);
			}, 0);
		}
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
	}
}