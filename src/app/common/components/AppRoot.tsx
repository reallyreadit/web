import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState, SharedEvents } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import UserArticle from '../../../common/models/UserArticle';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './AppRoot/CommentsScreen';
import createHomeScreenFactory from './AppRoot/HomeScreen';
import createLeaderboardsScreenFactory from './AppRoot/LeaderboardsScreen';
import classNames from 'classnames';
import Menu from './AppRoot/Menu';
import AppApi from '../AppApi';
import { createQueryString, clientTypeQueryStringKey, unroutableQueryStringKeys } from '../../../common/routing/queryString';
import ClientType from '../ClientType';
import UpdateToast from './UpdateToast';
import routes from '../../../common/routing/routes';
import { findRouteByLocation, findRouteByKey } from '../../../common/routing/Route';
import ShareChannel from '../../../common/sharing/ShareChannel';
import ShareData from '../../../common/sharing/ShareData';
import SemanticVersion from '../../../common/SemanticVersion';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './AppRoot/ProfileScreen';

interface Props extends RootProps {
	appApi: AppApi
}
type MenuState = 'opened' | 'closing' | 'closed';
interface State extends RootState {
	isPoppingScreen: boolean,
	menuState: MenuState,
}
const authScreenPageviewParams = {
	title: 'Auth',
	path: '/'
};
export default class extends Root<Props, State, Pick<State, 'user'>, SharedEvents> {
	private _isUpdateAvailable: boolean = false;

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
			// copy the screens array minus the top screen
			const screens = this.state.screens.slice(0, this.state.screens.length - 1);
			// pop the top screen
			this.setState({
				isPoppingScreen: false,
				screens
			});
			// send the pageview
			this.props.analytics.sendPageview(screens[screens.length - 1]);
		}
	};
	private _hasProcessedInitialLocation: boolean;
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _viewAdminPage = () => {
		this.pushScreen(ScreenKey.Admin);
	};
	private readonly _viewHome = () => {
		this.replaceScreen(ScreenKey.Home);
	};
	private readonly _viewLeaderboards = () => {
		this.replaceScreen(ScreenKey.Leaderboards);
	};
	private readonly _viewMyReads = () => {
		this.replaceScreen(ScreenKey.MyReads);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewProfile = (userName?: string) => {
		if (userName) {
			this.pushScreen(
				ScreenKey.Profile,
				{ userName }
			);
		} else {
			this.replaceScreen(
				ScreenKey.Profile,
				{ userName: this.state.user.name }
			);
		}
	};
	private readonly _viewSettings = () => {
		this.pushScreen(ScreenKey.Settings);
	};
	private readonly _viewStats = () => {
		this.replaceScreen(ScreenKey.Stats);
	};

	// sharing
	private readonly _handleShareRequest = (data: ShareData) => {
		if (
			this.props.appApi.appVersion &&
			this.props.appApi.appVersion.compareTo(new SemanticVersion('2.2.1')) > 0
		) {
			this.props.appApi.share(data);
			return [];
		} else {
			return [ShareChannel.Clipboard];
		}
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
		super('app-root_vc3j5h', props);

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onPostArticle: this._openPostDialog,
				onPostComment: this._postComment,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterCommentPostedHandler: this._registerCommentPostedEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onGetFolloweesPosts: this.props.serverApi.getPostsFromFollowees,
				onOpenMenu: this._openMenu,
				onPostArticle: this._openPostDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onCloseDialog: this._dialog.closeDialog,
				onGetLeaderboards: this.props.serverApi.getLeaderboards,
				onOpenDialog: this._dialog.openDialog,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onPostArticle: this._openPostDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				captcha: this.props.captcha,
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateAccount: this._createAccount,
				onFollowUser: this._followUser,
				onGetFollowees: this.props.serverApi.getFollowees,
				onGetFollowers: this.props.serverApi.getFollowers,
				onGetPosts: this.props.serverApi.getPostsFromUser,
				onGetProfile: this.props.serverApi.getProfile,
				onOpenDialog: this._dialog.openDialog,
				onOpenPasswordResetRequestDialog: this._openRequestPasswordResetDialog,
				onOpenMenu: this._openMenu,
				onPostArticle: this._openPostDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticlePostedHandler: this._registerArticlePostedEventHandler,
				onShare: this._handleShareRequest,
				onShowToast: this._toaster.addToast,
				onSignIn: this._signIn,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewThread: this._viewThread
			})
		};

		// state
		let screens: Screen[];
		let dialog: React.ReactNode;
		const route = findRouteByLocation(routes, props.initialLocation, unroutableQueryStringKeys);
		if (route.screenKey === ScreenKey.Read) {
			dialog = null;
			if (props.initialUser) {
				this._hasProcessedInitialLocation = true;
				screens = [
					this._screenFactoryMap[ScreenKey.Comments].create(
						{
							path: findRouteByKey(routes, ScreenKey.Comments).createUrl(route.getPathParams(props.initialLocation.path))
						},
						this.getSharedState()
					)
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
			dialog: (
				dialog ?
					{
						element: dialog,
						isClosing: false
					} :
					null
			),
			isPoppingScreen: false,
			menuState: 'closed',
			screens
		};

		// AppApi
		props.appApi
			.addListener('articlePosted', post => {
				this.onArticlePosted(post);
			})
			.addListener('articleUpdated', event => {
				this.onArticleUpdated(event);
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment);
			});
	}
	private pushScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		// create the new screen
		const screen = this.createScreen(key, urlParams, title);
		// push the screen
		this.setScreenState([
			...this.state.screens,
			screen
		]);
		// send the pageview
		this.props.analytics.sendPageview(screen);
	}
	private replaceScreen(key: ScreenKey, urlParams?: { [key: string]: string }) {
		// create the new screen
		const screen = this.createScreen(key, urlParams);
		// replace the screen
		this.setScreenState([screen]);
		// send the pageview
		this.props.analytics.sendPageview(screen);
	}
	private setScreenState(screens: Screen[]) {
		this.setState({
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed' as MenuState,
			screens
		});
	}
	protected getSharedState() {
		return { user: this.state.user };
	}
	protected onUserSignedIn(user: UserAccount) {
		let screen: Screen;
		if (this._hasProcessedInitialLocation) {
			screen = this.createScreen(ScreenKey.Home);
		} else {
			const route = findRouteByLocation(routes, this.props.initialLocation, unroutableQueryStringKeys);
			if (route.screenKey === ScreenKey.Read) {
				const
					pathParams = route.getPathParams(this.props.initialLocation.path),
					slug = pathParams['sourceSlug'] + '_' + pathParams['articleSlug'];
				screen = this._screenFactoryMap[ScreenKey.Comments].create(
					{
						path: findRouteByKey(routes, ScreenKey.Comments).createUrl(pathParams)
					},
					this.getSharedState()
				);
				// iOS versions < 2.1 crash when calling readArticle using only the slug
				if (
					!this.props.appApi.appVersion ||
					this.props.appApi.appVersion.compareTo(new SemanticVersion('2.1.1')) < 0
				) {
					this.props.serverApi.getArticle(
						{ slug },
						result => {
							if (result.value) {
								this.props.appApi.readArticle(result.value);
							}
						}
					);
				} else {
					this.props.appApi.readArticle({ slug });
				}
			} else {
				screen = this
					.getLocationDependentState(this.props.initialLocation)
					.screen;
			}
			this._hasProcessedInitialLocation = true;
		}
		// update analytics
		this.props.analytics.setUserId(user.id);
		this.props.analytics.sendPageview(screen);
		return super.onUserSignedIn(
			user,
			{ screens: [screen] }
		);
	}
	protected onUserSignedOut() {
		// update analytics
		this.props.analytics.setUserId(null);
		this.props.analytics.sendPageview(authScreenPageviewParams);
		return super.onUserSignedOut(
			{
				menuState: 'closed',
				screens: []
			}
		);
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
			sharedState = this.getSharedState(),
			topScreen = this.state.screens[this.state.screens.length - (this.state.isPoppingScreen ? 2 : 1)];
		let headerContent: React.ReactNode | undefined;
		if (topScreen && this._screenFactoryMap[topScreen.key].renderHeaderContent) {
			headerContent = this._screenFactoryMap[topScreen.key].renderHeaderContent(topScreen, sharedState);
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
										{this._screenFactoryMap[screen.key].render(screen, sharedState)}
									</li>
								))}
							</ol>
						</div>
						<NavTray
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewMyReads={this._viewMyReads}
							onViewProfile={this._viewProfile}
							onViewStats={this._viewStats}
							selectedScreen={this.state.screens[0]}
							user={this.state.user}
						/>
						{this.state.menuState !== 'closed' ?
							<Menu
								isClosing={this.state.menuState === 'closing'}
								onClose={this._closeMenu}
								onClosed={this._hideMenu}
								onSignOut={this._signOut}
								onViewAdminPage={this._viewAdminPage}
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
				{this.state.dialog ?
					<DialogManager
						dialog={this.state.dialog.element}
						isClosing={this.state.dialog.isClosing}
						onRemove={this._dialog.removeDialog}
					/> :
					null}
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
			</>
		);
	}
	protected viewComments(article: Pick<UserArticle, 'slug' | 'title'>, highlightedCommentId?: string) {
		const
			[sourceSlug, articleSlug] = article.slug.split('_'),
			urlParams: { [key: string]: string } = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			};
		if (highlightedCommentId != null) {
			urlParams['commentId'] = highlightedCommentId;
		}
		this.pushScreen(
			ScreenKey.Comments,
			urlParams
		);
	}
	public componentDidMount() {
		// super
		super.componentDidMount();
		// get the initial route
		const initialRoute = findRouteByLocation(routes, this.props.initialLocation, unroutableQueryStringKeys);
		// replace initial route in history
		window.history.replaceState(
			null,
			null,
			'/' + createQueryString({ [clientTypeQueryStringKey]: ClientType.App })
		);
		// add visibility change listener
		window.document.addEventListener('visibilitychange', this._handleVisibilityChange);
		// send the initial pageview
		this.props.analytics.sendPageview(
			this.props.initialUser ?
				{
					title: initialRoute.analyticsName,
					path: this.props.initialLocation.path
				} :
				authScreenPageviewParams
		);
		// iOS keyboard scroll bug
		window.setTimeout(() => {
			if (window.scrollY !== 0) {
				window.scrollTo(0, 0);
			}
		}, 100);
		// check for read url (the following condition can only be true in old iOS clients)
		if (initialRoute.screenKey === ScreenKey.Read && this.props.initialUser) {
			const
				pathParams = initialRoute.getPathParams(this.props.initialLocation.path),
				slug = pathParams['sourceSlug'] + '_' + pathParams['articleSlug'];
			// iOS versions < 2.1 crash when calling readArticle using only the slug
			if (
				!this.props.appApi.appVersion ||
				this.props.appApi.appVersion.compareTo(new SemanticVersion('2.1.1')) < 0
			) {
				// can't call serverApi for new request until it's been initialized
				window.setTimeout(() => {
					this.props.serverApi.getArticle(
						{ slug },
						result => {
							if (result.value) {
								this.props.appApi.readArticle(result.value);
							}
						}
					);
				}, 0);
			} else {
				this.props.appApi.readArticle({ slug });
			}
		}
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
	}
}