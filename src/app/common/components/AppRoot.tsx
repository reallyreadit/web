import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState, Events as RootEvents, SharedState as RootSharedState, NavOptions, NavMethod, NavReference, parseNavReference, ReadArticleReference } from './Root';
import UserAccount, { hasAnyAlerts, areEqual as areUsersEqual } from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './AppRoot/CommentsScreen';
import createContenderScreenFactory from './AppRoot/ContendersScreen';
import createHomeScreenFactory from './AppRoot/HomeScreen';
import createLeaderboardsScreenFactory from './screens/LeaderboardsScreen';
import classNames from 'classnames';
import AppApi from '../AppApi';
import { createQueryString, clientTypeQueryStringKey, unroutableQueryStringKeys } from '../../../common/routing/queryString';
import ClientType from '../ClientType';
import UpdateToast from './UpdateToast';
import routes, { createArticleSlug } from '../../../common/routing/routes';
import { findRouteByLocation } from '../../../common/routing/Route';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { ShareEvent, createRelativeShareSelection } from '../../../common/sharing/ShareEvent';
import SemanticVersion from '../../../common/SemanticVersion';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './AppRoot/ProfileScreen';
import DialogKey from '../../../common/routing/DialogKey';
import AppActivationEvent from '../../../common/models/app/AppActivationEvent';
import RouteLocation from '../../../common/routing/RouteLocation';
import createAotdHistoryScreenFactory from './AppRoot/AotdHistoryScreen';
import AppReferral from '../AppReferral';
import CreateAuthServiceAccountDialog from './CreateAuthServiceAccountDialog';
import OrientationWizard from './AppRoot/OrientationWizard';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import NotificationAuthorizationStatus from '../../../common/models/app/NotificationAuthorizationStatus';
import createSettingsScreenFactory from './SettingsPage';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceCredentialAuthResponse, { isAuthServiceCredentialAuthTokenResponse } from '../../../common/models/auth/AuthServiceCredentialAuthResponse';
import UpdateRequiredDialog from '../../../common/components/UpdateRequiredDialog';
import createAuthorScreenFactory from './screens/AuthorScreen';
import { DeviceType } from '../../../common/DeviceType';
import createNotificationsScreenFactory from './screens/NotificationsScreen';
import createSearchScreenFactory from './screens/SearchScreen';
import EventSource from '../EventSource';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference from '../../../common/models/userAccounts/DisplayPreference';
import { formatIsoDateAsDotNet, formatFetchable } from '../../../common/format';
import { createMyImpactScreenFactory } from './screens/MyImpactScreen';
import AuthorProfile from '../../../common/models/authors/AuthorProfile';
import Fetchable from '../../../common/Fetchable';
import { createScreenFactory as createFaqScreenFactory } from './FaqPage';
import createBlogScreenFactory from './AppRoot/BlogScreen';
import { TweetWebIntentParams, createTweetWebIntentUrl } from '../../../common/sharing/twitter';
import createReadScreenFactory from './AppRoot/ReadScreen';
import { AppPlatform, isAppleAppPlatform } from '../../../common/AppPlatform';
import ShareForm from '../../../common/models/analytics/ShareForm';
import { ShareChannelData } from '../../../common/sharing/ShareData';
import NavBar from './AppRoot/NavBar';
import { FreeTrialPromoTweetIntentRegistrationRequest } from '../../../common/models/subscriptions/FreeTrialPromoTweetIntent';
import createMyFeedScreenFactory from './screens/MyFeedScreen';
import createBestEverScreenFactory from './screens/BestEverScreen';

interface Props extends RootProps {
	appApi: AppApi,
	appReferral: AppReferral
}
export enum AuthStep {
	Authenticating,
	Error
}
export interface AuthStatus {
	provider: AuthServiceProvider,
	step: AuthStep
}
type MenuState = 'opened' | 'closing' | 'closed';
interface State extends RootState {
	authStatus: AuthStatus | null,
	isInOrientation: boolean,
	isPoppingScreen: boolean,
	menuState: MenuState,
}
interface Events extends RootEvents {
	'newStars': number
}
export default class extends Root<Props, State, RootSharedState, Events> {
	private _isUpdateAvailable: boolean = false;
	private _signInLocation: RouteLocation | null;
	private readonly _noop = () => {
		// no-op
	};

