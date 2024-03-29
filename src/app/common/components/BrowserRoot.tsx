// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import Toaster, { Intent } from '../../../common/components/Toaster';
import Root, {
	Props as RootProps,
	State as RootState,
	SharedState as RootSharedState,
	Screen,
	Events,
	NavMethod,
	NavOptions,
	NavReference,
	parseNavReference,
	ReadArticleReference,
} from './Root';
import Header from './BrowserRoot/Header';
import UserAccount, {
	areEqual as areUsersEqual,
} from '../../../common/models/UserAccount';
import DialogManager from '../../../common/components/DialogManager';
import ScreenKey from '../../../common/routing/ScreenKey';
import createCommentsScreenFactory from './screens/CommentsScreen';
import createHomeScreenFactory from './screens/HomeScreen';
import createLeaderboardsScreenFactory from './screens/LeaderboardsScreen';
import BrowserApiBase from '../../../common/BrowserApiBase';
import ExtensionApi from '../ExtensionApi';
import {
	findRouteByKey,
	findRouteByLocation,
} from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import EventSource from '../EventSource';
import UpdateToast from './UpdateToast';
import CommentThread from '../../../common/models/CommentThread';
import createReadScreenFactory from './BrowserRoot/ReadScreen';
import ShareChannel from '../../../common/sharing/ShareChannel';
import {
	parseQueryString,
	unroutableQueryStringKeys,
	messageQueryStringKey,
	authServiceTokenQueryStringKey,
	extensionInstalledQueryStringKey,
	createQueryString,
	appReferralQueryStringKey,
} from '../../../common/routing/queryString';
import Icon from '../../../common/components/Icon';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import createMyReadsScreenFactory from './screens/MyReadsScreen';
import createProfileScreenFactory from './screens/ProfileScreen';
import Post from '../../../common/models/social/Post';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import createAotdHistoryScreenFactory from './screens/AotdHistoryScreen';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import { DeviceType } from '../../../common/DeviceType';
import createSettingsScreenFactory from './SettingsPage';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import * as Cookies from 'js-cookie';
import { extensionInstallationRedirectPathCookieKey } from '../../../common/cookies';
import OnboardingFlow from './OnboardingFlow';
import ShareForm from '../../../common/models/analytics/ShareForm';
import {
	AuthServiceBrowserLinkResponse,
	isAuthServiceBrowserLinkSuccessResponse,
} from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthenticationError from '../../../common/models/auth/AuthenticationError';
import createAuthorScreenFactory from './screens/AuthorScreen';
import createNotificationsScreenFactory from './screens/NotificationsScreen';
import createSearchScreenFactory from './screens/SearchScreen';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference, {
	getClientDefaultDisplayPreference,
} from '../../../common/models/userAccounts/DisplayPreference';
import { createUrl } from '../../../common/HttpEndpoint';
import BrowserPopupResponseResponse from '../../../common/models/auth/BrowserPopupResponseResponse';
import Footer from './BrowserRoot/Footer';
import { createScreenFactory as createFaqScreenFactory } from './FaqPage';
import createMyFeedScreenFactory from './screens/MyFeedScreen';
import createBlogScreenFactory from './screens/BlogScreen';
import {
	TweetWebIntentParams,
	openTweetComposerBrowserWindow,
} from '../../../common/sharing/twitter';
import { AppPlatform } from '../../../common/AppPlatform';
import { ShareChannelData } from '../../../common/sharing/ShareData';
import { ScreenTitle } from '../../../common/ScreenTitle';
import ExtensionInstalledFlow from './BrowserRoot/ExtensionInstalledFlow';
import DialogKey from '../../../common/routing/DialogKey';

