import * as React from 'react';
import Header from './BrowserRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavBar from './BrowserRoot/NavBar';
import Root, { Props as RootProps, State as RootState, SharedState as RootSharedState, TemplateSection, Screen, SharedEvents } from './Root';
import NewReplyNotification, { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import Menu from './BrowserRoot/Menu';
import UserArticle from '../../../common/models/UserArticle';
import createCommentsScreenFactory from './BrowserRoot/CommentsScreen';
import createHomeScreenFactory from './BrowserRoot/HomeScreen';
import createLeaderboardsScreenFactory from './BrowserRoot/LeaderboardsScreen';
import BrowserApi from '../BrowserApi';
import ExtensionApi from '../ExtensionApi';
import { findRouteByKey, findRouteByLocation } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import EventSource from '../EventSource';
import ReadReadinessDialog, { Error as ReadReadinessError } from './BrowserRoot/ReadReadinessDialog';
import UpdateToast from './UpdateToast';
import CommentThread from '../../../common/models/CommentThread';
import createReadScreenFactory from './BrowserRoot/ReadScreen';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseQueryString, redirectedQueryStringKey } from '../../../common/routing/queryString';
import Icon from '../../../common/components/Icon';
import DeviceType from '../DeviceType';
import { isIosDevice } from '../userAgent';
import Footer from './BrowserRoot/Footer';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './screens/ProfileScreen';

interface Props extends RootProps {
	browserApi: BrowserApi,
	deviceType: DeviceType,
	extensionApi: ExtensionApi,
	newReplyNotification: NewReplyNotification | null
}
interface State extends RootState {
	isExtensionInstalled: boolean | null,
	isIosDevice: boolean | null,
	menuState: MenuState,
	showNewReplyIndicator: boolean,
	showRedirectBanner: boolean
}
type MenuState = 'opened' | 'closing' | 'closed';
export type SharedState = RootSharedState & Pick<State, 'isExtensionInstalled' | 'isIosDevice'>;
type Events = SharedEvents & {
	'extensionInstallationStatusChanged': boolean
};
export default class extends Root<Props, State, SharedState, Events> {
	private _isUpdateAvailable: boolean = false;
	private _updateCheckInterval: number | null = null;

	// app
	private readonly _copyAppReferrerTextToClipboard = () => {
		this._clipboard.copyText(
			'com.readup.nativeClientClipboardReferrer:' +
			JSON.stringify({
				marketingScreenVariant: this.props.marketingScreenVariant,
				path: window.location.pathname,
				referrerUrl: window.document.referrer,
				timestamp: Date.now()
			})
		);
	};

	// device
	private readonly _isDesktopDevice: boolean;

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

	// redirect notice
	private readonly _dismissRedirectBanner = () => {
		this.setState({ showRedirectBanner: false });
	};

