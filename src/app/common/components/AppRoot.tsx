import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState, SharedEvents } from './Root';
import UserAccount, { hasAlert, areEqual as areUsersEqual } from '../../../common/models/UserAccount';
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
import { findRouteByLocation, parseUrlForRoute } from '../../../common/routing/Route';
import ShareChannel from '../../../common/sharing/ShareChannel';
import ShareData from '../../../common/sharing/ShareData';
import SemanticVersion from '../../../common/SemanticVersion';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './AppRoot/ProfileScreen';
import createInboxScreenFactory from './screens/InboxScreen';
import DialogKey from '../../../common/routing/DialogKey';
import AppActivationEvent from '../../../common/models/app/AppActivationEvent';
import RouteLocation from '../../../common/routing/RouteLocation';
import createAotdHistoryScreenFactory from './AppRoot/AotdHistoryScreen';

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
export default class extends Root<
	Props,
	State,
	Pick<State, 'user'>,
	SharedEvents & {
		'newStars': number
	}
> {
	private _isUpdateAvailable: boolean = false;
	private _signInLocation: RouteLocation | null;

	// events
	private readonly _registerNewStarsEventHandler = (handler: (count: number) => void) => {
		return this._eventManager.addListener('newStars', handler);
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

	// routing
	private readonly _navTo = (url: string) => {
		const result = parseUrlForRoute(url);
		if (result.isInternal && result.route) {
			if (result.route.screenKey === ScreenKey.Read) {
				const params = result.route.getPathParams(result.url.pathname);
				this.props.appApi.readArticle({ slug: params['sourceSlug'] + '_' + params['articleSlug'] });
			} else {
				this.pushScreen(
					result.route.screenKey,
					result.route.getPathParams ?
						result.route.getPathParams(result.url.pathname) :
						null
				);
			}
			return true;
		} else if (!result.isInternal && result.url) {
			this.props.appApi.openExternalUrl(result.url.href);
			return true;
		}
		return false;
	}

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
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _viewAdminPage = () => {
		this.pushScreen(ScreenKey.Admin);
	};
	private readonly _viewAotdHistory = () => {
		this.pushScreen(ScreenKey.AotdHistory);
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
	private readonly _viewMyReads = () => {
		this.replaceScreen(ScreenKey.MyReads);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
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
			[ScreenKey.AotdHistory]: createAotdHistoryScreenFactory(
				ScreenKey.AotdHistory,
				{
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetAotdHistory: this.props.serverApi.getAotdHistory,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments
				}
			),
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onDeleteComment: this._deleteComment,
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onPostArticle: this._openPostDialog,
				onPostComment: this._postComment,
				onPostCommentAddendum: this._postCommentAddendum,
				onPostCommentRevision: this._postCommentRevision,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterCommentPostedHandler: this._registerCommentPostedEventHandler,
				onRegisterCommentUpdatedHandler: this._registerCommentUpdatedEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onGetFolloweesPosts: this.props.serverApi.getPostsFromFollowees,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onOpenMenu: this._openMenu,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewAotdHistory: this._viewAotdHistory,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Inbox]: createInboxScreenFactory(
				ScreenKey.Inbox,
				{
					onClearAlerts: this._clearAlerts,
					onCloseDialog: this._dialog.closeDialog,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetInboxPosts: this.props.serverApi.getPostsFromInbox,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
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
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterNewStarsHandler: this._registerNewStarsEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				captcha: this.props.captcha,
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateAccount: this._createAccount,
				onFollowUser: this._followUser,
				onGetFollowees: this.props.serverApi.getFollowees,
				onGetFollowers: this.props.serverApi.getFollowers,
				onGetPosts: this.props.serverApi.getPostsFromUser,
				onGetProfile: this.props.serverApi.getProfile,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onOpenPasswordResetRequestDialog: this._openRequestPasswordResetDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticlePostedHandler: this._registerArticlePostedEventHandler,
				onRegisterCommentUpdatedHandler: this._registerCommentUpdatedEventHandler,
				onRegisterFolloweeCountChangedHandler: this._registerFolloweeCountChangedEventHandler,
				onShare: this._handleShareRequest,
				onShowToast: this._toaster.addToast,
				onSignIn: this._signIn,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread
			})
		};

		// state
		const { screens, dialog } = this.processNavigationRequest(props.initialUser, props.initialLocation);
		this.state = {
			...this.state,
			dialogs: (
				dialog ?
					[this._dialog.createDialog(dialog)] :
					[]
			),
			isPoppingScreen: false,
			menuState: 'closed',
			screens
		};

		// AppApi
		props.appApi
			.addListener(
				'alertStatusUpdated',
				status => {
					if (this.state.user) {
						const updatedUser = {
							...this.state.user,
							...status
						};
						if (!areUsersEqual(updatedUser, this.state.user)) {
							this.onUserUpdated(updatedUser);
						}
					}
				}
			)
			.addListener('articlePosted', post => {
				// migrate deprecated article property if required due to an outdated app
				if (!post.article.datesPosted) {
					post.article.datesPosted = [];
					if ((post.article as any).datePosted) {
						post.article.datesPosted.push((post.article as any).datePosted);
					}
				}
				// create addenda array if required due to an outdated app
				if (post.comment && !post.comment.addenda) {
					post.comment.addenda = [];
				}
				this.onArticlePosted(post);
			})
			.addListener('articleUpdated', event => {
				// migrate deprecated article property if required due to an outdated app
				if (!event.article.datesPosted) {
					event.article.datesPosted = [];
					if ((event.article as any).datePosted) {
						event.article.datesPosted.push((event.article as any).datePosted);
					}
				}
				this.onArticleUpdated(event);
			})
			.addListener('commentPosted', comment => {
				// create addenda array if required due to an outdated app
				if (!comment.addenda) {
					comment.addenda = [];
				}
				this.onCommentPosted(comment);
			})
			.addListener('commentUpdated', comment => {
				// create addenda array if required due to an outdated app
				if (!comment.addenda) {
					comment.addenda = [];
				}
				this.onCommentUpdated(comment);
			})
			.addListener(
				'didBecomeActive',
				(() => {
					let lastUserCheck = 0;
					return (event: AppActivationEvent) => {
						const now = Date.now();
						if (
							(event.badgeCount || hasAlert(this.state.user)) &&
							now - lastUserCheck > 60 * 1000
						) {
							props.serverApi.getUserAccount(
								result => {
									if (result.value) {
										if (!areUsersEqual(result.value, this.state.user)) {
											this.onUserUpdated(result.value);
										}
										lastUserCheck = now;
									}
								}
							);
						}
						if (event.newStarCount) {
							this._eventManager.triggerEvent('newStars', event.newStarCount);
						}
					};
				})()
			)
			.addListener(
				'loadUrl',
				urlString => {
					// check if the url matches a route
					const
						url = new URL(urlString),
						location = {
							path: url.pathname,
							queryString: url.search
						},
						route = findRouteByLocation(routes, location, unroutableQueryStringKeys);
					if (route) {
						const { screens, dialog } = this.processNavigationRequest(this.state.user, location);
						this.setState({
							dialogs: (
								dialog ?
									[this._dialog.createDialog(dialog)] :
									[]
							),
							isPoppingScreen: false,
							menuState: 'closed',
							screens
						});
					} else {
						// must be a redirect url or broken link
						// send to server for appropriate redirect
						window.location.href = urlString;
					}
				}
			);
	}
	private processNavigationRequest(user: UserAccount | null, location: RouteLocation) {
		let screens: Screen[];
		let dialog: React.ReactNode;
		const route = findRouteByLocation(routes, location, unroutableQueryStringKeys);
		if (route.screenKey === ScreenKey.Read) {
			dialog = null;
			if (user) {
				screens = [
					this.createScreen(ScreenKey.Comments, route.getPathParams(location.path))
				];
			} else {
				this._signInLocation = location;
				screens = [];
			}
		} else {
			const locationState = this.getLocationDependentState(location);
			if (user) {
				screens = [locationState.screen];
				dialog = locationState.dialog;
			} else {
				this._signInLocation = location;
				screens = [];
				dialog = (
					route.dialogKey === DialogKey.ResetPassword ?
						locationState.dialog :
						null
				);
			}
		}
		return { screens, dialog };
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
	protected getPushDeviceForm() {
		return {
			installationId: this.props.appApi.deviceInfo.installationId,
			name: this.props.appApi.deviceInfo.name,
			token: this.props.appApi.deviceInfo.token
		};
	}
	protected getSharedState() {
		return { user: this.state.user };
	}
	protected onUserSignedIn(user: UserAccount) {
		// sync auth state with app
		this.props.appApi.syncAuthCookie(user);
		// set screen
		let screen: Screen;
		if (!this._signInLocation) {
			screen = this.createScreen(ScreenKey.Home);
		} else {
			const route = findRouteByLocation(routes, this._signInLocation, unroutableQueryStringKeys);
			if (route.screenKey === ScreenKey.Read) {
				const
					pathParams = route.getPathParams(this._signInLocation.path),
					slug = pathParams['sourceSlug'] + '_' + pathParams['articleSlug'];
				screen = this.createScreen(ScreenKey.Comments, pathParams);
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
					.getLocationDependentState(this._signInLocation)
					.screen;
			}
			this._signInLocation = null;
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
		// sync auth state with app
		this.props.appApi.syncAuthCookie();
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
							onOpenMenu={this._openMenu}
							onViewInbox={this._viewInbox}
							titles={this.state.screens.map(screen => screen.titleContent || screen.title)}
							user={this.state.user}
						/>
						<div className="content">
							<ol className="screens">
								{this.state.screens.map((screen, index, screens) => (
									<li
										className={classNames('screen', {
											'slide-out': this.state.isPoppingScreen && index === screens.length - 1
										})}
										key={screen.id}
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
				<DialogManager
					dialogs={this.state.dialogs}
					onTransitionComplete={this._dialog.handleTransitionCompletion}
				/>
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
	protected viewProfile(userName?: string) {
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
	}
	public componentDidMount() {
		// sync auth state with app
		this.props.appApi.syncAuthCookie(this.props.initialUser);
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