interface Props extends RootProps {
	browserApi: BrowserApiBase;
	deviceType: DeviceType;
	extensionApi: ExtensionApi;
}
interface State extends RootState {
	isExtensionInstalled: boolean;
	welcomeMessage: WelcomeMessage | null;
}
export type SharedState = RootSharedState & Pick<State, 'isExtensionInstalled'>;
type ScreenChangeOptions = {
	key: ScreenKey;
	urlParams?: { [key: string]: string };
	method: NavMethod.Push | NavMethod.ReplaceAll;
} | {
	key: ScreenKey;
	urlParams?: { [key: string]: string };
	method: NavMethod.Replace;
	screenIndex: number;
} | {
	method: NavMethod.Pop;
};
enum WelcomeMessage {
	AppleIdInvalidJwt = 'AppleInvalidAuthToken',
	AppleIdInvalidSession = 'AppleInvalidSessionId',
	Rebrand = 'rebrand',
	StripeOnboardingFailed = 'StripeOnboardingFailed',
	TwitterEmailAddressRequired = 'TwitterEmailAddressRequired',
	TwitterVerificationFailed = 'TwitterInvalidAuthToken',
}
const welcomeMessages = {
	[WelcomeMessage.AppleIdInvalidJwt]:
		'We were unable to validate the ID token.',
	[WelcomeMessage.AppleIdInvalidSession]:
		'We were unable to validate your session ID.',
	[WelcomeMessage.Rebrand]:
		'Heads up, we changed our name. reallyread.it is now Readup!',
	[WelcomeMessage.StripeOnboardingFailed]:
		'We were unable to connect your Stripe account. Please contact support.',
	[WelcomeMessage.TwitterEmailAddressRequired]:
		'Your Twitter account must have a verified email address.',
	[WelcomeMessage.TwitterVerificationFailed]:
		'We were unable to validate your Twitter credentials.',
};
export default class extends Root<Props, State, SharedState, Events> {
	private _hasBroadcastInitialUser = false;
	private _isUpdateAvailable: boolean = false;
	private _updateCheckInterval: number | null = null;

	// app
	private readonly _copyAppReferrerTextToClipboard = (
		analyticsAction: string
	) => {
		this._clipboard.copyText(
			createUrl(this.props.webServerEndpoint, '/', {
				[appReferralQueryStringKey]: JSON.stringify({
					action: analyticsAction,
					currentPath: window.location.pathname,
					initialPath: this.props.initialLocation.path,
					referrerUrl: window.document.referrer,
					timestamp: Date.now(),
				}),
			})
		);
	};

	// welcome message
	private readonly _dismissWelcomeMessage = () => {
		this.setState({ welcomeMessage: null });
	};

	// screens
	private readonly _viewAotdHistory = () => {
		this.setScreenState({
			key: ScreenKey.AotdHistory,
			method: NavMethod.Push,
		});
	};
	private readonly _viewAuthor = (slug: string, name?: string) => {
		this.setScreenState({
			key: ScreenKey.Author,
			urlParams: {
				slug,
			},
			method: NavMethod.Push,
		});
	};
	private readonly _viewHome = () => {
		this.setScreenState({
			key: ScreenKey.Home,
			method: NavMethod.ReplaceAll,
		});
	};
	private readonly _viewNotifications = () => {
		this.setScreenState({
			key: ScreenKey.Notifications,
			method: NavMethod.ReplaceAll,
		});
	};
	private readonly _viewPrivacyPolicy = () => {
		this.setScreenState({
			key: ScreenKey.PrivacyPolicy,
			method: NavMethod.ReplaceAll,
		});
	};

	// sharing
	private readonly _handleShareChannelRequest = (data: ShareChannelData) => {
		switch (data.channel) {
			case ShareChannel.Clipboard:
				this._clipboard.copyText(data.text, 'Link copied to clipboard');
				break;
			case ShareChannel.Email:
				window.open(
					`mailto:${createQueryString({
						body: data.body,
						subject: data.subject,
					})}`,
					'_blank'
				);
				break;
			case ShareChannel.Twitter:
				this._openTweetComposer(data);
				break;
		}
	};
	private readonly _handleShareRequest = () => {
		return {
			channels: [
				ShareChannel.Clipboard,
				ShareChannel.Email,
				ShareChannel.Twitter,
			],
			completionHandler: (data: ShareForm) => {},
		};
	};
	private readonly _openTweetComposer = (params: TweetWebIntentParams) => {
		openTweetComposerBrowserWindow(params);
	};