	// screens
	private readonly _viewAdminPage = () => {
		this.setScreenState({
			key: ScreenKey.Admin,
			method: 'replace'
		});
	};
	private readonly _viewHome = () => {
		this.setScreenState({
			key: ScreenKey.Home,
			method: 'replace'
		});
	};
	private readonly _viewLeaderboards = () => {
		this.setScreenState({
			key: ScreenKey.Leaderboards,
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
	private readonly _viewProfile = (userName?: string) => {
		this.setScreenState({
			key: ScreenKey.Profile,
			method: userName ? 'push' : 'replace',
			urlParams: { userName: userName || this.state.user.name }
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

	// window
	private readonly _handleHistoryPopState = () => {
		if (this.state.screens.length > 1) {
			this.setScreenState({ method: 'pop' });
		} else {
			const route = findRouteByLocation(routes, { path: window.location.pathname });
			this.setScreenState({
				key: route.screenKey,
				method: 'replace',
				urlParams: (
					route.getPathParams ?
						route.getPathParams(window.location.pathname) :
						null
				)
			});
		}
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
		super('browser-root_6tjc3j', props);

		// device type
		this._isDesktopDevice = !!(props.deviceType & DeviceType.Desktop);

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onInstallExtension: this._installExtension,
				onPostComment: this._postComment,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterCommentPostedHandler: this._registerCommentPostedEventHandler,
				onRegisterExtensionChangeHandler: this._registerExtensionChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShowCreateAccountDialog: this._openCreateAccountDialog,
				onShowSignInDialog: this._openSignInDialog,
				onViewHomeScreen: this._viewHome,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				isDesktopDevice: this._isDesktopDevice,
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				marketingScreenVariant: this.props.marketingScreenVariant,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onInstallExtension: this._installExtension,
				onOpenCreateAccountDialog: this._openCreateAccountDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewPrivacyPolicy: this._viewPrivacyPolicy
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onCloseDialog: this._closeDialog,
				onGetLeaderboards: this.props.serverApi.getLeaderboards,
				onOpenDialog: this._openDialog,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				onCloseDialog: this._closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onFollowUser: this._followUser,
				onGetFollowees: this.props.serverApi.getFollowees,
				onGetFollowers: this.props.serverApi.getFollowers,
				onGetPosts: this.props.serverApi.getPosts,
				onGetProfile: this.props.serverApi.getProfile,
				onOpenDialog: this._openDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Read]: createReadScreenFactory(ScreenKey.Read, {
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onGetArticle: this.props.serverApi.getArticle,
				onInstallExtension: this._installExtension,
				onRegisterExtensionChangeHandler: this._registerExtensionChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShowCreateAccountDialog: this._openCreateAccountDialog,
				onShowSignInDialog: this._openSignInDialog,
				onViewHomeScreen: this._viewHome
			})
		};

		// state
		const locationState = this.getLocationDependentState(props.initialLocation);
		this.state = {
			...this.state,
			dialog: locationState.dialog,
			isExtensionInstalled: null,
			isIosDevice: (
				this._isDesktopDevice ?
					false :
					null
			),
			menuState: 'closed',
			screens: [locationState.screen],
			showNewReplyIndicator: hasNewUnreadReply(props.newReplyNotification),
			showRedirectBanner: redirectedQueryStringKey in parseQueryString(props.initialLocation.queryString)
		};

		// BrowserApi
		props.browserApi.setTitle(locationState.screen.title);
		props.browserApi
			.addListener('articleUpdated', event => {
				this.onArticleUpdated(event, EventSource.Remote);
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('updateAvailable', version => {
				if (!this._isUpdateAvailable && version.compareTo(this.props.version) > 0) {
					this.setUpdateAvailable();
				}
			})
			.addListener('userSignedIn', user => {
				this.onUserSignedIn(user, EventSource.Remote);
			})
			.addListener('userSignedOut', () => {
				this.onUserSignedOut(EventSource.Remote);
			})
			.addListener('userUpdated', user => {
				this.onUserUpdated(user, EventSource.Remote);
			});

		// ExtensionApi
		props.extensionApi
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
			screens = this.state.screens.slice(0, this.state.screens.length - 1);
			title = this.state.screens[this.state.screens.length - 1].title;
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
			)
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
	protected getSharedState() {
		return {
			isExtensionInstalled: this.state.isExtensionInstalled,
			isIosDevice: this.state.isIosDevice,
			user: this.state.user
		};
	}
	protected onArticleUpdated(event: ArticleUpdatedEvent, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.articleUpdated(event);
			this.props.extensionApi.articleUpdated(event);
		}
		super.onArticleUpdated(event);
	}
	protected onCommentPosted(comment: CommentThread, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.commentPosted(comment);
			this.props.extensionApi.commentPosted(comment);
		}
		super.onCommentPosted(comment);
	}
	protected onTitleChanged(title: string) {
		this.props.browserApi.setTitle(title);
	}
	protected onUserSignedIn(user: UserAccount, eventSource: (EventSource | Partial<State>) = EventSource.Local) {
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
		super.onUserSignedIn(user, supplementaryState);
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
		super.onUserSignedOut(supplementaryState);
	}
	protected onUserUpdated(user: UserAccount, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userUpdated(user);
		}
		super.onUserUpdated(user);
	}
	protected readArticle(article: UserArticle, ev: React.MouseEvent) {
		if (!this.state.user || !this.props.extensionApi.isInstalled) {
			ev.preventDefault();
			this._openDialog(
				<ReadReadinessDialog
					articleUrl={article.url}
					error={!this.state.user ? ReadReadinessError.SignedOut : this.props.extensionApi.isBrowserCompatible ? ReadReadinessError.ExtensionNotInstalled : ReadReadinessError.IncompatibleBrowser}
					onCloseDialog={this._closeDialog}
					onInstallExtension={this._installExtension}
					onShowCreateAccountDialog={this._openCreateAccountDialog}
					onShowSignInDialog={this._openSignInDialog}
				/>
			);
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
				{this.state.showRedirectBanner ?
					<div className="redirect-banner">
						Heads up, we changed our name. reallyread.it is now Readup!
						<Icon
							className="icon"
							name="cancel"
							onClick={this._dismissRedirectBanner}
						/>
					</div> :
					null}
				{(
					topScreen.templateSection == null ||
					(topScreen.templateSection & TemplateSection.Header)
				 ) ?
					<Header
						isDesktopDevice={this._isDesktopDevice}
						isIosDevice={this.state.isIosDevice}
						isUserSignedIn={!!this.state.user}
						onOpenMenu={this._openMenu}
						onShowCreateAccountDialog={this._openCreateAccountDialog}
						onShowSignInDialog={this._openSignInDialog}
						onViewHome={this._viewHome}
						showNewReplyIndicator={this.state.showNewReplyIndicator}
					/> :
					null}
				<main>
					{(
						(
							topScreen.templateSection == null ||
							(topScreen.templateSection & TemplateSection.Navigation)
						) &&
						this.state.user &&
						this._isDesktopDevice
					) ?
						<NavBar
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewMyReads={this._viewMyReads}
							onViewPrivacyPolicy={this._viewPrivacyPolicy}
							onViewProfile={this._viewProfile}
							onViewStats={this._viewStats}
							selectedScreen={this.state.screens[0]}
							user={this.state.user}
						/> :
						null}
					<ol className="screens">
						{this.state.screens.map(screen => (
							<li
								className="screen"
								key={screen.key}
							>
								{this._screenFactoryMap[screen.key].render(screen, sharedState)}
								{(
									(
										screen.templateSection == null ||
										(screen.templateSection & TemplateSection.Footer)
									) &&
									(
										!this.state.user ||
										!this._isDesktopDevice
									)
								) ?
									<Footer
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
						selectedScreenKey={this.state.screens[0].key}
						showNewReplyNotification={this.state.showNewReplyIndicator}
						userAccount={this.state.user}
					/> :
					null}
				<DialogManager dialog={this.state.dialog} />
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
		this.props.browserApi.userUpdated(this.state.user);
		// update the extension with the latest notification data
		if (this.props.newReplyNotification) {
			this.props.extensionApi.newReplyNotificationUpdated(this.props.newReplyNotification);
		}
		// check user agent for device type
		if (this.state.isIosDevice == null) {
			this.setState({
				isIosDevice: isIosDevice(window.navigator.userAgent)
			});
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