	// events
	private readonly _registerNewStarsEventHandler = (handler: (count: number) => void) => {
		return this._eventManager.addListener('newStars', handler);
	};

	// notifications
	private readonly _requestNotificationAuthorization = () => {
		return this.props.appApi.requestNotificationAuthorization();
	};

	// screens
	private readonly _completeOrientation = () => {
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
			EventSource.Local,
			{
				isInOrientation: false
			}
		);
	};
	private readonly _createAuthorScreenTitle = (profile: Fetchable<AuthorProfile>) => formatFetchable(
		profile,
		_ => 'Writer',
		'Loading...',
		'Author not found'
	);
	private readonly _createFaqScreenTitle = () => 'Help';
	private readonly _handleScreenAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'app-root_vc3j5h-screen-slide-out') {
			// copy the screens array minus the top screen
			const screens = this.state.screens.slice(0, this.state.screens.length - 1);
			// pop the top screen
			this.setState({
				isPoppingScreen: false,
				screens
			});
		}
	};
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _viewAotdHistory = () => {
		this.pushScreen(ScreenKey.AotdHistory);
	};
	private readonly _viewAuthor = (slug: string, name?: string) => {
		this.pushScreen(
			ScreenKey.Author,
			{
				slug
			}
		);
	};
	private readonly _viewContenders = () => {
		this.replaceAllScreens(ScreenKey.Contenders);
	};
	private readonly _viewHome = () => {
		this.replaceAllScreens(ScreenKey.Home);
	};
	private readonly _viewNotifications = () => {
		this.replaceAllScreens(ScreenKey.Notifications);
	};
	private readonly _viewMyFeed = () => {
		this.replaceAllScreens(ScreenKey.MyFeed);
	};
	private readonly _viewMyReads = () => {
		this.replaceAllScreens(ScreenKey.MyReads);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.pushScreen(ScreenKey.Settings);
	};

	// sharing
	private readonly _handleShareChannelRequest = (data: ShareChannelData) => {
		switch (data.channel) {
			case ShareChannel.Clipboard:
				this._clipboard.copyText(data.text, 'Link copied to clipboard');
				break;
			case ShareChannel.Email:
				this.props.appApi.openExternalUrlUsingSystem(`mailto:${createQueryString({
					'body': data.body,
					'subject': data.subject
				})}`);
				break;
			case ShareChannel.Twitter:
				this._openTweetComposer(data);
				break;
		}
	};
	private readonly _handleShareRequest = (data: ShareEvent) => {
		if (this.props.appApi.deviceInfo.appPlatform === AppPlatform.Ios) {
			this._handleShareRequestWithCompletion(data);
			return {
				channels: [] as ShareChannel[]
			};
		} else {
			return {
				channels: [
					ShareChannel.Clipboard,
					ShareChannel.Email,
					ShareChannel.Twitter
				],
				completionHandler: (data: ShareForm) => {

				}
			};
		}
	};
	private readonly _handleShareRequestWithCompletion = (data: ShareEvent) => {
		return this.props.appApi.share({
			...data,
			selection: createRelativeShareSelection(data.selection, window)
		});
	};
	private readonly _openTweetComposer = (params: TweetWebIntentParams) => {

		this.props.appApi.openExternalUrlUsingSystem(
			createTweetWebIntentUrl(params)
		);
	};
	private readonly _openTweetComposerWithCompletionHandler = (params: TweetWebIntentParams) => {
		this.props.appApi.openExternalUrlUsingSystem(
			createTweetWebIntentUrl(params)
		);
		return new Promise<void>(
			(resolve, reject) => {
				const resolveWhenActive = () => {
					this.props.appApi.removeListener('didBecomeActive', resolveWhenActive);
						resolve();
				};
				this.props.appApi.addListener('didBecomeActive', resolveWhenActive);
			}
		);
	};
	private readonly _registerFreeTrialPromoTweetIntent = (params: FreeTrialPromoTweetIntentRegistrationRequest) => {
		return this.props.serverApi
			.registerFreeTrialPromoTweetIntent(params)
			.then(
				res => {
					this.onSubscriptionStatusChanged(res.subscriptionStatus, EventSource.Local);
					return res;
				}
			);
	}

	// updates
	private readonly _installUpdate = () => {
		this.props.appApi.installUpdate();
	};

	// user account
	private readonly _handleAuthServiceCredentialAuthResponse = (response: AuthServiceCredentialAuthResponse) => {
		if (
			isAuthServiceCredentialAuthTokenResponse(response)
		) {
			this._dialog.openDialog(
				<CreateAuthServiceAccountDialog
					onCloseDialog={this._dialog.closeDialog}
					onCreateAuthServiceAccount={this._createAuthServiceAccount}
					onLinkExistingAccount={this._openLinkAuthServiceAccountDialog}
					onShowToast={this._toaster.addToast}
					token={response.authServiceToken}
				/>
			);
		} else {
			this.onUserSignedIn(
				{
					displayPreference: response.displayPreference,
					subscriptionStatus: response.subscriptionStatus,
					userAccount: response.user
				},
				SignInEventType.ExistingUser,
				EventSource.Local
			);
		}
		this.setState({
			authStatus: null
		});
	};
	protected readonly _linkAuthServiceAccount = (provider: AuthServiceProvider) => {
		return this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (
						isAppleAppPlatform(deviceInfo.appPlatform) &&
						deviceInfo.appVersion.compareTo(new SemanticVersion('5.7.1')) < 0
					) {
						this.openAppUpdateRequiredDialog('5.7');
						throw new Error('Unsupported');
					}
				}
			)
			.then(this.props.serverApi.requestTwitterWebViewRequestToken)
			.then(
				token => {
					const url = new URL('https://api.twitter.com/oauth/authorize');
					url.searchParams.set('oauth_token', token.value);
					return this.props.appApi.requestWebAuthentication({
						authUrl: url.href,
						callbackScheme: 'readup'
					});
				}
			)
			.then(
				webAuthResponse => {
					if (!webAuthResponse.callbackURL) {
						if (webAuthResponse.error === 'Unsupported') {
							this.openIosUpdateRequiredDialog(
								'13',
								'You can link your Twitter account on the Readup website instead.'
							);
						}
						throw new Error(webAuthResponse.error ?? 'Unknown');
					}
					const url = new URL(webAuthResponse.callbackURL);
					if (url.searchParams.has('denied')) {
						throw new Error('Cancelled');
					}
					return this.props.serverApi.linkTwitterAccount({
						oauthToken: url.searchParams.get('oauth_token'),
						oauthVerifier: url.searchParams.get('oauth_verifier')
					});
				}
			)
			.then(
				association => {
					if (!this.state.user.hasLinkedTwitterAccount) {
						this.onUserUpdated(
							{
								...this.state.user,
								hasLinkedTwitterAccount: true
							},
							EventSource.Local
						);
					}
					return association;
				}
			);
	};
	protected readonly _resetPassword = (token: string, password: string) => {
		return this.props.serverApi
			.resetPassword({
				token,
				password,
				pushDevice: this.getPushDeviceForm()
			})
			.then(
				profile => {
					return this.onUserSignedIn(profile, SignInEventType.ExistingUser, EventSource.Local);
				}
			);
	};
	private readonly _signInWithApple = () => {
		this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (
						!isAppleAppPlatform(deviceInfo.appPlatform) ||
						deviceInfo.appVersion.compareTo(new SemanticVersion('5.4.1')) >= 0
					) {
						this.props.appApi.requestAppleIdCredential();
					} else {
						this.openAppUpdateRequiredDialog('5.4');
					}
				}
			);
	};
	private readonly _signInWithTwitter = () => {
		return new Promise(
			resolve => {
				this.props.appApi
					.getDeviceInfo()
					.then(
						deviceInfo => {
							if (
								isAppleAppPlatform(deviceInfo.appPlatform) &&
								deviceInfo.appVersion.compareTo(new SemanticVersion('5.7.1')) < 0
							) {
								this.openAppUpdateRequiredDialog('5.7');
								throw 'Unsupported';
							}
						}
					)
					.then(this.props.serverApi.requestTwitterWebViewRequestToken)
					.then(
						token => {
							this.setState(
								{
									authStatus: {
										provider: AuthServiceProvider.Twitter,
										step: AuthStep.Authenticating
									}
								},
								resolve
							);
							const url = new URL('https://api.twitter.com/oauth/authorize');
							url.searchParams.set('oauth_token', token.value);
							return this.props.appApi.requestWebAuthentication({
								authUrl: url.href,
								callbackScheme: 'readup'
							});
						}
					)
					.then(
						webAuthResponse => {
							if (!webAuthResponse.callbackURL) {
								if (webAuthResponse.error === 'Unsupported') {
									this.openIosUpdateRequiredDialog('13');
								}
								throw (webAuthResponse.error ?? 'Unknown');
							}
							const url = new URL(webAuthResponse.callbackURL);
							if (url.searchParams.has('denied')) {
								throw 'Cancelled';
							}
							return this.props.serverApi
								.authenticateTwitterCredential({
									oauthToken: url.searchParams.get('oauth_token'),
									oauthVerifier: url.searchParams.get('oauth_verifier'),
									analytics: this.getSignUpAnalyticsForm(null),
									pushDevice: this.getPushDeviceForm()
								})
								.then(this._handleAuthServiceCredentialAuthResponse);
						}
					)
					.catch(
						error => {
							let authStatus: AuthStatus | null;
							if (error !== 'Unsupported' && error !== 'Cancelled') {
								authStatus = {
									provider: AuthServiceProvider.Twitter,
									step: AuthStep.Error
								};
							}
							this.setState(
								{
									authStatus
								},
								resolve
							);
						}
					);
			}
		);
	};

	// window
	private readonly _handleVisibilityChange = () => {
		if (!this._isUpdateAvailable && !window.document.hidden) {
			this.fetchUpdateStatus().then(status => {
				if (status.isAvailable) {
					this._isUpdateAvailable = true;
					this._toaster.addToast(
						<UpdateToast
							onUpdate={this._reloadWindow}
							updateAction='reload'
						/>,
						Intent.Success,
						false
					);
				}
			});
		}
	};

	constructor(props: Props) {
		super('app-root_vc3j5h', false, props);

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.AotdHistory]: createAotdHistoryScreenFactory(
				ScreenKey.AotdHistory,
				{
					deviceType: DeviceType.Ios,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetAotdHistory: this.props.serverApi.getAotdHistory,
					onGetCommunityReads: this.props.serverApi.getCommunityReads,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Author]: createAuthorScreenFactory(
				ScreenKey.Author,
				{
					deviceType: DeviceType.Ios,
					onBeginOnboarding: this._noop,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onCreateTitle: this._createAuthorScreenTitle,
					onNavTo: this._navTo,
					onOpenNewPlatformNotificationRequestDialog: this._noop,
					onGetAuthorArticles: this.props.serverApi.getAuthorArticles,
					onGetAuthorProfile: this.props.serverApi.getAuthorProfile,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onSetScreenState: this._setScreenState,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.BestEver]: createBestEverScreenFactory(
				ScreenKey.BestEver,
				{
					deviceType: DeviceType.Ios,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetCommunityReads: this.props.serverApi.getCommunityReads,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Blog]: createBlogScreenFactory(
				ScreenKey.Blog,
				{
					deviceType: DeviceType.Ios,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
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
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Contenders]: createContenderScreenFactory(ScreenKey.Contenders, {
				deviceType: DeviceType.Ios,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onNavTo: this._navTo,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewAotdHistory: this._viewAotdHistory,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Faq]: createFaqScreenFactory(ScreenKey.Faq, {
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onCreateTitle: this._createFaqScreenTitle,
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				deviceType: DeviceType.Ios,
				onClearAlerts: this._clearAlerts,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetAotdHistory: this.props.serverApi.getAotdHistory,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onNavTo: this._navTo,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Notifications]: createNotificationsScreenFactory(
				ScreenKey.Notifications,
				{
					deviceType: DeviceType.Ios,
					onClearAlerts: this._clearAlerts,
					onCloseDialog: this._dialog.closeDialog,
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
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(
				ScreenKey.Leaderboards,
				{
					deviceType: DeviceType.Ios,
					onBeginOnboarding: this._noop,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCloseDialog: this._dialog.closeDialog,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetAuthorsEarningsReport: this.props.serverApi.getAuthorsEarningsReport,
					onOpenNewPlatformNotificationRequestDialog: this._noop,
					onGetReaderLeaderboards: this.props.serverApi.getLeaderboards,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onSetScreenState: this._setScreenState,
					onViewAuthor: this._viewAuthor,
					onViewProfile: this._viewProfile
				}
			),
			[ScreenKey.MyFeed]: createMyFeedScreenFactory(
				ScreenKey.MyFeed,
				{
					deviceType: DeviceType.Ios,
					onClearAlerts: this._clearAlerts,
					onCloseDialog: this._dialog.closeDialog,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onFollowUser: this._followUser,
					onGetFollowees: this.props.serverApi.getFollowees,
					onGetFollowers: this.props.serverApi.getFollowers,
					onGetProfile: this.props.serverApi.getProfile,
					onGetNotificationPosts: this.props.serverApi.getNotificationPosts,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onRegisterFolloweeCountChangedHandler: this._registerFolloweeCountChangedEventHandler,
					onSetScreenState: this._setScreenState,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onUnfollowUser: this._unfollowUser,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.MyImpact]: createMyImpactScreenFactory(
				ScreenKey.MyImpact,
				{
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetSubscriptionDistributionSummary: this._getSubscriptionDistributionSummary,
					onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
					onNavTo: this._navTo,
					onOpenTweetComposerWithCompletionHandler: this._openTweetComposerWithCompletionHandler,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onRegisterFreeTrialPromoTweetIntent: this._registerFreeTrialPromoTweetIntent,
					onShowToast: this._toaster.addToast,
					onViewAuthor: this._viewAuthor
				}
			),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				appPlatform: this.props.appApi.deviceInfo.appPlatform,
				deviceType: DeviceType.Ios,
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticleStarredHandler: this._registerArticleStarredEventHandler,
				onRegisterNewStarsHandler: this._registerNewStarsEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onFollowUser: this._followUser,
				onGetAuthorArticles: this.props.serverApi.getAuthorArticles,
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
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread
			}),
			[ScreenKey.Read]: createReadScreenFactory(ScreenKey.Read, {
				deviceType: DeviceType.Ios,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetArticle: this.props.serverApi.getArticle,
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState
			}),
			[ScreenKey.Search]: createSearchScreenFactory(
				ScreenKey.Search,
				{
					deviceType: DeviceType.Ios,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onGetSearchOptions: this.props.serverApi.getArticleSearchOptions,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onSearchArticles: this.props.serverApi.searchArticles,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread
				}
			),
			[ScreenKey.Settings]: createSettingsScreenFactory(
				ScreenKey.Settings,
				{
					onCloseDialog: this._dialog.closeDialog,
					onChangeDisplayPreference: this._changeDisplayPreference,
					onChangeEmailAddress: this._changeEmailAddress,
					onChangeNotificationPreference: this._changeNotificationPreference,
					onChangePassword: this._changePassword,
					onChangeTimeZone: this._changeTimeZone,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onDeleteAccount: this._deleteAccount,
					onGetSettings: this._getSettings,
					onGetTimeZones: this.props.serverApi.getTimeZones,
					onLinkAuthServiceAccount: this._linkAuthServiceAccount,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onOpenTweetComposer: this._openTweetComposer,
					onRegisterNotificationPreferenceChangedEventHandler: this._registerNotificationPreferenceChangedEventHandler,
					onResendConfirmationEmail: this._resendConfirmationEmail,
					onSendPasswordCreationEmail: this._sendPasswordCreationEmail,
					onShowToast: this._toaster.addToast,
					onSignOut: this._signOut,
					onSubmitAuthorEmailVerificationRequest: this._submitAuthorEmailVerificationRequest,
					onViewPrivacyPolicy: this._viewPrivacyPolicy
				}
			)
		};

		// state
		const { screens, dialog } = this.processNavigationRequest(props.initialUserProfile?.userAccount, props.initialLocation);
		this.state = {
			...this.state,
			dialogs: (
				dialog ?
					[this._dialog.createDialog(dialog)] :
					[]
			),
			authStatus: null,
			isInOrientation: (
				props.initialUserProfile ?
					!props.initialUserProfile.userAccount.dateOrientationCompleted :
					false
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
							this.onUserUpdated(updatedUser, EventSource.Remote);
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
			.addListener('articleStarred', event => {
				// migrate deprecated article property if required due to an outdated app
				if (!event.article.datesPosted) {
					event.article.datesPosted = [];
					if ((event.article as any).datePosted) {
						event.article.datesPosted.push((event.article as any).datePosted);
					}
				}
				this._eventManager.triggerEvent('articleStarred', event);
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
			.addListener(
				'authenticateAppleIdCredential',
				credential => {
					this.setState({
						authStatus: {
							provider: AuthServiceProvider.Apple,
							step: AuthStep.Authenticating
						}
					});
					this.props.serverApi
						.authenticateAppleIdCredential({
							...credential,
							analytics: this.getSignUpAnalyticsForm(null),
							pushDevice: this.getPushDeviceForm()
						})
						.then(this._handleAuthServiceCredentialAuthResponse)
						.catch(
							() => {
								this.setState({
									authStatus: {
										provider: AuthServiceProvider.Apple,
										step: AuthStep.Error
									}
								});
							}
						);
				}
			)
			.addListener(
				'authServiceAccountLinked',
				association => {
					if (
						association.provider === AuthServiceProvider.Twitter &&
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
							(event.badgeCount || hasAnyAlerts(this.state.user)) &&
							now - lastUserCheck > 60 * 1000
						) {
							props.serverApi.getUserAccount(
								result => {
									if (result.value) {
										if (!areUsersEqual(result.value, this.state.user)) {
											this.onUserUpdated(result.value, EventSource.Local);
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
				'displayPreferenceChanged',
				preference => {
					this.onDisplayPreferenceChanged(preference, EventSource.Remote);
				}
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
			)
			.addListener(
				'updateAvailable',
				() => {
					if (this._isUpdateAvailable) {
						// Override existing web app update toast. The handle for permenant toasts is 0 (TODO: There should be a cleaner way to handle this).
						this._toaster.removeToast(0);
					}
					this._isUpdateAvailable = true;
					this._toaster.addToast(
						<UpdateToast
							onUpdate={this._installUpdate}
							updateAction={
								this.props.appApi.deviceInfo.appPlatform === AppPlatform.Linux ?
									'download' :
									'reload'
							}
						/>,
						Intent.Success,
						false
					);
				}
			);
	}
	private enterReaderView(article: Pick<ReadArticleReference, 'slug'>) {
		// Send the signal to the native app.
		this.props.appApi.readArticle(article);
	}
	private openAppUpdateRequiredDialog(versionRequired: string) {
		this._dialog.openDialog(
			(
				<UpdateRequiredDialog
					onClose={this._dialog.closeDialog}
					updateType="app"
					versionRequired={versionRequired}
				/>
			),
			'push'
		);
	}
	private openIosUpdateRequiredDialog(versionRequired: string, message: string = null) {
		this._dialog.openDialog(
			(
				<UpdateRequiredDialog
					message={message}
					onClose={this._dialog.closeDialog}
					updateType="ios"
					versionRequired={versionRequired}
				/>
			),
			'push'
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
	private pushScreen(key: ScreenKey, urlParams?: { [key: string]: string }) {
		// create the new screen
		const screen = this.createScreen(key, urlParams);
		// push the screen
		this.setScreenState([
			...this.state.screens,
			screen
		]);
	}
	private replaceAllScreens(key: ScreenKey, urlParams?: { [key: string]: string }) {
		// create the new screen
		const screen = this.createScreen(key, urlParams);
		// replace all the screens
		this.setScreenState([screen]);
	}
	private replaceScreen(screenId: number, key: ScreenKey, urlParams?: { [key: string]: string }) {
		// verify that the replacement target exists
		const screenIndex = this.state.screens.findIndex(
			screen => screen.id === screenId
		);
		if (screenIndex === -1) {
			return;
		}
		// create the new screen
		const screen = this.createScreen(
			key,
			urlParams,
			{
				isReplacement: true
			}
		);
		// replace the target screen
		const screens = this.state.screens.slice();
		screens.splice(screenIndex, 1, screen);
		this.setScreenState(screens);
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
		return {
			displayTheme: this.state.displayTheme,
			revenueReport: this.state.revenueReport,
			subscriptionStatus: this.state.subscriptionStatus,
			user: this.state.user
		};
	}
	protected getSignUpAnalyticsForm(action: string) {
		return {
			action: this.props.appReferral.action,
			currentPath: this.props.initialLocation.path,
			initialPath: this.props.appReferral.initialPath,
			referrerUrl: this.props.appReferral.referrerUrl
		};
	}
	protected navTo(ref: NavReference, options: NavOptions = { method: NavMethod.Push }) {
		const result = parseNavReference(ref);
		if (result.isInternal && result.screenKey != null) {
			if (result.screenKey === ScreenKey.Read) {
				this.enterReaderView({
					slug: createArticleSlug(result.screenParams)
				});
			} else {
				switch (options.method) {
					case NavMethod.Push:
						this.pushScreen(result.screenKey, result.screenParams);
						break;
					case NavMethod.Replace:
						this.replaceScreen(options.screenId, result.screenKey, result.screenParams);
						break;
					case NavMethod.ReplaceAll:
						this.replaceAllScreens(result.screenKey, result.screenParams);
						break;
				}
			}
			return true;
		} else if (!result.isInternal && result.url) {
			if (
				/^https?:/.test(result.url)
			) {
				this.props.appApi.openExternalUrl(result.url);
			} else {
				this.props.appApi.openExternalUrlUsingSystem(result.url)
			}
			return true;
		}
		return false;
	}
	protected onDisplayPreferenceChanged(preference: DisplayPreference, eventSource: EventSource) {
		if (eventSource === EventSource.Local) {
			this.props.appApi.displayPreferenceChanged(preference);
		}
		super.onDisplayPreferenceChanged(preference, eventSource);
	}
	protected onUserSignedIn(profile: WebAppUserProfile, eventType: SignInEventType, eventSource: EventSource) {
		// sync auth state with app
		if (
			!isAppleAppPlatform(this.props.appApi.deviceInfo.appPlatform) ||
			this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.2')) >= 0
		) {
			this.props.appApi
				.signIn(profile.userAccount, eventType)
				.then(
					response => {
						if (
							eventType === SignInEventType.ExistingUser &&
							response.notificationAuthorizationStatus === NotificationAuthorizationStatus.NotDetermined
						) {
							this.props.appApi.requestNotificationAuthorization();
						}
					}
				);
		} else {
			this.props.appApi.syncAuthCookie(profile.userAccount);
		}
		// sync display preference with app
		if (profile.displayPreference) {
			this.props.appApi.displayPreferenceChanged(profile.displayPreference);
		}
		// set screen
		let screen: Screen;
		if (!this._signInLocation) {
			screen = this.createScreen(ScreenKey.Home);
		} else {
			const route = findRouteByLocation(routes, this._signInLocation, unroutableQueryStringKeys);
			// We need to use the stateless canRead function here because the new user state isn't
			// set until this function returns.
			if (route.screenKey === ScreenKey.Read) {
				const
					articlePathParams = route.getPathParams(this._signInLocation.path),
					articleRef = {
						slug: createArticleSlug(articlePathParams)
					};
				screen = this.createScreen(ScreenKey.Comments, articlePathParams);
				this.props.appApi.readArticle(articleRef);
			} else {
				screen = this
					.getLocationDependentState(this._signInLocation)
					.screen;
			}
			this._signInLocation = null;
		}
		// enter orientation for new users
		let isInOrientation: boolean;
		if (eventType === SignInEventType.NewUser) {
			if (
				!isAppleAppPlatform(this.props.appApi.deviceInfo.appPlatform) ||
				this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.5.1')) >= 0
			) {
				isInOrientation = true;
			} else {
				isInOrientation = false;
				this.props.appApi.requestNotificationAuthorization();
			}
		} else {
			isInOrientation = !profile.userAccount.dateOrientationCompleted;
		}
		return super.onUserSignedIn(
			profile,
			eventType,
			eventSource,
			{
				isInOrientation,
				screens: [screen]
			}
		);
	}
	protected onUserSignedOut() {
		// sync auth state with app
		if (
			!isAppleAppPlatform(this.props.appApi.deviceInfo.appPlatform) ||
			this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.1')) >= 0
		) {
			this.props.appApi.signOut();
		} else {
			this.props.appApi.syncAuthCookie();
		}
		return super.onUserSignedOut(
			{
				menuState: 'closed',
				screens: []
			}
		);
	}

	protected readArticle(article: ReadArticleReference, ev?: React.MouseEvent<Element>) {
		ev?.preventDefault();
		this.enterReaderView(article);
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
						<NavBar
							onNavTo={this._navTo}
							onViewContenders={this._viewContenders}
							onViewHome={this._viewHome}
							onViewMyFeed={this._viewMyFeed}
							onViewMyReads={this._viewMyReads}
							selectedScreen={this.state.screens[0]}
							user={this.state.user}
						/>
						<div className="content">
							<Header
								content={headerContent}
								isTransitioningBack={this.state.isPoppingScreen}
								onBack={this._popScreen}
								onViewNotifications={this._viewNotifications}
								onViewProfile={this._viewProfile}
								onViewSettings={this._viewSettings}
								// this is only the selected "root" screen when ReplaceAll is used
								selectedRootScreen={this.state.screens[0]}
								currentScreen={this.state.screens[this.state.screens.length - 1]}
								titles={this.state.screens.map(screen => screen.titleContent || screen.title)}
								user={this.state.user}
							/>
							<ol className="screens">
								{this.state.screens.map((screen, index, screens) => (
									<li
										className={classNames('screen', {
											'slide-in': !screen.isReplacement,
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
							onViewContenders={this._viewContenders}
							onViewHome={this._viewHome}
							onViewMyFeed={this._viewMyFeed}
							onViewMyReads={this._viewMyReads}
							selectedScreen={this.state.screens[0]}
							user={this.state.user}
						/>
						{this.state.isInOrientation ?
							<OrientationWizard
								appPlatform={this.props.appApi.deviceInfo.appPlatform}
								onComplete={this._completeOrientation}
								onCreateStaticContentUrl={this._createStaticContentUrl}
								onRequestNotificationAuthorization={this._requestNotificationAuthorization}
							/> :
							null}
					</> :
					<AuthScreen
						authStatus={this.state.authStatus}
						captcha={this.props.captcha}
						onCloseDialog={this._dialog.closeDialog}
						onCreateAccount={this._createAccount}
						onOpenDialog={this._dialog.openDialog}
						onOpenRequestPasswordResetDialog={this._openRequestPasswordResetDialog}
						onShowToast={this._toaster.addToast}
						onSignIn={this._signIn}
						onSignInWithApple={this._signInWithApple}
						onSignInWithTwitter={this._signInWithTwitter}
					/>}
				<DialogManager
					dialogs={this.state.dialogs}
					onGetDialogRenderer={this._dialog.getDialogRenderer}
					onTransitionComplete={this._dialog.handleTransitionCompletion}
					sharedState={this.state}
				/>
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
			</>
		);
	}
	public componentDidMount() {
		// sync auth state with app
		this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (
						!isAppleAppPlatform(deviceInfo.appPlatform) ||
						deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.1')) >= 0
					) {
						this.props.appApi.initialize(this.props.initialUserProfile?.userAccount);
					} else {
						this.props.appApi.syncAuthCookie(this.props.initialUserProfile?.userAccount);
					}
				}
			);
		// sync display preference with app
		if (this.props.initialUserProfile?.displayPreference) {
			this.props.appApi.displayPreferenceChanged(this.props.initialUserProfile.displayPreference);
		}
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
		// iOS keyboard scroll bug
		window.setTimeout(() => {
			if (window.scrollY !== 0) {
				window.scrollTo(0, 0);
			}
		}, 100);
		// check for read url (the following condition can only be true in old iOS clients)
		if (
			initialRoute.screenKey === ScreenKey.Read &&
			this.props.initialUserProfile
		) {
			this.enterReaderView({
				slug: createArticleSlug(
					initialRoute.getPathParams(this.props.initialLocation.path)
				)
			});
		}
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
	}
}