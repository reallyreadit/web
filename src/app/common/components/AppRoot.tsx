import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster, { Intent } from '../../../common/components/Toaster';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props as RootProps, State as RootState, Events as RootEvents, SharedState as RootSharedState } from './Root';
import UserAccount, { hasAnyAlerts, areEqual as areUsersEqual } from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import UserArticle from '../../../common/models/UserArticle';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './AppRoot/CommentsScreen';
import createHomeScreenFactory from './AppRoot/HomeScreen';
import createLeaderboardsScreenFactory from './screens/LeaderboardsScreen';
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
import createDiscoverScreenFactory from './screens/DiscoverScreen';
import EventSource from '../EventSource';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference from '../../../common/models/userAccounts/DisplayPreference';
import { formatIsoDateAsDotNet, getPromiseErrorMessage, formatProblemDetails } from '../../../common/format';
import AppStoreSubscriptionPrompt from './AppRoot/AppStoreSubscriptionPrompt';
import { AppleSubscriptionValidationResponseType, AppleSubscriptionValidationRequest, AppleSubscriptionValidationResponse } from '../../../common/models/subscriptions/AppleSubscriptionValidation';
import { SubscriptionProductsRequest } from '../../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest } from '../../../common/models/app/SubscriptionPurchase';
import { Result, ResultType } from '../../../common/Result';
import { SubscriptionStatusType, ActiveSubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import { createMyImpactScreenFactory } from './screens/MyImpactScreen';
import SubscriptionProvider from '../../../common/models/subscriptions/SubscriptionProvider';
import { ProblemDetails } from '../../../common/ProblemDetails';
import { AppStoreErrorType } from '../../../common/Errors';

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
	isProcessingPayment: boolean,
	menuState: MenuState,
}
type SharedState = RootSharedState & Pick<State, 'isProcessingPayment'>;
interface Events extends RootEvents {
	'newStars': number,
	'purchaseCompleted': Result<AppleSubscriptionValidationResponse, ProblemDetails>
}
export default class extends Root<Props, State, SharedState, Events> {
	private _isUpdateAvailable: boolean = false;
	private _signInLocation: RouteLocation | null;
	private readonly _noop = () => {
		// no-op
	};

	// events
	private readonly _registerNewStarsEventHandler = (handler: (count: number) => void) => {
		return this._eventManager.addListener('newStars', handler);
	};
	private readonly _registerPurchaseCompletedEventHandler = (handler: (result: Result<AppleSubscriptionValidationResponse, ProblemDetails>) => void) => {
		return this._eventManager.addListener('purchaseCompleted', handler);
	}

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

