import * as React from 'react';
import Header from './BrowserRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavBar from './BrowserRoot/NavBar';
import Root, { Props as RootProps, State as RootState, SharedState as RootSharedState, TemplateSection, Screen, Events } from './Root';
import UserAccount, { areEqual as areUsersEqual } from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import Menu from './BrowserRoot/Menu';
import UserArticle from '../../../common/models/UserArticle';
import createCommentsScreenFactory from './BrowserRoot/CommentsScreen';
import createHomeScreenFactory from './BrowserRoot/HomeScreen';
import createLeaderboardsScreenFactory from './screens/LeaderboardsScreen';
import BrowserApiBase from '../../../common/BrowserApiBase';
import ExtensionApi from '../ExtensionApi';
import { findRouteByKey, findRouteByLocation, parseUrlForRoute } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import EventSource from '../EventSource';
import UpdateToast from './UpdateToast';
import CommentThread from '../../../common/models/CommentThread';
import createReadScreenFactory from './BrowserRoot/ReadScreen';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseQueryString, unroutableQueryStringKeys, messageQueryStringKey, authServiceTokenQueryStringKey, extensionInstalledQueryStringKey, extensionAuthQueryStringKey, createQueryString, appReferralQueryStringKey } from '../../../common/routing/queryString';
import Icon from '../../../common/components/Icon';
import Footer from './BrowserRoot/Footer';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './BrowserRoot/ProfileScreen';
import Post from '../../../common/models/social/Post';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import createAotdHistoryScreenFactory from './BrowserRoot/AotdHistoryScreen';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import NewPlatformNotificationRequestDialog from './BrowserRoot/NewPlatformNotificationRequestDialog';
import { DeviceType, isCompatibleBrowser } from '../../../common/DeviceType';
import createSettingsScreenFactory from './SettingsPage';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import * as Cookies from 'js-cookie';
import { extensionInstallationRedirectPathCookieKey } from '../../../common/cookies';
import ExtensionReminderDialog from './BrowserRoot/ExtensionReminderDialog';
import OnboardingFlow, { Props as OnboardingProps, Step as OnboardingStep } from './BrowserRoot/OnboardingFlow';
import { ExitReason as OnboardingExitReason } from '../../../common/components/BrowserOnboardingFlow';
import ShareForm from '../../../common/models/analytics/ShareForm';
import { AuthServiceBrowserLinkResponse, isAuthServiceBrowserLinkSuccessResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthenticationError from '../../../common/models/auth/AuthenticationError';
import createAuthorScreenFactory from './screens/AuthorScreen';
import createNotificationsScreenFactory from './screens/NotificationsScreen';
import createDiscoverScreenFactory from './screens/DiscoverScreen';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference, { getClientDefaultDisplayPreference } from '../../../common/models/userAccounts/DisplayPreference';
import { formatIsoDateAsDotNet } from '../../../common/format';
import HttpEndpoint, { createUrl } from '../../../common/HttpEndpoint';
import BrowserPopupResponseResponse from '../../../common/models/auth/BrowserPopupResponseResponse';
import StripeSubscriptionPrompt from './BrowserRoot/StripeSubscriptionPrompt';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import Lazy from '../../../common/Lazy';
import Fetchable from '../../../common/Fetchable';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { SubscriptionStatusType, SubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import { StripeSubscriptionCreationRequest } from '../../../common/models/subscriptions/StripeSubscriptionCreationRequest';
import { SubscriptionPrice, isSubscriptionPriceLevel } from '../../../common/models/subscriptions/SubscriptionPrice';
import { StripePaymentResponseType, StripePaymentResponse } from '../../../common/models/subscriptions/StripePaymentResponse';
import { createMyImpactScreenFactory } from './screens/MyImpactScreen';

interface Props extends RootProps {
	browserApi: BrowserApiBase,
	deviceType: DeviceType,
	extensionApi: ExtensionApi,
	staticServerEndpoint: HttpEndpoint,
	stripeLoader: Lazy<Promise<Stripe>> | null
}
type OnboardingState = Pick<OnboardingProps, 'analyticsAction' | 'authServiceToken' | 'initialAuthenticationStep' | 'passwordResetEmail' | 'passwordResetToken'>;
interface State extends RootState {
	isExtensionInstalled: boolean,
	menuState: MenuState,
	onboarding: OnboardingState | null,
	welcomeMessage: WelcomeMessage | null
}
type MenuState = 'opened' | 'closing' | 'closed';
export type SharedState = RootSharedState & Pick<State, 'isExtensionInstalled'>;
enum WelcomeMessage {
	AppleIdInvalidJwt = 'AppleInvalidAuthToken',
	AppleIdInvalidSession = 'AppleInvalidSessionId',
	Rebrand = 'rebrand',
	TwitterEmailAddressRequired = 'TwitterEmailAddressRequired',
	TwitterVerificationFailed = 'TwitterInvalidAuthToken'
}
const welcomeMessages = {
	[WelcomeMessage.AppleIdInvalidJwt]: 'We were unable to validate the ID token.',
	[WelcomeMessage.AppleIdInvalidSession]: 'We were unable to validate your session ID.',
	[WelcomeMessage.Rebrand]: 'Heads up, we changed our name. reallyread.it is now Readup!',
	[WelcomeMessage.TwitterEmailAddressRequired]: 'Your Twitter account must have a verified email address.',
	[WelcomeMessage.TwitterVerificationFailed]: 'We were unable to validate your Twitter credentials.'
};
export default class extends Root<Props, State, SharedState, Events> {
	private _hasBroadcastInitialUser = false;
	private _isUpdateAvailable: boolean = false;
	private _updateCheckInterval: number | null = null;

	// app
	private readonly _copyAppReferrerTextToClipboard = (analyticsAction: string) => {
		this._clipboard.copyText(
			createUrl(
				this.props.webServerEndpoint,
				'/',
				{
					[appReferralQueryStringKey]: JSON.stringify({
						action: analyticsAction,
						currentPath: window.location.pathname,
						initialPath: this.props.initialLocation.path,
						referrerUrl: window.document.referrer,
						timestamp: Date.now()
					})
				}
			)
		);
	};

	// dialogs
	private readonly _openNewPlatformNotificationRequestDialog = () => {
		this._dialog.openDialog(
			<NewPlatformNotificationRequestDialog
				onCloseDialog={this._dialog.closeDialog}
				onShowToast={this._toaster.addToast}
				onSubmitRequest={this.props.serverApi.logNewPlatformNotificationRequest}
			/>
		);
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
	private readonly _createAuthorScreenTitle = (name: string) => `${name} • Readup`;
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
	private readonly _viewAuthor = (slug: string, name?: string) => {
		this.setScreenState({
			key: ScreenKey.Author,
			method: 'push',
			urlParams: {
				slug
			},
			title: name ?
				this._createAuthorScreenTitle(name) :
				null
		});
	};
	private readonly _viewDiscover = () => {
		this.setScreenState({
			key: ScreenKey.Discover,
			method: 'replace'
		});
	};
	private readonly _viewHome = () => {
		this.setScreenState({
			key: ScreenKey.Home,
			method: 'replace'
		});
	};
	private readonly _viewNotifications = () => {
		this.setScreenState({
			key: ScreenKey.Notifications,
			method: 'replace'
		});
	};
	private readonly _viewLeaderboards = () => {
		this.setScreenState({
			key: ScreenKey.Leaderboards,
			method: 'replace'
		});
	};
	private readonly _viewMyImpact = () => {
		this.setScreenState({
			key: ScreenKey.MyImpact,
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
		return {
			channels: [
				ShareChannel.Clipboard,
				ShareChannel.Email,
				ShareChannel.Twitter
			],
			completionHandler: (data: ShareForm) => {

			}
		};
	};

	// user account
	private readonly _beginOnboarding = (analyticsAction: string) => {
		this.setState({
			onboarding: {
				analyticsAction,
				initialAuthenticationStep: OnboardingStep.CreateAccount
			}
		});
	};
	private readonly _beginOnboardingAtSignIn = (analyticsAction: string) => {
		this.setState({
			onboarding: {
				analyticsAction,
				initialAuthenticationStep: OnboardingStep.SignIn
			}
		});
	};
	private readonly _endOnboarding = (reason: OnboardingExitReason) => {
		if (reason === OnboardingExitReason.Completed) {
			this.props.serverApi
				.registerOrientationCompletion()
				.catch(
					() => {
						// ignore. non-critical error path. orientation will just be repeated
					}
				);
			this.onUserUpdated(
				{
					...this.state.user,
					dateOrientationCompleted: formatIsoDateAsDotNet(
						new Date()
							.toISOString()
					)
				},
				EventSource.Local
			);
		} else {
			this.setState({
				onboarding: null
			});
		}
	};
	protected readonly _linkAuthServiceAccount = (provider: AuthServiceProvider) => {
		// open window synchronously to avoid being blocked by popup blockers
		const popup = window.open(
			'',
			'_blank',
			'height=300,location=0,menubar=0,toolbar=0,width=400'
		);
		return new Promise<AuthServiceAccountAssociation>(
			(resolve, reject) => {
				this.props.serverApi
					.requestTwitterBrowserLinkRequestToken()
					.catch(
						error => {
							popup.close();
							this._toaster.addToast('Error Requesting Token', Intent.Danger);
							reject(error);
						}
					)
					.then(
						token => {
							if (!token) {
								return;
							}
							const url = new URL('https://api.twitter.com/oauth/authorize');
							url.searchParams.set('oauth_token', token.value);
							popup.location.href = url.href;
							const completionHandler = (response: AuthServiceBrowserLinkResponse) => {
								if (response.requestToken === token.value) {
									cleanupEventHandlers();
									popup.close();
									if (isAuthServiceBrowserLinkSuccessResponse(response)) {
										resolve(response.association);
									} else {
										let errorMessage: string;
										switch (response.error) {
											case AuthenticationError.Cancelled:
												errorMessage = 'Cancelled';
												break;
										}
										reject(new Error(errorMessage));
									}
								}
							};
							this.props.browserApi.addListener('authServiceLinkCompleted', completionHandler);
							const popupClosePollingInterval = window.setInterval(
								() => {
									if (popup.closed) {
										cleanupEventHandlers();
										reject(new Error('Cancelled'));
									}
								},
								1000
							);
							const cleanupEventHandlers = () => {
								this.props.browserApi.removeListener('authServiceLinkCompleted', completionHandler);
								window.clearInterval(popupClosePollingInterval);
							};
						}
					)
					.catch(reject);
			}
		);
	};
	private readonly _signInWithApple = (action: string) => {
		// can't use URLSearchParams here because apple requires spaces be
		// encoded as %20 (which encodeURIComponent does) instead of +
		const queryString = createQueryString({
			'client_id': 'com.readup.webapp',
			'redirect_uri': 'https://api.readup.com/Auth/AppleWeb',
			'response_type': 'code id_token',
			'scope': 'email',
			'response_mode': 'form_post',
			'state': JSON.stringify({
				client: this.props.serverApi.getClientHeaderValue(),
				...(this.getSignUpAnalyticsForm(action))
			})
		});
		window.location.href = 'https://appleid.apple.com/auth/authorize' + queryString;
		return new Promise<BrowserPopupResponseResponse>(
			() => {
				// leave the promise unresolved as the browser navigates
			}
		);
	};
	private readonly _signInWithTwitter = (action: string) => {
		return new Promise<BrowserPopupResponseResponse>(
			(resolve, reject) => {
				this.props.serverApi
					.requestTwitterBrowserAuthRequestToken({
						redirectPath: window.location.pathname,
						signUpAnalytics: this.getSignUpAnalyticsForm(action)
					})
					.then(
						token => {
							const url = new URL('https://api.twitter.com/oauth/authorize');
							url.searchParams.set('oauth_token', token.value);
							window.location.href = url.href;
						}
					)
					.catch(
						() => {
							reject(
								new Error('Error Requesting Token')
							);
						}
					);
				// leave the promise unresolved as the browser navigates
			}
		);
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
			[ScreenKey.Author]: createAuthorScreenFactory(
				ScreenKey.Author,
				{
					deviceType: this.props.deviceType,
					onBeginOnboarding: this._beginOnboarding,
					onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateTitle: profile => this._createAuthorScreenTitle(profile.name),
					onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
					onGetAuthorArticles: this.props.serverApi.getAuthorArticles,
					onGetAuthorProfile: this.props.serverApi.getAuthorProfile,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onSetScreenState: this._setScreenState,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboarding,
				onCloseDialog: this._dialog.closeDialog,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onDeleteComment: this._deleteComment,
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
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
			[ScreenKey.Discover]: createDiscoverScreenFactory(
				ScreenKey.Discover,
				{
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetSearchOptions: this.props.serverApi.getArticleSearchOptions,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onSearchArticles: this.props.serverApi.searchArticles,
					onShare: this._handleShareRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboarding,
				onClearAlerts: this._clearAlerts,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
				onGetUserCount: this.props.serverApi.getUserCount,
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
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
			[ScreenKey.Notifications]: createNotificationsScreenFactory(
				ScreenKey.Notifications,
				{
					onClearAlerts: this._clearAlerts,
					onCloseDialog: this._dialog.closeDialog,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetNotificationPosts: this.props.serverApi.getNotificationPosts,
					onGetReplyPosts: this.props.serverApi.getReplyPosts,
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
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(
				ScreenKey.Leaderboards,
				{
					deviceType: this.props.deviceType,
					onBeginOnboarding: this._beginOnboarding,
					onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
					onCloseDialog: this._dialog.closeDialog,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
					onGetAuthorLeaderboards: this.props.serverApi.getAuthorLeaderboards,
					onGetReaderLeaderboards: this.props.serverApi.getLeaderboards,
					onOpenDialog: this._dialog.openDialog,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onViewAuthor: this._viewAuthor,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.MyImpact]: createMyImpactScreenFactory(
				ScreenKey.MyImpact,
				{
					onGetSubscriptionDistributionSummary: this._getSubscriptionDistributionSummary,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onViewAuthor: this._viewAuthor
				}
			),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onOpenDialog: this._dialog.openDialog,
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
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboarding,
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
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
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
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboarding,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onGetArticle: this.props.serverApi.getArticle,
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState
			}),
			[ScreenKey.Settings]: createSettingsScreenFactory(
				ScreenKey.Settings,
				{
					onCloseDialog: this._dialog.closeDialog,
					onChangeDisplayPreference: this._changeDisplayPreference,
					onChangeEmailAddress: this._changeEmailAddress,
					onChangeNotificationPreference: this._changeNotificationPreference,
					onChangePassword: this._changePassword,
					onChangeTimeZone: this._changeTimeZone,
					onGetSettings: this._getSettings,
					onGetTimeZones: this.props.serverApi.getTimeZones,
					onLinkAuthServiceAccount: this._linkAuthServiceAccount,
					onOpenDialog: this._dialog.openDialog,
					onRegisterDisplayPreferenceChangedEventHandler: this._registerDisplayPreferenceChangedEventHandler,
					onRegisterNotificationPreferenceChangedEventHandler: this._registerNotificationPreferenceChangedEventHandler,
					onResendConfirmationEmail: this._resendConfirmationEmail,
					onSendPasswordCreationEmail: this._sendPasswordCreationEmail,
					onShowToast: this._toaster.addToast
				}
			)
		};

		// route state
		const
			route = findRouteByLocation(routes, props.initialLocation, unroutableQueryStringKeys),
			locationState = this.getLocationDependentState(props.initialLocation);

		// query string state
		const
			queryStringParams = parseQueryString(props.initialLocation.queryString),
			welcomeMessage = queryStringParams[messageQueryStringKey] as WelcomeMessage;

		// onboarding state
		let onboardingState: OnboardingState;
		if (authServiceTokenQueryStringKey in queryStringParams) {
			onboardingState = {
				authServiceToken: queryStringParams[authServiceTokenQueryStringKey]
			};
		} else if ('reset-password' in queryStringParams) {
			onboardingState = {
				passwordResetEmail: queryStringParams['email'],
				passwordResetToken: queryStringParams['token']
			};
		} else if (extensionAuthQueryStringKey in queryStringParams) {
			onboardingState = {
				initialAuthenticationStep: OnboardingStep.CreateAccount
			};
		} else if (
			extensionInstalledQueryStringKey in queryStringParams ||
			(
				props.initialUserProfile &&
				(
					!props.extensionApi.isInstalled ||
					!props.initialUserProfile.userAccount.dateOrientationCompleted
				) &&
				isCompatibleBrowser(props.deviceType) &&
				route.screenKey !== ScreenKey.EmailSubscriptions &&
				route.screenKey !== ScreenKey.ExtensionRemoval
			)
		) {
			onboardingState = { };
		}

		this.state = {
			...this.state,
			dialogs: [],
			isExtensionInstalled: props.extensionApi.isInstalled,
			menuState: 'closed',
			onboarding: onboardingState,
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
			.addListener(
				'authServiceLinkCompleted',
				response => {
					if (
						isAuthServiceBrowserLinkSuccessResponse(response) &&
						response.association.provider === AuthServiceProvider.Twitter &&
						!this.state.user.hasLinkedTwitterAccount
					) {
						this.onUserUpdated(
							{
								...this.state.user,
								hasLinkedTwitterAccount: true
							},
							EventSource.Remote
						);
					}
				}
			)
			.addListener('articlePosted', post => {
				this.onArticlePosted(post, EventSource.Remote);
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', comment => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener(
				'displayPreferenceChanged',
				preference => {
					this.onDisplayPreferenceChanged(preference, EventSource.Remote);
				}
			)
			.addListener(
				'extensionInstallationChanged',
				event => {
					this.props.extensionApi.extensionInstallationEventReceived(event);
				}
			)
			.addListener('notificationPreferenceChanged', preference => {
				this.onNotificationPreferenceChanged(preference, EventSource.Remote);
			})
			.addListener(
				'subscriptionStatusChanged',
				status => {
					this.onSubscriptionStatusChanged(status, EventSource.Remote);
				}
			)
			.addListener('updateAvailable', version => {
				if (!this._isUpdateAvailable && version.compareTo(this.props.version) > 0) {
					this.setUpdateAvailable();
				}
			})
			.addListener('userSignedIn', data => {
				let profile: WebAppUserProfile;
				// check for broadcast from legacy web app instance
				if ('userAccount' in data) {
					profile = data;
				} else {
					profile = {
						userAccount: data,
						subscriptionStatus: null
					};
					// manually check for display preference before setting default
					this.props.serverApi.getDisplayPreference(
						result => {
							if (result.value) {
								if (this.state.displayTheme == null) {
									this.onDisplayPreferenceChanged(result.value, EventSource.Local);
								}
							} else {
								this._changeDisplayPreference(
									getClientDefaultDisplayPreference()
								);
							}
						}
					);
				}
				this.onUserSignedIn(profile, SignInEventType.ExistingUser, EventSource.Remote);
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
			.addListener('installationStatusChanged', installedVersion => {
				this.setState({
					isExtensionInstalled: !!installedVersion
				});
			})
			.addListener('commentPosted', comment => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', comment => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener(
				'displayPreferenceChanged',
				preference => {
					this.onDisplayPreferenceChanged(preference, EventSource.Remote);
				}
			)
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
			displayTheme: this.state.displayTheme,
			isExtensionInstalled: this.state.isExtensionInstalled,
			subscriptionStatus: this.state.subscriptionStatus,
			user: this.state.user
		};
	}
	protected getSignUpAnalyticsForm(action: string) {
		return {
			action,
			currentPath: window.location.pathname,
			initialPath: this.props.initialLocation.path,
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
	protected onDisplayPreferenceChanged(preference: DisplayPreference, eventSource: EventSource) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.displayPreferenceChanged(preference);
			this.props.extensionApi.displayPreferenceChanged(preference);
		}
		super.onDisplayPreferenceChanged(preference, eventSource);
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
	protected onSubscriptionStatusChanged(status: SubscriptionStatus, eventSource: EventSource = EventSource.Local) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.subscriptionStatusChanged(status);
		}
		super.onSubscriptionStatusChanged(status);
	}
	protected onTitleChanged(title: string) {
		this.props.browserApi.setTitle(title);
	}
	protected onUserSignedIn(profile: WebAppUserProfile, eventType: SignInEventType, eventSource: EventSource) {
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedIn(profile);
			this.props.extensionApi.userSignedIn(profile);
			// legacy compatibility for versions prior to userSignedIn
			if (profile.displayPreference) {
				this.props.extensionApi.displayPreferenceChanged(profile.displayPreference);
			}
		}
		const screenAuthLevel = findRouteByKey(routes, this.state.screens[0].key).authLevel;
		let supplementaryState: Partial<State>;
		if (screenAuthLevel != null && profile.userAccount.role !== screenAuthLevel) {
			supplementaryState = this.changeScreen({
				key: ScreenKey.Home,
				method: 'replace'
			});
		}
		// if we're signed in from another tab and onboarding is not null
		// it means that some authentication step is displayed and should be cleared
		if (eventSource === EventSource.Remote && this.state.onboarding) {
			supplementaryState = {
				...supplementaryState,
				onboarding: null
			};
		}
		return super.onUserSignedIn(profile, eventType, eventSource, supplementaryState);
	}
	protected onUserSignedOut(eventSource: (EventSource | Partial<State>) = EventSource.Local) {
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedOut();
			this.props.extensionApi.userSignedOut();
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
		// check for orientation completion and end onboarding if active
		let supplementaryState: Partial<State>;
		if (
			this.state.onboarding != null &&
			this.state.user.dateOrientationCompleted == null &&
			user.dateOrientationCompleted != null
		) {
			supplementaryState = {
				onboarding: null
			};
		}
		super.onUserUpdated(user, eventSource, supplementaryState);
	}
	protected readArticle(article: UserArticle, ev?: React.MouseEvent<HTMLAnchorElement>) {
		if (
			this.state.user &&
			!this.state.subscriptionStatus.isUserFreeForLife &&
			this.state.subscriptionStatus.type !== SubscriptionStatusType.Active
		) {
			ev?.preventDefault();
			const
				confirmCardPayment: ((clientSecret: string, invoiceId: string) => Promise<StripePaymentResponse>) = (clientSecret, invoiceId) => this.props.stripeLoader.value
					.then(
						stripe => stripe.confirmCardPayment(clientSecret)
					)
					.then(
						result => {
							return this.props.serverApi
								.confirmStripeSubscriptionPayment({
									invoiceId
								})
								.then(handlePaymentResponse);
							}
					),
				getSubscriptionStatus = (callback: (response: Fetchable<SubscriptionStatusResponse>) => void) => this.props.serverApi.getSubscriptionStatus(
					response => {
						if (response.value) {
							this.onSubscriptionStatusChanged(response.value.status, EventSource.Local);
						}
						callback(response);
					}
				),
				handlePaymentResponse = (response: StripePaymentResponse) => {
					this.onSubscriptionStatusChanged(response.subscriptionStatus, EventSource.Local);
					if (response.type === StripePaymentResponseType.RequiresConfirmation) {
						return confirmCardPayment(response.clientSecret, response.invoiceId);
					}
					return response;
				},
				subscribe = (card: StripeCardElement, price: SubscriptionPrice) => this.props.stripeLoader.value
					.then(
						stripe => stripe.createPaymentMethod({
							type: 'card',
							card
						})
					)
					.then(
						result => {
							if (result.error) {
								throw new Error(result.error.message);
							}
							let request: StripeSubscriptionCreationRequest;
							if (
								isSubscriptionPriceLevel(price)
							) {
								request = {
									paymentMethodId: result.paymentMethod.id,
									priceLevelId: price.id
								};
							} else {
								request = {
									paymentMethodId: result.paymentMethod.id,
									customPriceAmount: price.amount
								};
							}
							return this.props.serverApi
								.createStripeSubscription(request)
								.then(handlePaymentResponse);
						}
					);
			this._dialog.openDialog(
				sharedState => (
					<StripeSubscriptionPrompt
						article={article}
						displayTheme={sharedState.displayTheme}
						onClose={this._dialog.closeDialog}
						onGetSubscriptionPriceLevels={this.props.serverApi.getSubscriptionPriceLevels}
						onGetSubscriptionStatus={getSubscriptionStatus}
						onReadArticle={this._readArticle}
						onShowToast={this._toaster.addToast}
						onSubscribe={subscribe}
						staticServerEndpoint={this.props.staticServerEndpoint}
						stripe={this.props.stripeLoader.value}
						subscriptionStatus={sharedState.subscriptionStatus}
						user={sharedState.user}
					/>
				)
			);
			return;
		}
		const [sourceSlug, articleSlug] = article.slug.split('_');
		if (
			(
				!this.state.user ||
				!this.props.extensionApi.isInstalled
			) &&
			sourceSlug !== 'blogreadupcom'
		) {
			ev?.preventDefault();
			this.setScreenState({
				key: ScreenKey.Read,
				method: 'replace',
				urlParams: { sourceSlug, articleSlug }
			});
		} else if (
			this.props.extensionApi.isInstalled &&
			!localStorage.getItem('extensionReminderAcknowledged')
		) {
			ev?.preventDefault();
			this._dialog.openDialog(
				<ExtensionReminderDialog
					deviceType={this.props.deviceType}
					onSubmit={
						() => {
							localStorage.setItem('extensionReminderAcknowledged', Date.now().toString());
							location.href = article.url;
							return new Promise(
								resolve => { }
							);
						}
					}
				/>
			);
		} else if (!ev) {
			location.href = article.url;
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
						deviceType={this.props.deviceType}
						onBeginOnboarding={this._beginOnboarding}
						onOpenMenu={this._openMenu}
						onOpenSignInPrompt={this._beginOnboardingAtSignIn}
						onViewHome={this._viewHome}
						onViewNotifications={this._viewNotifications}
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
							onViewHome={this._viewHome}
							onViewMyImpact={this._viewMyImpact}
							onViewMyReads={this._viewMyReads}
							onViewPrivacyPolicy={this._viewPrivacyPolicy}
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
						onViewDiscover={this._viewDiscover}
						onViewLeaderboards={this._viewLeaderboards}
						onViewProfile={this._viewProfile}
						onViewSettings={this._viewSettings}
						onViewStats={this._viewStats}
						selectedScreen={this.state.screens[0]}
						userAccount={this.state.user}
					/> :
					null}
				<DialogManager
					dialogs={this.state.dialogs}
					onGetDialogRenderer={this._dialog.getDialogRenderer}
					onTransitionComplete={this._dialog.handleTransitionCompletion}
					sharedState={this.state}
				/>
				{this.state.onboarding ?
					<OnboardingFlow
						analyticsAction={this.state.onboarding.analyticsAction}
						authServiceToken={this.state.onboarding.authServiceToken}
						captcha={this.props.captcha}
						deviceType={this.props.deviceType}
						initialAuthenticationStep={this.state.onboarding.initialAuthenticationStep}
						isExtensionInstalled={this.state.isExtensionInstalled}
						onClose={this._endOnboarding}
						onCopyTextToClipboard={this._clipboard.copyText}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onCreateAccount={this._createAccount}
						onCreateAuthServiceAccount={this._createAuthServiceAccount}
						onRequestPasswordReset={this.props.serverApi.requestPasswordReset}
						onResetPassword={this._resetPassword}
						onShowToast={this._toaster.addToast}
						onShare={this._handleShareRequest}
						onSignIn={this._signIn}
						onSignInWithApple={this._signInWithApple}
						onSignInWithTwitter={this._signInWithTwitter}
						passwordResetEmail={this.state.onboarding.passwordResetEmail}
						passwordResetToken={this.state.onboarding.passwordResetToken}
						user={this.state.user}
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
		// broadcast display preference if signed in
		if (this.props.initialUserProfile?.displayPreference) {
			this.props.browserApi.displayPreferenceChanged(this.props.initialUserProfile.displayPreference);
			this.props.extensionApi.displayPreferenceChanged(this.props.initialUserProfile.displayPreference);
		}
		// broadcast subscription status if signed in
		if (this.props.initialUserProfile?.subscriptionStatus) {
			this.props.browserApi.subscriptionStatusChanged(this.props.initialUserProfile.subscriptionStatus);
		}
		// broadcast extension installation or removal
		const initialRoute = findRouteByLocation(routes, this.props.initialLocation, unroutableQueryStringKeys);
		if (initialRoute.screenKey === ScreenKey.ExtensionRemoval) {
			this.props.browserApi.extensionInstallationChanged({
				type: 'uninstalled'
			});
		} else if (
			extensionInstalledQueryStringKey in parseQueryString(this.props.initialLocation.queryString) &&
			this.props.extensionApi.isInstalled
		) {
			this.props.browserApi.extensionInstallationChanged({
				type: 'installed',
				version: this.props.extensionApi.installedVersion
			});
		}
		// clear extension installation redirect cookie
		Cookies.remove(
			extensionInstallationRedirectPathCookieKey,
			{
				domain: '.' + this.props.webServerEndpoint.host,
				sameSite: 'none',
				secure: this.props.webServerEndpoint.protocol === 'https'
			}
		);
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