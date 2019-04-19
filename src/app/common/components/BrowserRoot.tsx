import * as React from 'react';
import Header from './BrowserRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavBar from './BrowserRoot/NavBar';
import Root, { Props as RootProps, State as RootState, SharedState as RootSharedState, TemplateSection } from './Root';
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
import createStarredScreenFactory from './BrowserRoot/StarredScreen';
import BrowserApi from '../BrowserApi';
import ExtensionApi from '../ExtensionApi';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import EventSource from '../EventSource';
import ReadReadinessDialog, { Error as ReadReadinessError } from './BrowserRoot/ReadReadinessDialog';
import UpdateToast from './UpdateToast';
import { createScreenFactory as createInboxPageScreenFactory } from './InboxPage';
import CommentThread from '../../../common/models/CommentThread';
import createReadScreenFactory from './BrowserRoot/ReadScreen';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseQueryString, redirectedQueryStringKey } from '../../../common/routing/queryString';
import Icon from '../../../common/components/Icon';
import DeviceType from '../DeviceType';
import { isIosDevice } from '../userAgent';
import Footer from './BrowserRoot/Footer';

interface Props extends RootProps {
	browserApi: BrowserApi,
	deviceType: DeviceType,
	extensionApi: ExtensionApi,
	newReplyNotification: NewReplyNotification | null
}
interface State extends RootState {
	isExtensionInstalled: boolean | null,
	isIosDevice: boolean | null,
	menuState: 'opened' | 'closing' | 'closed',
	showNewReplyIndicator: boolean,
	showRedirectBanner: boolean
}
export type SharedState = RootSharedState & Pick<State, 'isExtensionInstalled' | 'isIosDevice'>;
export default class extends Root<Props, State, SharedState> {
	private _isUpdateAvailable: boolean = false;
	private _updateCheckInterval: number | null = null;

	// app
	private readonly _copyAppReferrerTextToClipboard = () => {
		this._clipboard.copyText(
			'com.readup.nativeClientClipboardReferrer:' +
			JSON.stringify({
				path: window.location.pathname,
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
	private readonly _extensionChangeEventHandlers: ((isInstalled: boolean) => void)[] = [];
	private readonly _userChangeEventHandlers: ((newUser: UserAccount) => void)[] = [];
	private readonly _registerExtensionChangeEventHandler = (handler: (isInstalled: boolean) => void) => {
		return this.registerEventHandler(this._extensionChangeEventHandlers, handler);
	};
	private readonly _registerUserChangeEventHandler = (handler: (newUser: UserAccount | null) => void) => {
		return this.registerEventHandler(this._userChangeEventHandlers, handler);
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
	private readonly _viewPrivacyPolicy = () => {
		this.setState(this.replaceScreen(ScreenKey.PrivacyPolicy));
	};
	private readonly _viewSettings = () => {
		this.setState(this.replaceScreen(ScreenKey.Settings));
	};
	private readonly _viewStarred = () => {
		this.setState(this.replaceScreen(ScreenKey.Starred));
	};
	private readonly _viewThread = (comment: CommentThread) => {
		if (!comment.dateRead) {
			this.props.serverApi.readReply(comment.id);
		}
		this.viewComments(
			{
				slug: comment.articleSlug,
				title: comment.articleTitle
			},
			comment.id
		);
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
		const screen = this.getLocationDependentState({ path: window.location.pathname }).screen;
		this.setState({ screens: [screen] });
		this.props.browserApi.setTitle(screen.title);
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
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShowCreateAccountDialog: this._openCreateAccountDialog,
				onShowSignInDialog: this._openSignInDialog,
				onViewHomeScreen: this._viewHome,
				onToggleArticleStar: this._toggleArticleStar
			}),
			[ScreenKey.History]: createHistoryScreenFactory(ScreenKey.History, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler:this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				isDesktopDevice: this._isDesktopDevice,
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onInstallExtension: this._installExtension,
				onOpenCreateAccountDialog: this._openCreateAccountDialog,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewPrivacyPolicy: this._viewPrivacyPolicy
			}),
			[ScreenKey.Inbox]: createInboxPageScreenFactory(ScreenKey.Inbox, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetReplies: this.props.serverApi.listReplies,
				onShare: this._handleShareRequest,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onGetLeaderboards: this.props.serverApi.getLeaderboards,
				onGetStats: this.props.serverApi.getUserStats,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler
			}),
			[ScreenKey.Read]: createReadScreenFactory(ScreenKey.Read, {
				isBrowserCompatible: this.props.extensionApi.isBrowserCompatible,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onGetArticle: this.props.serverApi.getArticle,
				onInstallExtension: this._installExtension,
				onRegisterExtensionChangeHandler: this._registerExtensionChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShowCreateAccountDialog: this._openCreateAccountDialog,
				onShowSignInDialog: this._openSignInDialog,
				onViewHomeScreen: this._viewHome
			}),
			[ScreenKey.Starred]: createStarredScreenFactory(ScreenKey.Starred, {
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerUserChangeEventHandler,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
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
			.addListener('articleUpdated', article => {
				// TODO: upate articles from other tabs
			})
			.addListener('updateAvailable', version => {
				if (!this._isUpdateAvailable && version > this.props.version) {
					this.setUpdateAvailable();
				}
			})
			.addListener('userUpdated', user => {
				if (
					(this.state.user && !user) ||
					(!this.state.user && user)
				) {
					this.onUserChanged(user, EventSource.Sync);
				} else {
					this.setState({ user });
				}
			});

		// ExtensionApi
		props.extensionApi
			.addListener('articleUpdated', ev => {
				this._articleChangeEventHandlers.forEach(handler => {
					handler(ev.article, ev.isCompletionCommit);
				});
			})
			.addListener('change', isExtensionInstalled => {
				this.setState({ isExtensionInstalled });
				this._extensionChangeEventHandlers.forEach(handler => {
					handler(isExtensionInstalled);
				});
			})
			.addListener('commentPosted', comment => {
				this._commentPostedEventHandlers.forEach(handler => {
					handler(comment);
				});
			});
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
	private replaceScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string): Pick<State, 'menuState' | 'screens'> {
		const { screen, url } = this.createScreen(key, urlParams, title);
		this.props.browserApi.setTitle(screen.title);
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
	protected onTitleChanged(title: string) {
		this.props.browserApi.setTitle(title);
	}
	protected onUserChanged(userAccount: UserAccount | null, source: EventSource) {
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
		if (source === EventSource.Original) {
			this.props.browserApi.updateUser(userAccount);
		}
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
			screen = this.state.screens[0],
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
					screen.templateSection == null ||
					(screen.templateSection & TemplateSection.Header)
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
							screen.templateSection == null ||
							(screen.templateSection & TemplateSection.Navigation)
						) &&
						this.state.user &&
						this._isDesktopDevice
					) ?
						<NavBar
							onViewHistory={this._viewHistory}
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewPrivacyPolicy={this._viewPrivacyPolicy}
							onViewStarred={this._viewStarred}
							selectedScreenKey={screen.key}
						/> :
						null}
					<div className="screen">
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
		this.setState(this.replaceScreen(
			ScreenKey.Comments,
			urlParams,
			article.title
		));
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
		this.props.browserApi.updateUser(this.state.user);
		// update the extension with the latest notification data
		if (this.props.newReplyNotification) {
			this.props.extensionApi.updateNewReplyNotification(this.props.newReplyNotification);
		}
		// check user agent for device type
		if (this.state.isIosDevice == null) {
			this.setState({
				isIosDevice: isIosDevice(window.navigator.userAgent)
			});
		}
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