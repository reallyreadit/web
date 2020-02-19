import * as React from 'react';
import Header from './BrowserRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavBar from './BrowserRoot/NavBar';
import Root, { Props as RootProps, State as RootState, SharedState as RootSharedState, TemplateSection, Screen, SharedEvents } from './Root';
import UserAccount, { areEqual as areUsersEqual } from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import Menu from './BrowserRoot/Menu';
import UserArticle from '../../../common/models/UserArticle';
import createCommentsScreenFactory from './BrowserRoot/CommentsScreen';
import createHomeScreenFactory from './BrowserRoot/HomeScreen';
import createLeaderboardsScreenFactory from './BrowserRoot/LeaderboardsScreen';
import BrowserApi from '../BrowserApi';
import ExtensionApi from '../ExtensionApi';
import { findRouteByKey, findRouteByLocation, parseUrlForRoute } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import EventSource from '../EventSource';
import UpdateToast from './UpdateToast';
import CommentThread from '../../../common/models/CommentThread';
import createReadScreenFactory from './BrowserRoot/ReadScreen';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseQueryString, unroutableQueryStringKeys, messageQueryStringKey, authServiceTokenQueryStringKey } from '../../../common/routing/queryString';
import Icon from '../../../common/components/Icon';
import Footer from './BrowserRoot/Footer';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './BrowserRoot/ProfileScreen';
import Post from '../../../common/models/social/Post';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import createInboxScreenFactory from './screens/InboxScreen';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import createAotdHistoryScreenFactory from './BrowserRoot/AotdHistoryScreen';
import CreateAccountDialog from './CreateAccountDialog';
import CreateAuthServiceAccountDialog from './CreateAuthServiceAccountDialog';
import SignInDialog from './SignInDialog';
import createBlogScreenFactory from './BrowserRoot/BlogScreen';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import createMyFeedScreenFactory from './screens/MyFeedScreen';

interface Props extends RootProps {
	browserApi: BrowserApi,
	extensionApi: ExtensionApi
}
interface State extends RootState {
	isExtensionInstalled: boolean | null,
	menuState: MenuState,
	welcomeMessage: WelcomeMessage | null
}
type MenuState = 'opened' | 'closing' | 'closed';
export type SharedState = RootSharedState & Pick<State, 'isExtensionInstalled'>;
type Events = SharedEvents & {
	'extensionInstallationStatusChanged': boolean
};
enum WelcomeMessage {
	AppleIdInvalidJwt = 'AppleIdInvalidJwt',
	AppleIdInvalidSession = 'AppleIdInvalidSession',
	AppleIdUnknownError = 'AppleIdUnknownError',
	Rebrand = 'rebrand'
}
const welcomeMessages = {
	[WelcomeMessage.AppleIdInvalidJwt]: 'We were unable to validate the ID token.',
	[WelcomeMessage.AppleIdInvalidSession]: 'We were unable to validate your session ID.',
	[WelcomeMessage.AppleIdUnknownError]: 'An unknown Apple authentication error occurred.',
	[WelcomeMessage.Rebrand]: 'Heads up, we changed our name. reallyread.it is now Readup!'
};
export default class extends Root<Props, State, SharedState, Events> {
	private _hasBroadcastInitialUser = false;
	private _isUpdateAvailable: boolean = false;
	private _updateCheckInterval: number | null = null;

	// app
	private readonly _copyAppReferrerTextToClipboard = (analyticsAction: string) => {
		this._clipboard.copyText(
			'com.readup.nativeClientClipboardReferrer:' +
			JSON.stringify({
				action: analyticsAction,
				currentPath: window.location.pathname,
				initialPath: this.props.initialLocation.path,
				marketingVariant: this.props.marketingVariant,
				referrerUrl: window.document.referrer,
				timestamp: Date.now(),
				// legacy compatibility
				marketingScreenVariant: this.props.marketingVariant,
				path: window.location.pathname
			})
		);
	};