	// user account
	protected readonly _linkAuthServiceAccount = (
		provider: AuthServiceProvider
	) => {
		// open window synchronously to avoid being blocked by popup blockers
		const popup = window.open(
			'',
			'_blank',
			'height=300,location=0,menubar=0,toolbar=0,width=400'
		);
		return new Promise<AuthServiceAccountAssociation>((resolve, reject) => {
			this.props.serverApi
				.requestTwitterBrowserLinkRequestToken()
				.catch((error) => {
					popup.close();
					this._toaster.addToast('Error Requesting Token', Intent.Danger);
					reject(error);
				})
				.then((token) => {
					if (!token) {
						return;
					}
					const url = new URL('https://api.twitter.com/oauth/authorize');
					url.searchParams.set('oauth_token', token.value);
					popup.location.href = url.href;
					const completionHandler = (
						response: AuthServiceBrowserLinkResponse
					) => {
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
					this.props.browserApi.addListener(
						'authServiceLinkCompleted',
						completionHandler
					);
					const popupClosePollingInterval = window.setInterval(() => {
						if (popup.closed) {
							cleanupEventHandlers();
							reject(new Error('Cancelled'));
						}
					}, 1000);
					const cleanupEventHandlers = () => {
						this.props.browserApi.removeListener(
							'authServiceLinkCompleted',
							completionHandler
						);
						window.clearInterval(popupClosePollingInterval);
					};
				})
				.catch(reject);
		});
	};
	protected readonly _resetPassword = (token: string, password: string) => {
		return this.props.serverApi
			.resetPassword({
				token,
				password,
				pushDevice: this.getPushDeviceForm(),
			})
			.then(() => {
				this._toaster.addToast('Password reset successfully.', Intent.Success);
			});
	};
	protected readonly _signInWithApple = (action: string) => {
		// can't use URLSearchParams here because apple requires spaces be
		// encoded as %20 (which encodeURIComponent does) instead of +
		const queryString = createQueryString({
			client_id: 'com.readup.webapp',
			redirect_uri: 'https://api.readup.org/Auth/AppleWeb',
			response_type: 'code id_token',
			scope: 'email',
			response_mode: 'form_post',
			state: JSON.stringify({
				client: this.props.serverApi.getClientHeaderValue(),
				...this.getSignUpAnalyticsForm(action),
			}),
		});
		window.location.href =
			'https://appleid.apple.com/auth/authorize' + queryString;
		return new Promise<BrowserPopupResponseResponse>(() => {
			// leave the promise unresolved as the browser navigates
		});
	};
	protected readonly _signInWithTwitter = (action: string) => {
		return new Promise<BrowserPopupResponseResponse>((resolve, reject) => {
			this.props.serverApi
				.requestTwitterBrowserAuthRequestToken({
					redirectPath: window.location.pathname,
					signUpAnalytics: this.getSignUpAnalyticsForm(action),
				})
				.then((token) => {
					const url = new URL('https://api.twitter.com/oauth/authorize');
					url.searchParams.set('oauth_token', token.value);
					window.location.href = url.href;
				})
				.catch(() => {
					reject(new Error('Error Requesting Token'));
				});
			// leave the promise unresolved as the browser navigates
		});
	};

	// window
	private readonly _handleHistoryPopState = () => {
		this.setScreenState({ method: NavMethod.Pop });
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
			[DialogKey.CreateAuthServiceAccount]: (location, sharedState) => (
				<OnboardingFlow
					authServiceToken={parseQueryString(location.queryString)[authServiceTokenQueryStringKey]}
					captcha={this.props.captcha}
					onClose={this._dialog.closeDialog}
					onCreateAccount={this._createAccount}
					onCreateAuthServiceAccount={this._createAuthServiceAccount}
					onRequestPasswordReset={this.props.serverApi.requestPasswordReset}
					onResetPassword={this._resetPassword}
					onShowToast={this._toaster.addToast}
					onSignIn={this._signIn}
					onSignInWithApple={this._signInWithApple}
					onSignInWithTwitter={this._signInWithTwitter}
					user={sharedState.user}
				/>
			),
			[DialogKey.ExtensionInstalled]: (location, sharedState) => (
				<ExtensionInstalledFlow
					deviceType={this.props.deviceType}
					onClose={this._dialog.closeDialog}
					onCreateStaticContentUrl={this._createStaticContentUrl}
					user={sharedState.user}
				/>
			)
		};

		// screens
		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.AotdHistory]: createAotdHistoryScreenFactory(
				ScreenKey.AotdHistory,
				{
					deviceType: this.props.deviceType,
					onCopyTextToClipboard: this._clipboard.copyText,
					onCopyAppReferrerTextToClipboard:
						this._copyAppReferrerTextToClipboard,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetAotdHistory: this.props.serverApi.getAotdHistory,
					onGetCommunityReads: this.props.serverApi.getCommunityReads,
					onNavTo: this._navTo,
					onPostArticle: this._openPostDialog,
					onRateArticle: this._rateArticle,
					onReadArticle: this._readArticle,
					onRegisterArticleChangeHandler:
						this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
				}
			),
			[ScreenKey.Author]: createAuthorScreenFactory(ScreenKey.Author, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboardingAtCreateAccount,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
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
				onViewProfile: this._viewProfile,
			}),
			[ScreenKey.Blog]: createBlogScreenFactory(ScreenKey.Blog, {
				deviceType: this.props.deviceType,
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
				onViewProfile: this._viewProfile,
			}),
			[ScreenKey.Comments]: createCommentsScreenFactory(ScreenKey.Comments, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboardingAtCreateAccount,
				onCloseDialog: this._dialog.closeDialog,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onDeleteComment: this._deleteComment,
				onGetArticle: this.props.serverApi.getArticle,
				onGetComments: this.props.serverApi.getComments,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
				onPostArticle: this._openPostDialog,
				onPostComment: this._postComment,
				onPostCommentAddendum: this._postCommentAddendum,
				onPostCommentRevision: this._postCommentRevision,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterCommentPostedHandler: this._registerCommentPostedEventHandler,
				onRegisterCommentUpdatedHandler:
					this._registerCommentUpdatedEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onViewProfile: this._viewProfile,
			}),
			[ScreenKey.Faq]: createFaqScreenFactory(ScreenKey.Faq, {
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onShowToast: this._toaster.addToast
			}),
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboardingAtCreateAccount,
				onClearAlerts: this._clearAlerts,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetCommunityReads: this.props.serverApi.getCommunityReads,
				onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
				onGetUserCount: this.props.serverApi.getUserCount,
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterUserChangeHandler: this._registerAuthChangedEventHandler,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onShowTrackingAnimation: this._showTrackingAnimation,
				onToggleArticleStar: this._toggleArticleStar,
				onViewAotdHistory: this._viewAotdHistory,
				onViewAuthor: this._viewAuthor,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
			}),
			[ScreenKey.Notifications]: createNotificationsScreenFactory(
				ScreenKey.Notifications,
				{
					deviceType: this.props.deviceType,
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
					onRegisterArticleChangeHandler:
						this._registerArticleChangeEventHandler,
					onShare: this._handleShareRequest,
					onShareViaChannel: this._handleShareChannelRequest,
					onToggleArticleStar: this._toggleArticleStar,
					onViewComments: this._viewComments,
					onViewProfile: this._viewProfile,
					onViewThread: this._viewThread,
				}
			),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(
				ScreenKey.Leaderboards,
				{
					deviceType: this.props.deviceType,
					onBeginOnboarding: this._beginOnboardingAtCreateAccount,
					onCopyAppReferrerTextToClipboard:
						this._copyAppReferrerTextToClipboard,
					onCloseDialog: this._dialog.closeDialog,
					onCreateAbsoluteUrl: this._createAbsoluteUrl,
					onCreateStaticContentUrl: this._createStaticContentUrl,
					onGetAuthorLeaderboards: this.props.serverApi.getAuthorLeaderboards,
					onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog,
					onGetReaderLeaderboards: this.props.serverApi.getLeaderboards,
					onNavTo: this._navTo,
					onOpenDialog: this._dialog.openDialog,
					onRegisterArticleChangeHandler:
						this._registerArticleChangeEventHandler,
					onSetScreenState: this._setScreenState,
					onViewAuthor: this._viewAuthor,
					onViewProfile: this._viewProfile,
				}
			),
			[ScreenKey.MyFeed]: createMyFeedScreenFactory(ScreenKey.MyFeed, {
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
				onOpenSignInPrompt: this._beginOnboardingAtSignIn,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterFolloweeCountChangedHandler:
					this._registerFolloweeCountChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread,
			}),
			[ScreenKey.MyReads]: createMyReadsScreenFactory(ScreenKey.MyReads, {
				/*
					This isn't inaccurate but it doesn't matter since viewing My Reads in the browser is deprecated.
				*/
				appPlatform: AppPlatform.Windows,
				deviceType: this.props.deviceType,
				onCloseDialog: this._dialog.closeDialog,
				onCreateAbsoluteUrl: this._createAbsoluteUrl,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetStarredArticles: this.props.serverApi.getStarredArticles,
				onGetUserArticleHistory: this.props.serverApi.getUserArticleHistory,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onOpenSignInPrompt: this._beginOnboardingAtSignIn,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticleStarredHandler:
					this._registerArticleStarredEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onShowToast: this._toaster.addToast,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
			}),
			[ScreenKey.Profile]: createProfileScreenFactory(ScreenKey.Profile, {
				deviceType: this.props.deviceType,
				onBeginOnboarding: this._beginOnboardingAtCreateAccount,
				onClearAlerts: this._clearAlerts,
				onCloseDialog: this._dialog.closeDialog,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
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
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
				onPostArticle: this._openPostDialog,
				onRateArticle: this._rateArticle,
				onReadArticle: this._readArticle,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
				onRegisterArticlePostedHandler: this._registerArticlePostedEventHandler,
				onRegisterCommentUpdatedHandler:
					this._registerCommentUpdatedEventHandler,
				onRegisterFolloweeCountChangedHandler:
					this._registerFolloweeCountChangedEventHandler,
				onSetScreenState: this._setScreenState,
				onShare: this._handleShareRequest,
				onShareViaChannel: this._handleShareChannelRequest,
				onToggleArticleStar: this._toggleArticleStar,
				onUnfollowUser: this._unfollowUser,
				onViewComments: this._viewComments,
				onViewProfile: this._viewProfile,
				onViewThread: this._viewThread,
			}),
			[ScreenKey.Read]: createReadScreenFactory(ScreenKey.Read, {
				deviceType: this.props.deviceType,
				onCopyAppReferrerTextToClipboard: this._copyAppReferrerTextToClipboard,
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetArticle: this.props.serverApi.getArticle,
				onNavTo: this._navTo,
				onOpenNewPlatformNotificationRequestDialog:
					this._openNewPlatformNotificationRequestDialog,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState,
				onShowToast: this._toaster.addToast
			}),
			[ScreenKey.Search]: createSearchScreenFactory(ScreenKey.Search, {
				deviceType: this.props.deviceType,
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
				onViewThread: this._viewThread,
			}),
			[ScreenKey.Settings]: createSettingsScreenFactory(ScreenKey.Settings, {
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
				onOpenDialog: this._dialog.openDialog,
				onNavTo: this._navTo,
				onOpenTweetComposer: this._openTweetComposer,
				onRegisterNotificationPreferenceChangedEventHandler:
					this._registerNotificationPreferenceChangedEventHandler,
				onResendConfirmationEmail: this._resendConfirmationEmail,
				onSendPasswordCreationEmail: this._sendPasswordCreationEmail,
				onShowToast: this._toaster.addToast,
				onSignOut: this._signOut,
				onSubmitAuthorEmailVerificationRequest:
					this._submitAuthorEmailVerificationRequest,
				onViewPrivacyPolicy: this._viewPrivacyPolicy,
			}),
		};

		// route state
		const locationState = this.getLocationDependentState(props.initialLocation);

		// query string state
		const queryStringParams = parseQueryString(
				props.initialLocation.queryString
			),
			welcomeMessage = queryStringParams[
				messageQueryStringKey
			] as WelcomeMessage;

		this.state = {
			...this.state,
			dialogs: locationState.dialog ? [this._dialog.createDialog(locationState.dialog)] : [],
			isExtensionInstalled: props.extensionApi.isInstalled,
			screens: [locationState.screen],
			welcomeMessage: welcomeMessage in welcomeMessages ? welcomeMessage : null,
		};

		// BrowserApi
		props.browserApi.setTitle(locationState.screen.title);
		props.browserApi
			.addListener('articleUpdated', (event) => {
				this.onArticleUpdated(event, EventSource.Remote);
			})
			.addListener('authServiceLinkCompleted', (response) => {
				if (
					isAuthServiceBrowserLinkSuccessResponse(response) &&
					response.association.provider === AuthServiceProvider.Twitter &&
					!this.state.user.hasLinkedTwitterAccount
				) {
					this.onUserUpdated(
						{
							...this.state.user,
							hasLinkedTwitterAccount: true,
						},
						EventSource.Remote
					);
				}
			})
			.addListener('articlePosted', (post) => {
				this.onArticlePosted(post, EventSource.Remote);
			})
			.addListener('commentPosted', (comment) => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', (comment) => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener('displayPreferenceChanged', (preference) => {
				this.onDisplayPreferenceChanged(preference, EventSource.Remote);
			})
			.addListener('extensionInstallationChanged', (event) => {
				this.props.extensionApi.extensionInstallationEventReceived(event);
			})
			.addListener('notificationPreferenceChanged', (preference) => {
				this.onNotificationPreferenceChanged(preference, EventSource.Remote);
			})
			.addListener('updateAvailable', (version) => {
				if (
					!this._isUpdateAvailable &&
					version.compareTo(this.props.version) > 0
				) {
					this.setUpdateAvailable();
				}
			})
			.addListener('userSignedIn', (data) => {
				let profile: WebAppUserProfile;
				// check for broadcast from legacy web app instance
				if ('userAccount' in data) {
					profile = data;
				} else {
					profile = {
						userAccount: data,
					};
					// manually check for display preference before setting default
					this.props.serverApi.getDisplayPreference((result) => {
						if (result.value) {
							if (this.state.displayTheme == null) {
								this.onDisplayPreferenceChanged(
									result.value,
									EventSource.Local
								);
							}
						} else {
							this._changeDisplayPreference(
								getClientDefaultDisplayPreference()
							);
						}
					});
				}
				this.onUserSignedIn(
					profile,
					SignInEventType.ExistingUser,
					EventSource.Remote
				);
			})
			.addListener('userSignedOut', () => {
				this.onUserSignedOut(EventSource.Remote);
			})
			.addListener('userUpdated', (user) => {
				if (!areUsersEqual(this.state.user, user)) {
					this.onUserUpdated(user, EventSource.Remote);
				}
			});

		// ExtensionApi
		props.extensionApi
			.addListener('articlePosted', (post) => {
				this.onArticlePosted(post, EventSource.Remote);
			})
			.addListener('articleUpdated', (event) => {
				this.onArticleUpdated(event, EventSource.Remote);
			})
			.addListener('installationStatusChanged', (installedVersion) => {
				this.setState({
					isExtensionInstalled: !!installedVersion,
				});
			})
			.addListener('commentPosted', (comment) => {
				this.onCommentPosted(comment, EventSource.Remote);
			})
			.addListener('commentUpdated', (comment) => {
				this.onCommentUpdated(comment, EventSource.Remote);
			})
			.addListener('displayPreferenceChanged', (preference) => {
				this.onDisplayPreferenceChanged(preference, EventSource.Remote);
			})
			.addListener('userUpdated', (user) => {
				if (!areUsersEqual(this.state.user, user)) {
					this.onUserUpdated(user, EventSource.Remote);
				}
			});
	}
	private changeScreen(options: ScreenChangeOptions) {
		let screens: Screen[];
		if (options.method === NavMethod.Pop) {
			if (this.state.screens.length > 1) {
				screens = this.state.screens.slice(0, this.state.screens.length - 1);
			} else {
				const route = findRouteByLocation(routes, {
						path: window.location.pathname,
					}),
					screen = this.createScreen(
						route.screenKey,
						route.getPathParams
							? route.getPathParams(window.location.pathname)
							: null
					);
				screens = [screen];
			}
		} else {
			const screen = this.createScreen(options.key, options.urlParams, {
					isReplacement: options.method === NavMethod.Replace,
				}),
				historyTitle = screen.title.seo ?? screen.title.default,
				historyUrl = screen.location.path + (screen.location.queryString || '');
			switch (options.method) {
				case NavMethod.Push:
					screens = [...this.state.screens, screen];
					window.history.pushState(null, historyTitle, historyUrl);
					break;
				case NavMethod.Replace:
					screens = this.state.screens.slice();
					screens.splice(options.screenIndex, 1, screen);
					if (options.screenIndex === screens.length - 1) {
						window.history.replaceState(null, historyTitle, historyUrl);
					}
					break;
				case NavMethod.ReplaceAll:
					screens = [screen];
					window.history.pushState(null, historyTitle, historyUrl);
					break;
			}
		}
		this.props.browserApi.setTitle(screens[screens.length - 1].title);
		// return the new state object
		return {
			screens,
		};
	}
	private checkForUpdate() {
		if (!this._isUpdateAvailable) {
			this.fetchUpdateStatus().then((status) => {
				if (status.isAvailable) {
					this.setUpdateAvailable();
					this.props.browserApi.updateAvailable(status.version);
				}
			});
		}
	}
	private setScreenState(
		options:
			| {
					key: ScreenKey;
					urlParams?: { [key: string]: string };
					method: NavMethod.Push | NavMethod.ReplaceAll;
			  }
			| {
					key: ScreenKey;
					urlParams?: { [key: string]: string };
					method: NavMethod.Replace;
					screenId: number;
			  }
			| {
					method: NavMethod.Pop;
			  }
	) {
		let screenChangeOptions: ScreenChangeOptions;
		if (options.method === NavMethod.Replace) {
			const screenIndex = this.state.screens.findIndex(
				(screen) => screen.id === options.screenId
			);
			if (screenIndex === -1) {
				return;
			}
			screenChangeOptions = {
				key: options.key,
				urlParams: options.urlParams,
				method: options.method,
				screenIndex,
			};
		} else {
			screenChangeOptions = options;
		}
		this.setState(
			this.changeScreen(screenChangeOptions),
			screenChangeOptions.method !== NavMethod.Pop ?
				() => {
					window.scrollTo(0, 0);
				} :
				null
		);
	}
	private setUpdateAvailable() {
		this._isUpdateAvailable = true;
		this.stopUpdateCheckInterval();
		this._toaster.addToast(
			<UpdateToast onUpdate={this._reloadWindow} updateAction='reload' />,
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
			showTrackingAnimationPrompt: this.state.showTrackingAnimationPrompt,
			user: this.state.user,
		};
	}
	protected getSignUpAnalyticsForm(action: string) {
		return {
			action,
			currentPath: window.location.pathname,
			initialPath: this.props.initialLocation.path,
			referrerUrl: window.document.referrer,
		};
	}
	protected navTo(ref: NavReference, options?: NavOptions) {
		const result = parseNavReference(ref);
		if (result.isInternal && result.screenKey != null) {
			this.setScreenState({
				key: result.screenKey,
				urlParams: result.screenParams,
				...(options ?? {
					method: NavMethod.Push,
				}),
			});
			return true;
		} else if (!result.isInternal && result.url) {
			window.open(result.url, '_blank');
			return true;
		}
		return false;
	}
	protected onArticleUpdated(
		event: ArticleUpdatedEvent,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.articleUpdated(event);
			this.props.extensionApi.articleUpdated(event);
		}
		super.onArticleUpdated(event);
	}
	protected onArticlePosted(
		post: Post,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.articlePosted(post);
		}
		super.onArticlePosted(post);
	}
	protected onCommentPosted(
		comment: CommentThread,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.commentPosted(comment);
			this.props.extensionApi.commentPosted(comment);
		}
		super.onCommentPosted(comment);
	}
	protected onCommentUpdated(
		comment: CommentThread,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.commentUpdated(comment);
			this.props.extensionApi.commentUpdated(comment);
		}
		super.onCommentUpdated(comment);
	}
	protected onDisplayPreferenceChanged(
		preference: DisplayPreference,
		eventSource: EventSource
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.displayPreferenceChanged(preference);
			this.props.extensionApi.displayPreferenceChanged(preference);
		}
		super.onDisplayPreferenceChanged(preference, eventSource);
	}
	protected onLocationChanged(path: string, title?: ScreenTitle) {
		window.history.replaceState(null, title?.seo ?? title?.default ?? window.document.title, path);
		if (title) {
			this.props.browserApi.setTitle(title);
		}
	}
	protected onNotificationPreferenceChanged(
		preference: NotificationPreference,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.notificationPreferenceChanged(preference);
		}
		super.onNotificationPreferenceChanged(preference);
	}
	protected onTitleChanged(title: ScreenTitle) {
		this.props.browserApi.setTitle(title);
	}
	protected onUserSignedIn(
		profile: WebAppUserProfile,
		eventType: SignInEventType,
		eventSource: EventSource
	) {
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedIn(profile);
			this.props.extensionApi.userSignedIn(profile);
			// legacy compatibility for versions prior to userSignedIn
			if (profile.displayPreference) {
				this.props.extensionApi.displayPreferenceChanged(
					profile.displayPreference
				);
			}
		}
		const screenAuthLevel = findRouteByKey(
			routes,
			this.state.screens[0].key
		).authLevel;
		let supplementaryState: Partial<State>;
		if (
			screenAuthLevel != null &&
			profile.userAccount.role !== screenAuthLevel
		) {
			supplementaryState = this.changeScreen({
				key: ScreenKey.Home,
				method: NavMethod.ReplaceAll,
			});
		}
		return super.onUserSignedIn(
			profile,
			eventType,
			eventSource,
			supplementaryState
		);
	}
	protected onUserSignedOut(
		eventSource: EventSource | Partial<State> = EventSource.Local
	) {
		// check the event source to see if we should broadcast a local event
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userSignedOut();
			this.props.extensionApi.userSignedOut();
		}
		// check to see if any of the screens require authentication
		let supplementaryState: Partial<State>;
		for (const screen of this.state.screens) {
			const route = findRouteByKey(routes, screen.key);
			if (route.authLevel != null) {
				supplementaryState = this.changeScreen({
					key: ScreenKey.Home,
					method: NavMethod.ReplaceAll,
				});
				break;
			}
		}
		return super.onUserSignedOut(supplementaryState);
	}
	protected onUserUpdated(
		user: UserAccount,
		eventSource: EventSource = EventSource.Local
	) {
		if (eventSource === EventSource.Local) {
			this.props.browserApi.userUpdated(user);
			this.props.extensionApi.userUpdated(user);
			if (!this._hasBroadcastInitialUser) {
				this._hasBroadcastInitialUser = true;
			}
		}
		super.onUserUpdated(user, eventSource);
	}

	protected readArticle(
		article: ReadArticleReference,
		ev?: React.MouseEvent<HTMLAnchorElement>
	) {
		ev?.preventDefault();
		const [sourceSlug, articleSlug] = article.slug.split('_');
		if (this.props.extensionApi.isInstalled) {
			// open extension reader
			// TODO PROXY EXT: get extension URL/ID ƒrom messaging event page? or config?
			// location.href = ;
			this.props.extensionApi.readArticle(article);
		} else {
			ev?.preventDefault();
			this.setScreenState({
				key: ScreenKey.Read,
				method: NavMethod.ReplaceAll,
				urlParams: { sourceSlug, articleSlug },
			});
		}
	}
	protected reloadWindow() {
		window.location.href = '/';
	}
	protected renderBody() {
		const topScreen = this.state.screens[this.state.screens.length - 1],
			sharedState = this.getSharedState();
		return (
			<>
				{this.state.welcomeMessage ? (
					<div className="welcome-message">
						{welcomeMessages[this.state.welcomeMessage]}
						<Icon
							className="icon"
							name="cancel"
							onClick={this._dismissWelcomeMessage}
						/>
					</div>
				) : null}
				<Header
					deviceType={this.props.deviceType}
					onBeginOnboarding={this._beginOnboardingAtCreateAccount}
					onCopyAppReferrerTextToClipboard={
						this._copyAppReferrerTextToClipboard
					}
					onCreateStaticContentUrl={this._createStaticContentUrl}
					onOpenNewPlatformNotificationRequestDialog={
						this._openNewPlatformNotificationRequestDialog
					}
					onOpenSignInPrompt={this._beginOnboardingAtSignIn}
					onViewHome={this._viewHome}
					onViewNotifications={this._viewNotifications}
					onNavTo={this._navTo}
					topScreen={topScreen}
					user={this.state.user}
				/>
				<main>
					<ol className="screens">
						{this.state.screens.map((screen) => (
							<li className="screen" key={screen.id}>
								{this._screenFactoryMap[screen.key].render(screen, sharedState)}
							</li>
						))}
					</ol>
				</main>
				<Footer
					onNavTo={this._navTo}
					onOpenDialog={this._dialog.openDialog}
					onCloseDialog={this._dialog.closeDialog}
					onCreateStaticContentUrl={this._createStaticContentUrl}
					showWhatIsReadup={topScreen.key !== ScreenKey.Home}
				/>
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
		super.componentDidMount();
		// parse query string
		const queryStringParams = parseQueryString(
			this.props.initialLocation.queryString
		);
		// clear query string used to set initial state
		window.history.replaceState(
			null,
			window.document.title,
			window.location.pathname
		);
		// add listener for back navigation
		window.addEventListener('popstate', this._handleHistoryPopState);
		// add listener for visibility change
		window.document.addEventListener(
			'visibilitychange',
			this._handleVisibilityChange
		);
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
			this.props.browserApi.displayPreferenceChanged(
				this.props.initialUserProfile.displayPreference
			);
			this.props.extensionApi.displayPreferenceChanged(
				this.props.initialUserProfile.displayPreference
			);
		}
		// broadcast extension installation or removal
		const initialRoute = findRouteByLocation(
			routes,
			this.props.initialLocation,
			unroutableQueryStringKeys
		);
		if (initialRoute.screenKey === ScreenKey.ExtensionRemoval) {
			this.props.browserApi.extensionInstallationChanged({
				type: 'uninstalled',
			});
		} else if (
			extensionInstalledQueryStringKey in queryStringParams &&
			this.props.extensionApi.isInstalled
		) {
			this.props.browserApi.extensionInstallationChanged({
				type: 'installed',
				version: this.props.extensionApi.installedVersion,
			});
		}
		// clear extension installation redirect cookie
		Cookies.remove(extensionInstallationRedirectPathCookieKey, {
			domain: '.' + this.props.webServerEndpoint.host,
			sameSite: 'none',
			secure: this.props.webServerEndpoint.protocol === 'https',
		});
	}
	public componentWillUnmount() {
		super.componentWillUnmount();
		window.removeEventListener('popstate', this._handleHistoryPopState);
		window.document.removeEventListener(
			'visibilitychange',
			this._handleVisibilityChange
		);
		if (this._updateCheckInterval) {
			window.clearInterval(this._updateCheckInterval);
		}
	}
}