	// notifications
	private readonly _requestNotificationAuthorization = () => {
		return this.props.appApi.requestNotificationAuthorization();
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
	private readonly _createAuthorScreenTitle = () => 'Writer';
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
	private readonly _viewAdminPage = () => {
		this.replaceScreen(ScreenKey.Admin);
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
	private readonly _viewDiscover = () => {
		this.replaceScreen(ScreenKey.Discover);
	};
	private readonly _viewHome = () => {
		this.replaceScreen(ScreenKey.Home);
	};
	private readonly _viewNotifications = () => {
		this.replaceScreen(ScreenKey.Notifications);
	};
	private readonly _viewLeaderboards = () => {
		this.replaceScreen(ScreenKey.Leaderboards);
	};
	private readonly _viewMyImpact = () => {
		this.replaceScreen(ScreenKey.MyImpact);
	};
	private readonly _viewMyReads = () => {
		this.replaceScreen(ScreenKey.MyReads);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.pushScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.replaceScreen(ScreenKey.Settings);
	};
	private readonly _viewStats = () => {
		this.replaceScreen(ScreenKey.Stats);
	};

	// sharing
	private readonly _handleShareRequest = (data: ShareData) => {
		this.props.appApi.share(data);
		return {
			channels: [] as ShareChannel[]
		};
	};
	private readonly _handleShareRequestWithCompletion = (data: ShareData) => {
		return this.props.appApi.share(data);
	};

	// subscriptions
	private readonly _openAppStoreSubscriptionPromptDialog = (article?: UserArticle, activeSubscription?: ActiveSubscriptionStatus) => {
		this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (deviceInfo.appVersion.compareTo(new SemanticVersion('7.0.0')) >= 0) {
						this._dialog.openDialog(
							sharedState => (
								<AppStoreSubscriptionPrompt
									activeSubscription={activeSubscription}
									article={article}
									isPaymentProcessing={sharedState.isProcessingPayment}
									onClose={this._dialog.closeDialog}
									onGetSubscriptionPriceLevels={this.props.serverApi.getSubscriptionPriceLevels}
									onGetSubscriptionStatus={this._getSubscriptionStatus}
									onReadArticle={this._readArticle}
									onRegisterPurchaseCompletedEventHandler={this._registerPurchaseCompletedEventHandler}
									onRequestSubscriptionProducts={this._requestSubscriptionProducts}
									onRequestSubscriptionPurchase={this._requestSubscriptionPurchase}
									onRequestSubscriptionReceipt={this._requestSubscriptionReceipt}
									onValidateSubscription={this._validateSubscription}
								/>
							)
						);
					} else {
						this.openAppUpdateRequiredDialog('7.0');
					}
				}
			);
	};
	private readonly _openPriceChangeDialog = () => {
		if (this.state.subscriptionStatus.type !== SubscriptionStatusType.Active) {
			throw new Error('Invalid subscription state.');
		}
		if (this.state.subscriptionStatus.provider === SubscriptionProvider.Stripe) {
			this._openStripePriceChangeDialog(this.state.subscriptionStatus);
			return;
		}
		this._openAppStoreSubscriptionPromptDialog(null, this.state.subscriptionStatus);
	};
	private readonly _openSubscriptionAutoRenewDialog = () => {
		if (this.state.subscriptionStatus.type !== SubscriptionStatusType.Active) {
			return Promise.reject(
				new Error('Invalid subscription state.')
			);
		}
		if (this.state.subscriptionStatus.provider === SubscriptionProvider.Stripe) {
			return this._openStripeAutoRenewDialog(this.state.subscriptionStatus);
		}
		this.props.appApi.openExternalUrlUsingSystem('https://apps.apple.com/account/subscriptions');
		return new Promise<void>(
			(resolve, reject) => {
				const refreshSubscriptionStatus = () => {
					this.props.appApi.removeListener('didBecomeActive', refreshSubscriptionStatus);
					this.props.serverApi
						.requestAppleSubscriptionStatusUpdate()
						.then(
							response => {
								this.onSubscriptionStatusChanged(response.status, EventSource.Local);
								resolve();
							}
						)
						.catch(reject);
				};
				this.props.appApi.addListener('didBecomeActive', refreshSubscriptionStatus);
			}
		);
	};
	private readonly _openSubscriptionPromptDialog = (article?: UserArticle, provider?: SubscriptionProvider) => {
		if (provider === SubscriptionProvider.Stripe) {
			this._openStripeSubscriptionPromptDialog(article);
			return;
		}
		this._openAppStoreSubscriptionPromptDialog(article);
	};
	private readonly _requestSubscriptionProducts = (request: SubscriptionProductsRequest) => this.props.appApi.requestSubscriptionProducts(request);
	private readonly _requestSubscriptionPurchase = (request: SubscriptionPurchaseRequest) => {
		this.setState(
			prevState => {
				if (prevState.isProcessingPayment) {
					return null;
				}
				this.props.appApi
					.requestSubscriptionPurchase(request)
					.then(
						result => {
							// only process failures here. if the transaction was successfully added to the
							// payment queue then we will remain in a processing state until we receive a
							// payment completion event
							if (result.type === ResultType.Failure) {
								this._toaster.addToast(
									formatProblemDetails(result.error),
									Intent.Danger
								);
								this.setState({
									isProcessingPayment: false
								});
							}
						}
					)
					.catch(
						reason => {
							this._toaster.addToast(`Purchase failed: ${getPromiseErrorMessage(reason)}`, Intent.Danger);
							this.setState({
								isProcessingPayment: false
							});
						}
					);
				return {
					isProcessingPayment: true
				};
			}
		);
	};
	private readonly _requestSubscriptionReceipt = () => this.props.appApi.requestSubscriptionReceipt();
	private readonly _validateSubscription = (request: AppleSubscriptionValidationRequest) => this.props.serverApi
		.validateAppleSubscription(request)
		.then(
			response => {
				if (response.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser) {
					this.onSubscriptionStatusChanged(response.subscriptionStatus, EventSource.Local);
				}
				return response;
			}
		);

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
					if (deviceInfo.appVersion.compareTo(new SemanticVersion('5.7.1')) < 0) {
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
	private readonly _signInWithApple = () => {
		this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (deviceInfo.appVersion.compareTo(new SemanticVersion('5.4.1')) >= 0) {
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
							if (deviceInfo.appVersion.compareTo(new SemanticVersion('5.7.1')) < 0) {
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
						<UpdateToast onReloadWindow={this._reloadWindow} />,
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
					deviceType: DeviceType.Ios,
					onBeginOnboarding: this._noop,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onCreateTitle: _ => this._createAuthorScreenTitle(),
					onOpenNewPlatformNotificationRequestDialog: this._noop,
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
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
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
				onClearAlerts: this._clearAlerts,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
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
					deviceType: DeviceType.Ios,
					onBeginOnboarding: this._noop,
					onCopyAppReferrerTextToClipboard: this._noop,
					onCloseDialog: this._dialog.closeDialog,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onOpenNewPlatformNotificationRequestDialog: this._noop,
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
					onOpenPaymentConfirmationDialog: this._openStripePaymentConfirmationDialog,
					onOpenSubscriptionPromptDialog: this._openSubscriptionPromptDialog,
					onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
					onViewAuthor: this._viewAuthor
				}
			),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onOpenDialog: this._dialog.openDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterNewStarsHandler: this._registerNewStarsEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCopyTextToClipboard: this._clipboard.copyText,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
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
			[ScreenKey.Settings]: createSettingsScreenFactory(
				ScreenKey.Settings,
				{
					deviceType: DeviceType.Ios,
					onCloseDialog: this._dialog.closeDialog,
					onChangeDisplayPreference: this._changeDisplayPreference,
					onChangeEmailAddress: this._changeEmailAddress,
					onChangeNotificationPreference: this._changeNotificationPreference,
					onChangePassword: this._changePassword,
					onChangePaymentMethod: this._changeSubscriptionPaymentMethod,
					onChangeTimeZone: this._changeTimeZone,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetSettings: this._getSettings,
					onGetTimeZones: this.props.serverApi.getTimeZones,
					onLinkAuthServiceAccount: this._linkAuthServiceAccount,
					onOpenDialog: this._dialog.openDialog,
					onOpenSubscriptionAutoRenewDialog: this._openSubscriptionAutoRenewDialog,
					onOpenPaymentConfirmationDialog: this._openStripePaymentConfirmationDialog,
					onOpenPriceChangeDialog: this._openPriceChangeDialog,
					onOpenSubscriptionPromptDialog: this._openSubscriptionPromptDialog,
					onRegisterNotificationPreferenceChangedEventHandler: this._registerNotificationPreferenceChangedEventHandler,
					onResendConfirmationEmail: this._resendConfirmationEmail,
					onSendPasswordCreationEmail: this._sendPasswordCreationEmail,
					onShowToast: this._toaster.addToast,
					onUpdatePaymentMethod: this._updateSubscriptionPaymentMethod,
					stripe: this.props.stripeLoader.value
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
			isProcessingPayment: false,
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
				'openSubscriptionPrompt',
				() => {
					this._openAppStoreSubscriptionPromptDialog();
				}
			)
			.addListener(
				'subscriptionPurchaseCompleted',
				result => {
					// this event can fire at any time. for example a purchased or failed
					// transaction could have failed to register with the api server. in such
					// a case the registration will be retried until completed, potentially on
					// subsequent app launches. therefore only show a toast if we're currently
					// processing a payment.
					switch (result.type) {
						case ResultType.Success:
							if (result.value.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser) {
								this.onSubscriptionStatusChanged(result.value.subscriptionStatus, EventSource.Local);
							}
							if (this.state.isProcessingPayment) {
								this.setState({
									isProcessingPayment: false
								});
								let toast: {
									content: string,
									intent: Intent
								};
								switch (result.value.type) {
									case AppleSubscriptionValidationResponseType.AssociatedWithAnotherUser:
										// this toast probably shouldn't disappear on its own but it's also very unlikely
										// that a user will ever see this. subscriptions associated with another account
										// should be caught during the status check when the SubscriptionPrompt opens.
										toast = {
											content: `Purchase failed: Subscription associated with another account: ${result.value.subscribedUsername}.`,
											intent: Intent.Neutral
										};
										break;
									case AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser:
										// this or a failure is what we should see 99% of the time.
										toast = {
											content: 'Purchase completed.',
											intent: Intent.Success
										};
										break;
									case AppleSubscriptionValidationResponseType.EmptyReceipt:
										// this should never happen
										toast = {
											content: 'Purchase failed: Subscription status inactive.',
											intent: Intent.Danger
										};
										break;
								}
								this._toaster.addToast(toast.content, toast.intent);
							}
							break;
						case ResultType.Failure:
							if (this.state.isProcessingPayment) {
								this._toaster.addToast(
									formatProblemDetails(result.error),
									result.error.type === AppStoreErrorType.PurchaseCancelled ?
										Intent.Neutral :
										Intent.Danger
								);
								this.setState({
									isProcessingPayment: false
								});
							}
							break;
					}
					this._eventManager.triggerEvent('purchaseCompleted', result);
				}
			);
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
	private pushScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		// create the new screen
		const screen = this.createScreen(key, urlParams, title);
		// push the screen
		this.setScreenState([
			...this.state.screens,
			screen
		]);
	}
	private replaceScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		// create the new screen
		const screen = this.createScreen(key, urlParams, title);
		// replace the screen
		this.setScreenState([screen]);
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
			isProcessingPayment: this.state.isProcessingPayment,
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
	protected onDisplayPreferenceChanged(preference: DisplayPreference, eventSource: EventSource) {
		if (eventSource === EventSource.Local) {
			this.props.appApi.displayPreferenceChanged(preference);
		}
		super.onDisplayPreferenceChanged(preference, eventSource);
	}
	protected onUserSignedIn(profile: WebAppUserProfile, eventType: SignInEventType, eventSource: EventSource) {
		// sync auth state with app
		if (this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.2')) >= 0) {
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
			if (route.screenKey === ScreenKey.Read) {
				const pathParams = route.getPathParams(this._signInLocation.path);
				screen = this.createScreen(ScreenKey.Comments, pathParams);
				this.props.appApi.readArticle({
					slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug']
				});
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
			if (this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.5.1')) >= 0) {
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
		if (this.props.appApi.deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.1')) >= 0) {
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
	protected readArticle(article: UserArticle, ev?: React.MouseEvent<HTMLAnchorElement>) {
		ev?.preventDefault();
		if (
			!this.state.subscriptionStatus.isUserFreeForLife &&
			(
				this.state.subscriptionStatus.type !== SubscriptionStatusType.Active ||
				this.state.isProcessingPayment
			)
		) {
			this._openSubscriptionPromptDialog(article);
		} else {
			this.props.appApi.readArticle(article);
		}
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
							onViewNotifications={this._viewNotifications}
							selectedScreenKey={this.state.screens[0].key}
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
							onViewMyImpact={this._viewMyImpact}
							onViewMyReads={this._viewMyReads}
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
								onViewDiscover={this._viewDiscover}
								onViewLeaderboards={this._viewLeaderboards}
								onViewPrivacyPolicy={this._viewPrivacyPolicy}
								onViewProfile={this._viewProfile}
								onViewSettings={this._viewSettings}
								onViewStats={this._viewStats}
								selectedScreen={this.state.screens[0]}
								userAccount={this.state.user}
							/> :
							null}
						{this.state.isInOrientation ?
							<OrientationWizard
								onComplete={this._completeOrientation}
								onCreateAbsoluteUrl={this._createAbsoluteUrl}
								onCreateStaticContentUrl={this._createStaticContentUrl}
								onRequestNotificationAuthorization={this._requestNotificationAuthorization}
								onShare={this._handleShareRequestWithCompletion}
								user={this.state.user}
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
	protected viewComments(article: Pick<UserArticle, 'slug'>, highlightedCommentId?: string) {
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
		this.props.appApi
			.getDeviceInfo()
			.then(
				deviceInfo => {
					if (deviceInfo.appVersion.compareTo(new SemanticVersion('5.6.1')) >= 0) {
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
		if (initialRoute.screenKey === ScreenKey.Read && this.props.initialUserProfile) {
			const pathParams = initialRoute.getPathParams(this.props.initialLocation.path);
			this.props.appApi.readArticle({
				slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug']
			});
		}
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
	}
}