	// dialogs
	private readonly _openSignInDialog = (analyticsAction: string) => {
		this._dialog.openDialog(
			<SignInDialog
				analyticsAction={analyticsAction}
				onCloseDialog={this._dialog.closeDialog}
				onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
				onShowToast={this._toaster.addToast}
				onSignIn={this._signIn}
				onSignInWithApple={this._signInWithApple}
			/>
		);
	};

	// events
	private readonly _registerExtensionChangeEventHandler = (handler: (isInstalled: boolean) => void) => {
		return this._eventManager.addListener('extensionInstallationStatusChanged', handler);
	};

	// extension
	private readonly _installExtension = () => {
		this.props.extensionApi.install();
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

	// welcome message
	private readonly _dismissWelcomeMessage = () => {
		this.setState({ welcomeMessage: null });
	};

	// routing
	private readonly _navTo = (url: string) => {
		const result = parseUrlForRoute(url);
		if (result.isInternal && result.route) {
			this.setScreenState({
				key: result.route.screenKey,
				method: 'push',
				urlParams: result.route.getPathParams ?
					result.route.getPathParams(result.url.pathname) :
					null
			});
			return true;
		} else if (!result.isInternal && result.url) {
			window.open(result.url.href, '_blank');
			return true;
		}
		return false;
	}

	// screens
	private readonly _viewAdminPage = () => {
		this.setScreenState({
			key: ScreenKey.Admin,
			method: 'replace'
		});
	};
	private readonly _viewAotdHistory = () => {
		this.setScreenState({
			key: ScreenKey.AotdHistory,
			method: 'push'
		});
	};
	private readonly _viewBlog = () => {
		this.setScreenState({
			key: ScreenKey.Blog,
			method: 'push'
		});
	};
	private readonly _viewHome = () => {
		this.setScreenState({
			key: ScreenKey.Home,
			method: 'replace'
		});
	};
	private readonly _viewInbox = () => {
		this.setScreenState({
			key: ScreenKey.Inbox,
			method: 'replace'
		});
	};
	private readonly _viewLeaderboards = () => {
		this.setScreenState({
			key: ScreenKey.Leaderboards,
			method: 'replace'
		});
	};
	private readonly _viewMyFeed = () => {
		this.setScreenState({
			key: ScreenKey.MyFeed,
			method: 'replace'
		});
	};
	private readonly _viewMyReads = () => {
		this.setScreenState({
			key: ScreenKey.MyReads,
			method: 'replace'
		});
	};
	private readonly _viewPrivacyPolicy = () => {
		this.setScreenState({
			key: ScreenKey.PrivacyPolicy,
			method: 'replace'
		});
	};
	private readonly _viewSettings = () => {
		this.setScreenState({
			key: ScreenKey.Settings,
			method: 'replace'
		});
	};
	private readonly _viewStats = () => {
		this.setScreenState({
			key: ScreenKey.Stats,
			method: 'replace'
		});
	};

	// sharing
	private readonly _handleShareRequest = () => {
		return [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter
		];
	};

	// user account
	private readonly _signInWithApple = (action: string) => {
		const url = new URL('https://appleid.apple.com/auth/authorize');
		url.searchParams.set('client_id', 'com.readup.webapp');
		url.searchParams.set('redirect_uri', 'https://api.readup.com/Auth/AppleWeb');
		url.searchParams.set('response_type', 'code id_token');
		url.searchParams.set('scope', 'email');
		url.searchParams.set('response_mode', 'form_post');
		url.searchParams.set(
			'state',
			JSON.stringify({
				action,
				client: this.props.serverApi.getClientHeaderValue(),
				currentPath: window.location.pathname,
				initialPath: this.props.initialLocation.path,
				marketingVariant: this.props.marketingVariant,
				referrerUrl: window.document.referrer
			})
		);
		window.location.href = url.href;
	};

	// window
	private readonly _handleHistoryPopState = () => {
		this.setScreenState({ method: 'pop' });
	};
	private readonly _handleVisibilityChange = () => {
		if (!window.document.hidden) {
			this.checkForUpdate();
			this.startUpdateCheckInterval();
		} else {
			this.stopUpdateCheckInterval();
		}
	};

	constructor(props: Props) {
		super('browser-root_6tjc3j', true, props);

		// dialogs
		this._dialogCreatorMap = {
			...this._dialogCreatorMap,
			[DialogKey.CreateAccount]: () => (
				<CreateAccountDialog
					analyticsAction="ExtensionBAIPopup"
					captcha={this.props.captcha}
					onCreateAccount={this._createAccount}
					onCloseDialog={this._dialog.closeDialog}
					onShowToast={this._toaster.addToast}
					onSignInWithApple={this._signInWithApple}
				/>
			),
			[DialogKey.CreateAuthServiceAccount]: (location) => (
				<CreateAuthServiceAccountDialog
					onCloseDialog={this._dialog.closeDialog}
					onCreateAuthServiceAccount={this._createAuthServiceAccount}
					onLinkExistingAccount={this._openLinkAuthServiceAccountDialog}
					onShowToast={this._toaster.addToast}
					token={parseQueryString(location.queryString)[authServiceTokenQueryStringKey]}
				/>
			),
			[DialogKey.SignIn]: () => (
				<SignInDialog
					analyticsAction="ExtensionBAIPopup"
					onCloseDialog={this._dialog.closeDialog}
					onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
					onShowToast={this._toaster.addToast}
					onSignIn={this._signIn}
					onSignInWithApple={this._signInWithApple}
				/>
			)
		};

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.AotdHistory]: createAotdHistoryScreenFactory(
				ScreenKey.AotdHistory,
				{
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetAotdHistory: this.props.serverApi.getAotdHistory,
					onGetCommunityReads: this.props.serverApi.getCommunityReads,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Blog]: createBlogScreenFactory(
				ScreenKey.Blog,
				{
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				marketingVariant: this.props.marketingVariant,
				onCloseDialog: this._dialog.closeDialog,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
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
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				marketingVariant: this.props.marketingVariant,
				onClearAlerts: this._clearAlerts,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
				onGetUserCount: this.props.serverApi.getUserCount,
				onInstallExtension: this._installExtension,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewAotdHistory: this._viewAotdHistory,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
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
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetLeaderboards: this.props.serverApi.getLeaderboards,
				onOpenDialog: this._dialog.openDialog,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.MyFeed]: createMyFeedScreenFactory(
				ScreenKey.MyFeed,
				{
					onClearAlerts: this._clearAlerts,
					onCloseDialog: this._dialog.closeDialog,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetPosts: this.props.serverApi.getPostsFromFollowees,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onFollowUser: this._followUser,
				onGetFollowees: this.props.serverApi.getFollowees,
				onGetFollowers: this.props.serverApi.getFollowers,
				onGetPosts: this.props.serverApi.getPostsFromUser,
				onGetProfile: this.props.serverApi.getProfile,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticlePostedHandler: this._registerArticlePostedEventHandler,
				onRegisterCommentUpdatedHandler: this._registerCommentUpdatedEventHandler,
				onRegisterFolloweeCountChangedHandler: this._registerFolloweeCountChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Read]: createReadScreenFactory(ScreenKey.Read, {
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onGetArticle: this.props.serverApi.getArticle,
				onInstallExtension: this._installExtension,
				onRegisterExtensionChangeHandler: this._registerExtensionChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState
			})
		};

		// route state
		const
			route = findRouteByLocation(routes, props.initialLocation, unroutableQueryStringKeys),
			locationState = this.getLocationDependentState(props.initialLocation);

		// query string state
		const
			queryStringParams = parseQueryString(props.initialLocation.queryString),
			welcomeMessage = queryStringParams[messageQueryStringKey] as WelcomeMessage;
		
		this.state = {
			...this.state,
			dialogs: (
				authServiceTokenQueryStringKey in queryStringParams ?
					[this._dialog.createDialog(
						this._dialogCreatorMap[DialogKey.CreateAuthServiceAccount](
							props.initialLocation,
							this.getSharedState()
						)
					)] :
					locationState.dialog && (
						route.dialogKey !== DialogKey.Followers ||
						props.initialUser
					) ?
						[this._dialog.createDialog(locationState.dialog)] :
						[]
			),
			isExtensionInstalled: null,
			menuState: 'closed',
			screens: [locationState.screen],
			welcomeMessage: (
				welcomeMessage in welcomeMessages ?
					welcomeMessage :
					null
			)
		};

		// BrowserApi
		props.browserApi.setTitle(locationState.screen.title);
		props.browserApi
			.addListener('articleUpdated', event => {
				this.onArticleUpdated(event, EventSource.Remote);
			})
			.addListener('articlePosted', post => {
				this.onArticlePosted(post, EventSource.Remote);
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', comment => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener('notificationPreferenceChanged', preference => {
				this.onNotificationPreferenceChanged(preference, EventSource.Remote);
			})
			.addListener('updateAvailable', version => {
				if (!this._isUpdateAvailable && version.compareTo(this.props.version) > 0) {
					this.setUpdateAvailable();
				}
			})
			.addListener('userSignedIn', user => {
				this.onUserSignedIn(user, SignInEventType.ExistingUser, EventSource.Remote);
			})
			.addListener('userSignedOut', () => {
				this.onUserSignedOut(EventSource.Remote);
			})
			.addListener('userUpdated', user => {
				if (!areUsersEqual(this.state.user, user)) {
					this.onUserUpdated(user, EventSource.Remote);
				}
			});

		// ExtensionApi
		props.extensionApi
			.addListener('articlePosted', post => {
				this.onArticlePosted(post, EventSource.Remote);
			})
			.addListener('articleUpdated', event => {
				this.onArticleUpdated(event, EventSource.Remote);
			})
			.addListener('change', isExtensionInstalled => {
				this.setState(
					{ isExtensionInstalled },
					() => {
						this._eventManager.triggerEvent('extensionInstallationStatusChanged', isExtensionInstalled);
					}
				);
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', comment => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener('userUpdated', user => {
				if (!areUsersEqual(this.state.user, user)) {
					this.onUserUpdated(user, EventSource.Remote);
				}
			});
	}
	private changeScreen(
		options: (
			(
				{
					key: ScreenKey,
					method: 'push' | 'replace',
					title?: string,
					urlParams?: { [key: string]: string }
				} | {
					method: 'pop'
				}
			)
		)
	) {
		let screens: Screen[];
		let title: string;
		if (options.method === 'pop') {
			if (this.state.screens.length > 1) {
				screens = this.state.screens.slice(0, this.state.screens.length - 1);
				title = this.state.screens[this.state.screens.length - 1].title;
			} else {
				const
					route = findRouteByLocation(routes, { path: window.location.pathname }),
					screen = this.createScreen(
						route.screenKey,
						(
							route.getPathParams ?
								route.getPathParams(window.location.pathname) :
								null
						)
					);
				screens = [screen];
				title = screen.title;
			}
		} else {
			const screen = this.createScreen(
				options.key,
				options.urlParams,
				options.title
			);
			screens = (
				options.method === 'push' ?
					[...this.state.screens, screen] :
					[screen]
			);
			title = screen.title;
			window.history.pushState(
				null,
				screen.title,
				screen.location.path + (screen.location.queryString || '')
			);
		}
		this.props.browserApi.setTitle(title);
		// send the pageview for the top screen
		this.props.analytics.sendPageview(screens[screens.length - 1]);
		// return the new state object
		return {
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed' as MenuState,
			screens
		};
	}
	private checkForUpdate() {
		if (!this._isUpdateAvailable) {
			this.fetchUpdateStatus().then(status => {
				if (status.isAvailable) {
					this.setUpdateAvailable();
					this.props.browserApi.updateAvailable(status.version);
				}
			});
		}
	}
	private setScreenState(
		options: (
			(
				{
					key: ScreenKey,
					method: 'push' | 'replace',
					title?: string,
					urlParams?: { [key: string]: string }
				} | {
					method: 'pop'
				}
			)
		)
	) {
		this.setState(
			this.changeScreen(options)
		);
	}
	private setUpdateAvailable() {
		this._isUpdateAvailable = true;
		this.stopUpdateCheckInterval();
		this._toaster.addToast(
			<UpdateToast onReloadWindow={this._reloadWindow} />,
			Intent.Success,
			false
		);
	}
	private startUpdateCheckInterval() {
		if (!this._isUpdateAvailable && !this._updateCheckInterval) {
			this._updateCheckInterval = window.setInterval(() => {
				this.checkForUpdate();
			}, 10 * 60 * 1000);
		}
	}
	private stopUpdateCheckInterval() {
		if (this._updateCheckInterval) {
			window.clearInterval(this._updateCheckInterval);
			this._updateCheckInterval = null;
		}
	}
	protected getPushDeviceForm() {
		return null as PushDeviceForm;
	}
	protected getSharedState() {
		return {
			isExtensionInstalled: this.state.isExtensionInstalled,
			user: this.state.user
		};
	}
	protected getSignUpAnalyticsForm(action: string) {
		return {
			action,
			currentPath: window.location.pathname,
			initialPath: this.props.initialLocation.path,
			marketingVariant: this.props.marketingVariant,
			referrerUrl: window.document.referrer
		};
	}
	protected onArticleUpdated(event: ArticleUpdatedEvent, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.articleUpdated(event);
			this.props.extensionApi.articleUpdated(event);
		}
		super.onArticleUpdated(event);
	}
	protected onArticlePosted(post: Post, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.articlePosted(post);
		}
		super.onArticlePosted(post);
	}
	protected onCommentPosted(comment: CommentThread, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.commentPosted(comment);
			this.props.extensionApi.commentPosted(comment);
		}
		super.onCommentPosted(comment);
	}
	protected onCommentUpdated(comment: CommentThread, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.commentUpdated(comment);
			this.props.extensionApi.commentUpdated(comment);
		}
		super.onCommentUpdated(comment);
	}
	protected onLocationChanged(path: string, title?: string) {
		window.history.pushState(
			null,
			title || window.document.title,
			path
		);
		if (title) {
			this.props.browserApi.setTitle(title);
		}
	}
	protected onNotificationPreferenceChanged(preference: NotificationPreference, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.notificationPreferenceChanged(preference);
		}
		super.onNotificationPreferenceChanged(preference);
	}
	protected onTitleChanged(title: string) {
		this.props.browserApi.setTitle(title);
	}
	protected onUserSignedIn(user: UserAccount, eventType: SignInEventType, eventSource: (EventSource | Partial<State>) = EventSource.Local) {
		// update analytics before potentially changing the screen
		this.props.analytics.setUserId(user.id);
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedIn(user);
		}
		const screenAuthLevel = findRouteByKey(routes, this.state.screens[0].key).authLevel;
		let supplementaryState: Partial<State>;
		if (screenAuthLevel != null && user.role !== screenAuthLevel) {
			supplementaryState = this.changeScreen({
				key: ScreenKey.Home,
				method: 'replace'
			});
		}
		return super.onUserSignedIn(user, eventType, supplementaryState);
	}
	protected onUserSignedOut(eventSource: (EventSource | Partial<State>) = EventSource.Local) {
		// update analytics before potentially changing the screen
		this.props.analytics.setUserId(null);
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedOut()
		}
		const screenAuthLevel = findRouteByKey(routes, this.state.screens[0].key).authLevel;
		let supplementaryState: Partial<State>;
		if (screenAuthLevel != null) {
			supplementaryState = this.changeScreen({
				key: ScreenKey.Home,
				method: 'replace'
			});
		}
		return super.onUserSignedOut(supplementaryState);
	}
	protected onUserUpdated(user: UserAccount, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userUpdated(user);
			this.props.extensionApi.userUpdated(user);
			if (!this._hasBroadcastInitialUser) {
				this._hasBroadcastInitialUser = true;
			}
		}
		super.onUserUpdated(user);
	}
	protected readArticle(article: UserArticle, ev: React.MouseEvent) {
		if (!this.state.user || !this.props.extensionApi.isInstalled) {
			ev.preventDefault();
			const [sourceSlug, articleSlug] = article.slug.split('_');
			this.setScreenState({
				key: ScreenKey.Read,
				method: 'replace',
				urlParams: { sourceSlug, articleSlug }
			});
		}
	}
	protected reloadWindow() {
		window.location.href = '/';
	}
	protected renderBody() {
		const
			topScreen = this.state.screens[this.state.screens.length - 1],
			sharedState = this.getSharedState();
		return (
			<>
				{this.state.welcomeMessage ?
					<div className="welcome-message">
						{welcomeMessages[this.state.welcomeMessage]}
						<Icon
							className="icon"
							name="cancel"
							onClick={this._dismissWelcomeMessage}
						/>
					</div> :
					null}
				{(
					topScreen.templateSection == null ||
					(topScreen.templateSection & TemplateSection.Header)
				 ) ?
					<Header
						isExtensionInstalled={this.state.isExtensionInstalled}
						onOpenMenu={this._openMenu}
						onOpenSignInDialog={this._openSignInDialog}
						onViewHome={this._viewHome}
						onViewInbox={this._viewInbox}
						user={this.state.user}
					/> :
					null}
				<main>
					{(
						(
							topScreen.templateSection == null ||
							(topScreen.templateSection & TemplateSection.Navigation)
						) &&
						this.state.user
					) ?
						<NavBar
							onViewBlog={this._viewBlog}
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewMyFeed={this._viewMyFeed}
							onViewMyReads={this._viewMyReads}
							onViewPrivacyPolicy={this._viewPrivacyPolicy}
							onViewProfile={this._viewProfile}
							selectedScreen={this.state.screens[0]}
							user={this.state.user}
						/> :
						null}
					<ol className="screens">
						{this.state.screens.map(screen => (
							<li
								className="screen"
								key={screen.id}
							>
								{this._screenFactoryMap[screen.key].render(screen, sharedState)}
								{(
									(
										screen.templateSection == null ||
										(screen.templateSection & TemplateSection.Footer)
									) &&
									(
										!this.state.user
									)
								) ?
									<Footer
										onViewBlog={this._viewBlog}
										onViewPrivacyPolicy={this._viewPrivacyPolicy}
									/> :
									null}
							</li>
						))}
					</ol>
				</main>
				{this.state.menuState !== 'closed' ?
					<Menu
						isClosing={this.state.menuState === 'closing'}
						onClose={this._closeMenu}
						onClosed={this._hideMenu}
						onSignOut={this._signOut}
						onViewAdminPage={this._viewAdminPage}
						onViewSettings={this._viewSettings}
						onViewStats={this._viewStats}
						selectedScreenKey={this.state.screens[0].key}
						userAccount={this.state.user}
					/> :
					null}
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
		this.setScreenState({
			key: ScreenKey.Comments,
			method: 'push',
			title: article.title,
			urlParams
		});
	}
	protected viewProfile(userName?: string) {
		this.setScreenState({
			key: ScreenKey.Profile,
			method: userName ? 'push' : 'replace',
			title: '@' + (userName || this.state.user.name),
			urlParams: { userName: userName || this.state.user.name }
		});
	}
	public componentDidMount() {
		super.componentDidMount();
		// clear query string used to set initial state
		window.history.replaceState(
			null,
			window.document.title,
			window.location.pathname
		);
		// add listener for back navigation
		window.addEventListener('popstate', this._handleHistoryPopState);
		// add listener for visibility change
		window.document.addEventListener('visibilitychange', this._handleVisibilityChange);
		if (!document.hidden) {
			this.startUpdateCheckInterval();
		}
		// update other tabs with the latest user data
		// descendent components' mount handlers will fire before this one
		// and might have cleared an alert and already broadcast a more
		// up to date version before this handler is fired and before
		// setState has updated the user we are seeing here
		if (!this._hasBroadcastInitialUser) {
			this.props.browserApi.userUpdated(this.state.user);
			this.props.extensionApi.userUpdated(this.state.user);
			this._hasBroadcastInitialUser = true;
		}
		// send the initial pageview
		this.props.analytics.sendPageview(this.state.screens[0]);
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.removeEventListener('popstate', this._handleHistoryPopState);
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
		if (this._updateCheckInterval) {
			window.clearInterval(this._updateCheckInterval);
		}
	}
}