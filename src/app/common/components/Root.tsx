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
import UserAccount, { hasAnyAlerts } from '../../../common/models/UserAccount';
import CaptchaBase from '../../../common/captcha/CaptchaBase';
import { Intent } from '../../../common/components/Toaster';
import ServerApi from '../serverApi/ServerApi';
import UserArticle from '../../../common/models/UserArticle';
import {
	parseQueryString,
	unroutableQueryStringKeys,
	authenticateQueryStringKey,
} from '../../../common/routing/queryString';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey, {
	ScreenKeyNavParams,
} from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import {
	findRouteByLocation,
	findRouteByKey,
	parseUrlForRoute,
} from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import RequestPasswordResetDialog from './RequestPasswordResetDialog';
import createAdminPageScreenFactory from './AdminPage';
import { createScreenFactory as createPrivacyPolicyScreenFactory } from './PrivacyPolicyPage';
import { createScreenFactory as createEmailConfirmationScreenFactory } from './EmailConfirmationPage';
import { createScreenFactory as createPasswordScreenFactory } from './PasswordPage';
import { createScreenFactory as createEmailSubscriptionsScreenFactory } from './EmailSubscriptionsPage';
import { createScreenFactory as createMarketingScreenFactory } from './screens/MarketingScreen';
import { DateTime } from 'luxon';
import AsyncTracker from '../../../common/AsyncTracker';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import RootErrorBoundary from './RootErrorBoundary';
import ToasterService, {
	State as ToasterState,
} from '../../../common/services/ToasterService';
import ClipboardTextInput from '../../../common/components/ClipboardTextInput';
import HttpEndpoint, { createUrl } from '../../../common/HttpEndpoint';
import ClipboardService from '../../../common/services/ClipboardService';
import CommentThread from '../../../common/models/CommentThread';
import SemanticVersion from '../../../common/SemanticVersion';
import EventManager from '../../../common/EventManager';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import { createScreenFactory as createStatsScreenFactory } from './screens/StatsScreen';
import createExtensionRemovalScreenFactory from './ExtensionRemovalScreen';
import UserNameForm from '../../../common/models/social/UserNameForm';
import PostDialog from '../../../common/components/PostDialog';
import PostForm from '../../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../../common/models/social/Post';
import DialogService, {
	DialogServiceState,
} from '../../../common/services/DialogService';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import Alert from '../../../common/models/notifications/Alert';
import FolloweeCountChange from '../../../common/models/social/FolloweeCountChange';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import { Form as CreateAccountDialogForm } from './CreateAccountDialog';
import SignUpAnalyticsForm from '../../../common/models/analytics/SignUpAnalyticsForm';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import DisplayPreference, {
	getClientPreferredColorScheme,
	DisplayTheme,
	getClientDefaultDisplayPreference,
} from '../../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import EventSource from '../EventSource';
import Fetchable from '../../../common/Fetchable';
import Settings from '../../../common/models/Settings';
import NewPlatformNotificationRequestDialog from './BrowserRoot/NewPlatformNotificationRequestDialog';
import {
	AuthorAssignmentRequest,
	AuthorUnassignmentRequest,
} from '../../../common/models/articles/AuthorAssignment';
import { AuthorEmailVerificationRequest } from '../../../common/models/userAccounts/AuthorEmailVerificationRequest';
import { ArticleStarredEvent } from '../AppApi';
import { AuthorUserAccountAssignmentRequest } from '../../../common/models/authors/AuthorUserAccountAssignment';
import { ScreenTitle } from '../../../common/ScreenTitle';
import OnboardingFlow, {
	Step as OnboardingStep,
} from './OnboardingFlow';
import AuthServiceAccountForm from '../../../common/models/userAccounts/AuthServiceAccountForm';
import AuthServiceCredentialAuthResponse from '../../../common/models/auth/AuthServiceCredentialAuthResponse';
import SignInForm from '../../../common/models/userAccounts/SignInForm';
import TrackingAnimationDialog from './TrackingAnimationDialog';
import * as Cookies from 'js-cookie';
import { hideTrackingAnimationPromptCookieKey } from '../../../common/cookies';

export interface Props {
	captcha: CaptchaBase;
	initialLocation: RouteLocation;
	initialShowTrackingAnimationPrompt: boolean;
	initialUserProfile: WebAppUserProfile | null;
	serverApi: ServerApi;
	staticServerEndpoint: HttpEndpoint;
	version: SemanticVersion;
	webServerEndpoint: HttpEndpoint;
}
export enum NavMethod {
	Pop,
	Push,
	Replace,
	ReplaceAll,
}
export type NavOptions =
	| {
			method: NavMethod.Push;
	  }
	| {
			method: NavMethod.Replace;
			screenId: number;
	  }
	| {
			method: NavMethod.ReplaceAll;
	  };
export type NavReference = string | ScreenKeyNavParams;
export function parseNavReference(ref: NavReference) {
	if (typeof ref === 'string') {
		const result = parseUrlForRoute(ref);
		return {
			isInternal: result.isInternal,
			screenKey: result.route?.screenKey,
			screenParams: result.route?.getPathParams
				? result.route.getPathParams(result.url.pathname)
				: null,
			url: result.url?.href,
		};
	}
	return {
		isInternal: true,
		screenKey: ref.key,
		screenParams: ref.params,
		url: null,
	};
}
export type ReadArticleReference = Pick<UserArticle, 'slug' | 'url'>;
export interface Screen<T = any> {
	id: number;
	componentState?: T;
	key: ScreenKey;
	location: RouteLocation;
	title: ScreenTitle;
	isReplacement?: boolean;
}
export interface ScreenFactory<TSharedState> {
	create: (
		id: number,
		location: RouteLocation,
		sharedState: TSharedState
	) => Screen;
	render: (screenState: Screen, sharedState: TSharedState) => React.ReactNode;
	renderHeaderContent?: (
		screenState: Screen,
		sharedState: TSharedState
	) => React.ReactNode;
}
export type State = {
	displayTheme: DisplayTheme | null;
	screens: Screen[];
	showTrackingAnimationPrompt: boolean;
	user: UserAccount | null;
} & ToasterState &
	DialogServiceState;
export type SharedState = Pick<State, 'displayTheme' | 'showTrackingAnimationPrompt' | 'user'>;
export type Events = {
	articleUpdated: ArticleUpdatedEvent;
	articlePosted: Post;
	articleStarred: ArticleStarredEvent;
	authChanged: UserAccount | null;
	commentPosted: CommentThread;
	commentUpdated: CommentThread;
	followeeCountChanged: FolloweeCountChange;
	notificationPreferenceChanged: NotificationPreference;
};
export default abstract class Root<
	TProps extends Props,
	TState extends State,
	TSharedState extends SharedState,
	TEvents extends Events
> extends React.Component<TProps, TState> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _autoFocusInputs: boolean;
	private readonly _concreteClassName: ClassValue;

	// articles
	protected readonly _assignAuthorToArticle = (
		request: AuthorAssignmentRequest
	) => this.props.serverApi.assignAuthorToArticle(request);
	protected readonly _rateArticle = (article: UserArticle, score: number) => {
		return this.props.serverApi
			.rateArticle(article.id, score)
			.then((result) => {
				this.onArticleUpdated({
					article: result.article,
					isCompletionCommit: false,
				});
				return result.rating;
			});
	};
	protected readonly _readArticle: (
		article: ReadArticleReference,
		ev?: React.MouseEvent<HTMLElement>
	) => void;
	protected readonly _toggleArticleStar = (article: UserArticle) => {
		return (
			article.dateStarred
				? this.props.serverApi.unstarArticle
				: this.props.serverApi.starArticle
		)(article.id).then((article) => {
			this.onArticleUpdated({
				article,
				isCompletionCommit: false,
			});
		});
	};
	protected readonly _unassignAuthorFromArticle = (
		request: AuthorUnassignmentRequest
	) => this.props.serverApi.unassignAuthorFromArticle(request);

	// authors
	protected readonly _assignUserAccountToAuthor = (
		request: AuthorUserAccountAssignmentRequest
	) => this.props.serverApi.assignUserAccountToAuthor(request);

	// clipboard
	protected readonly _clipboard: ClipboardService;

	// comments
	protected readonly _deleteComment = (form: CommentDeletionForm) => {
		return this.props.serverApi.deleteComment(form).then((comment) => {
			this.onCommentUpdated(comment);
			return comment;
		});
	};
	protected readonly _postComment = (form: CommentForm) => {
		return this.props.serverApi.postComment(form).then((result) => {
			this.onArticleUpdated({
				article: result.article,
				isCompletionCommit: false,
			});
			this.onCommentPosted(result.comment);
			return result.comment;
		});
	};
	protected readonly _postCommentAddendum = (form: CommentAddendumForm) => {
		return this.props.serverApi.postCommentAddendum(form).then((comment) => {
			this.onCommentUpdated(comment);
			return comment;
		});
	};
	protected readonly _postCommentRevision = (form: CommentRevisionForm) => {
		return this.props.serverApi.postCommentRevision(form).then((comment) => {
			this.onCommentUpdated(comment);
			return comment;
		});
	};
	protected readonly _viewComments = (
		article: Pick<UserArticle, 'slug'>,
		highlightedCommentId?: string
	) => {
		const [sourceSlug, articleSlug] = article.slug.split('_'),
			urlParams: { [key: string]: string } = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug,
			};
		if (highlightedCommentId != null) {
			urlParams['commentId'] = highlightedCommentId;
		}
		this.navTo(
			{
				key: ScreenKey.Comments,
				params: urlParams,
			},
			{
				method: NavMethod.Push,
			}
		);
	};
	protected readonly _viewRead = (article: ReadArticleReference) => {
		const [sourceSlug, articleSlug] = article.slug.split('_'),
			urlParams: { [key: string]: string } = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug,
			};
		this.navTo(
			{
				key: ScreenKey.Read,
				params: urlParams,
			},
			{
				method: NavMethod.Push,
			}
		);
	};
	protected readonly _viewThread = (
		comment: Pick<CommentThread, 'articleSlug' | 'id'>
	) => {
		this._viewComments(
			{
				slug: comment.articleSlug,
			},
			comment.id
		);
	};

	// dialogs
	protected readonly _dialog = new DialogService<TSharedState>({
		setState: (delegate, callback) => {
			this.setState(delegate, callback);
		},
	});
	protected _dialogCreatorMap: Partial<{
		[P in DialogKey]: (
			location: RouteLocation,
			sharedState: TSharedState
		) => React.ReactNode;
	}> = {
		[DialogKey.ResetPassword]: (location, sharedState) => {
			const kvps = parseQueryString(location.queryString);
			return (
				<OnboardingFlow
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
					passwordResetEmail={kvps['email']}
					passwordResetToken={kvps['token']}
				/>
			);
		},
		[DialogKey.Authenticate]: (location, sharedState) => (
			<OnboardingFlow
				analyticsAction="authenticateQueryString"
				initialAuthenticationStep={parseQueryString(location.queryString)[authenticateQueryStringKey] === 'signIn' ? OnboardingStep.SignIn : OnboardingStep.CreateAccount}
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
		)
	};

	// dialogs
	protected readonly _openNewPlatformNotificationRequestDialog = () => {
		this._dialog.openDialog(
			<NewPlatformNotificationRequestDialog
				onCloseDialog={this._dialog.closeDialog}
				onShowToast={this._toaster.addToast}
				onSubmitRequest={this.props.serverApi.logNewPlatformNotificationRequest}
			/>
		);
	};

	protected readonly _openPostDialog = (article: UserArticle) => {
		this._dialog.openDialog(
			<PostDialog
				article={article}
				onCloseDialog={this._dialog.closeDialog}
				onOpenDialog={this._dialog.openDialog}
				onLinkAuthServiceAccount={this._linkAuthServiceAccount}
				onShowToast={this._toaster.addToast}
				onSubmit={this._postArticle}
				user={this.state.user}
			/>
		);
	};
	protected readonly _openRequestPasswordResetDialog = (
		authServiceToken?: string
	) => {
		this._dialog.openDialog(
			<RequestPasswordResetDialog
				authServiceToken={authServiceToken}
				autoFocus={this._autoFocusInputs}
				captcha={this.props.captcha}
				onCloseDialog={this._dialog.closeDialog}
				onRequestPasswordReset={this.props.serverApi.requestPasswordReset}
				onShowToast={this._toaster.addToast}
			/>
		);
	};

	// events
	protected readonly _eventManager = new EventManager<TEvents>();
	protected readonly _registerArticleChangeEventHandler = (
		handler: (event: ArticleUpdatedEvent) => void
	) => {
		return this._eventManager.addListener('articleUpdated', handler);
	};
	protected readonly _registerArticlePostedEventHandler = (
		handler: (event: Post) => void
	) => {
		return this._eventManager.addListener('articlePosted', handler);
	};
	protected readonly _registerArticleStarredEventHandler = (
		handler: (event: ArticleStarredEvent) => void
	) => {
		return this._eventManager.addListener('articleStarred', handler);
	};
	protected readonly _registerAuthChangedEventHandler = (
		handler: (user: UserAccount | null) => void
	) => {
		return this._eventManager.addListener('authChanged', handler);
	};
	protected readonly _registerCommentPostedEventHandler = (
		handler: (comment: CommentThread) => void
	) => {
		return this._eventManager.addListener('commentPosted', handler);
	};
	protected readonly _registerCommentUpdatedEventHandler = (
		handler: (comment: CommentThread) => void
	) => {
		return this._eventManager.addListener('commentUpdated', handler);
	};
	protected readonly _registerFolloweeCountChangedEventHandler = (
		handler: (change: FolloweeCountChange) => void
	) => {
		return this._eventManager.addListener('followeeCountChanged', handler);
	};
	protected readonly _registerNotificationPreferenceChangedEventHandler = (
		handler: (preference: NotificationPreference) => void
	) => {
		return this._eventManager.addListener(
			'notificationPreferenceChanged',
			handler
		);
	};

	// notifications
	protected readonly _clearAlerts = (alerts: Alert) => {
		if (!hasAnyAlerts(this.state.user, alerts)) {
			return;
		}
		let newUser = {
			...this.state.user,
		};
		if (alerts & Alert.Aotd) {
			newUser.aotdAlert = false;
		}
		if (alerts & Alert.Reply) {
			newUser.replyAlertCount = 0;
		}
		if (alerts & Alert.Loopback) {
			newUser.loopbackAlertCount = 0;
		}
		if (alerts & Alert.Post) {
			newUser.postAlertCount = 0;
		}
		if (alerts & Alert.Follower) {
			newUser.followerAlertCount = 0;
		}
		this.props.serverApi.clearAlerts({
			alerts,
		});
		this.onUserUpdated(newUser, EventSource.Local);
	};

	// routing
	protected readonly _createAbsoluteUrl: (path: string) => string;
	protected readonly _createStaticContentUrl = (path: string) =>
		createUrl(this.props.staticServerEndpoint, path);
	protected readonly _navTo: (
		ref: NavReference,
		options?: NavOptions
	) => boolean;

	// screens
	protected _screenFactoryMap: Partial<{
		[P in ScreenKey]: ScreenFactory<TSharedState>;
	}>;

	// social
	protected readonly _followUser = (form: UserNameForm) =>
		this.props.serverApi.followUser(form).then(() => {
			this._eventManager.triggerEvent(
				'followeeCountChanged',
				FolloweeCountChange.Increment
			);
		});
	protected readonly _postArticle = (form: PostForm) => {
		return this.props.serverApi.postArticle(form).then((post) => {
			this.onArticlePosted(post);
			this.onArticleUpdated({
				article: post.article,
				isCompletionCommit: false,
			});
			if (post.comment) {
				this.onCommentPosted(createCommentThread(post));
			}
			return post;
		});
	};
	protected readonly _unfollowUser = (form: UserNameForm) =>
		this.props.serverApi.unfollowUser(form).then(() => {
			this._eventManager.triggerEvent(
				'followeeCountChanged',
				FolloweeCountChange.Decrement
			);
		});
	protected readonly _viewProfile = (
		userName?: string,
		options?: NavOptions
	) => {
		this.navTo(
			{
				key: ScreenKey.Profile,
				params: {
					userName: userName || this.state.user.name,
				},
			},
			options ?? {
				method: userName ? NavMethod.Push : NavMethod.ReplaceAll,
			}
		);
	};

	// state
	private _screenId = 0;
	protected readonly _setScreenState = (
		id: number,
		getNextState: (currentState: Readonly<Screen>) => Partial<Screen>
	) => {
		const screen = this.state.screens.find((screen) => screen.id === id);
		if (screen) {
			const screens = this.state.screens.slice(),
				screenIndex = screens.indexOf(screen),
				nextState = getNextState(screen);
			screens.splice(screenIndex, 1, { ...screen, ...nextState });
			this.setState({ screens });
			if (screenIndex === screens.length - 1) {
				if (
					'location' in nextState &&
					nextState.location.path !== screen.location.path
				) {
					this.onLocationChanged(nextState.location.path, nextState.title);
				} else if ('title' in nextState && nextState.title !== screen.title) {
					this.onTitleChanged(nextState.title);
				}
			}
		}
	};

	// toasts
	protected readonly _toaster = new ToasterService({
		asyncTracker: this._asyncTracker,
		setState: (
			state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>
		) => {
			this.setState(state);
		},
	});

	// user account
	protected readonly _beginOnboardingAtCreateAccount = (analyticsAction: string) => {
		this._dialog.openDialog(
			sharedState => (
				<OnboardingFlow
					analyticsAction={analyticsAction}
					initialAuthenticationStep={OnboardingStep.CreateAccount}
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
			)
		);
	};
	protected readonly _beginOnboardingAtSignIn = (analyticsAction: string) => {
		this._dialog.openDialog(
			sharedState => (
				<OnboardingFlow
					analyticsAction={analyticsAction}
					initialAuthenticationStep={OnboardingStep.SignIn}
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
			)
		);
	};
	protected readonly _changeDisplayPreference = (
		preference: DisplayPreference
	) => {
		this.onDisplayPreferenceChanged(preference, EventSource.Local);
		return this.props.serverApi.changeDisplayPreference(preference);
	};
	protected readonly _changeEmailAddress = (email: string) => {
		return this.props.serverApi.changeEmailAddress(email).then((user) => {
			this.onUserUpdated(user, EventSource.Local);
		});
	};
	protected readonly _changeNotificationPreference = (
		data: NotificationPreference
	) => {
		return this.props.serverApi
			.changeNotificationPreference(data)
			.then((preference) => {
				this.onNotificationPreferenceChanged(preference);
				return preference;
			});
	};
	protected readonly _changePassword = (
		currentPassword: string,
		newPassword: string
	) => {
		return this.props.serverApi.changePassword(currentPassword, newPassword);
	};
	protected readonly _changeTimeZone = (timeZone: {
		id?: number;
		name?: string;
	}) => {
		return this.props.serverApi.changeTimeZone(timeZone).then((user) => {
			this.onUserUpdated(user, EventSource.Local);
		});
	};
	protected readonly _createAccount = (form: CreateAccountDialogForm) => {
		return this.props.serverApi
			.createUserAccount({
				name: form.name,
				email: form.email,
				password: form.password,
				captchaResponse: form.captchaResponse,
				timeZoneName: DateTime.local().zoneName,
				theme: getClientPreferredColorScheme(),
				analytics: this.getSignUpAnalyticsForm(form.analyticsAction),
				pushDevice: this.getPushDeviceForm(),
			})
			.then((profile) => {
				this.onUserSignedIn(
					profile,
					SignInEventType.NewUser,
					EventSource.Local
				);
			});
	};
	protected readonly _createAuthServiceAccount = (
		form: Pick<AuthServiceAccountForm, 'token' | 'name'>
	) => {
		return this.props.serverApi
			.createAuthServiceAccount({
				...form,
				timeZoneName: DateTime.local().zoneName,
				theme: getClientPreferredColorScheme(),
				pushDevice: this.getPushDeviceForm(),
			})
			.then((profile) => {
				this.onUserSignedIn(
					profile,
					SignInEventType.NewUser,
					EventSource.Local
				);
			});
	};
	protected readonly _deleteAccount = () => {
		const pushDeviceForm = this.getPushDeviceForm();
		return this.props.serverApi
			.deleteUserAccount({
				installationId: pushDeviceForm && pushDeviceForm.installationId,
			})
			.then(() => this.onUserSignedOut());
	};
	protected readonly _getSettings = (
		callback: (result: Fetchable<Settings>) => void
	) => {
		return this.props.serverApi.getSettings((settings) => {
			if (settings.value) {
				this.onDisplayPreferenceChanged(
					settings.value.displayPreference,
					EventSource.Local
				);
			}
			callback(settings);
		});
	};
	protected abstract readonly _linkAuthServiceAccount: (
		provider: AuthServiceProvider
	) => Promise<AuthServiceAccountAssociation>;
	protected abstract readonly _resetPassword: (
		token: string,
		password: string
	) => Promise<void>;
	protected readonly _resendConfirmationEmail = () => {
		return this.props.serverApi
			.resendConfirmationEmail()
			.then(() => {
				this._toaster.addToast('Confirmation email sent', Intent.Success);
			})
			.catch((errors: string[]) => {
				this._toaster.addToast(
					errors.includes('ResendLimitExceeded')
						? 'Error sending email.\nPlease try again in a few minutes.'
						: 'Error sending email.\nPlease try again later.',
					Intent.Danger
				);
			});
	};
	protected readonly _sendPasswordCreationEmail = () => {
		return this.props.serverApi.sendPasswordCreationEmail();
	};
	protected readonly _showTrackingAnimation = (fromPrompt: boolean) => {
		this._dialog.openDialog(
			<TrackingAnimationDialog
				onClose={
					async () => {
						if (!fromPrompt) {
							this._dialog.closeDialog();
							return;
						}
						this.setState({
							showTrackingAnimationPrompt: false
						}, () => {
							this._dialog.closeDialog();
						});
						if (this.state.user) {
							if (!this.state.user.dateOrientationCompleted) {
								try {
									await this.props.serverApi.registerOrientationCompletion();
								} catch {
									// Non-critical error.
								}
							}
						} else if (!Cookies.get(hideTrackingAnimationPromptCookieKey)) {
							Cookies.set(hideTrackingAnimationPromptCookieKey, 'true', {
								domain: '.' + this.props.webServerEndpoint.host,
								sameSite: 'none',
								secure: this.props.webServerEndpoint.protocol === 'https',
								expires: 365
							});
						}
					}
				}
			/>
		);
	};
	protected readonly _signIn = (form: Pick<SignInForm, 'authServiceToken' | 'email' | 'password'> & { analyticsAction: string }) => {
		return this.props.serverApi
			.signIn({
				...form,
				pushDevice: this.getPushDeviceForm(),
			})
			.then((profile) => {
				return this.onUserSignedIn(
					profile,
					SignInEventType.ExistingUser,
					EventSource.Local
				);
			});
	};
	protected abstract readonly _signInWithApple: (analyticsAction: string) => Promise<AuthServiceCredentialAuthResponse>;
	protected abstract readonly _signInWithTwitter: (analyticsAction: string) => Promise<AuthServiceCredentialAuthResponse>;
	protected readonly _signOut = () => {
		const pushDeviceForm = this.getPushDeviceForm();
		return this.props.serverApi
			.signOut({
				installationId: pushDeviceForm && pushDeviceForm.installationId,
			})
			.then(() => this.onUserSignedOut());
	};
	protected readonly _submitAuthorEmailVerificationRequest = (
		request: AuthorEmailVerificationRequest
	) => this.props.serverApi.submitAuthorEmailVerificationRequest(request);
	protected readonly _updateEmailSubscriptions = (
		token: string,
		preference: NotificationPreference
	) => {
		return this.props.serverApi
			.updateEmailSubscriptions(token, preference)
			.then(() => {
				if (this.state.user) {
					this.onNotificationPreferenceChanged(preference);
				}
			});
	};

	// window
	protected readonly _reloadWindow = () => {
		this.reloadWindow();
	};

	constructor(className: ClassValue, autoFocusInputs: boolean, props: TProps) {
		super(props);
		this._autoFocusInputs = autoFocusInputs;
		this._concreteClassName = className;

		// state
		this.state = {
			displayTheme: props.initialUserProfile?.displayPreference?.theme,
			showTrackingAnimationPrompt: props.initialShowTrackingAnimationPrompt,
			toasts: [],
			user: props.initialUserProfile?.userAccount,
		} as TState;

		// clipboard
		this._clipboard = new ClipboardService((content, intent) => {
			this._toaster.addToast(content, intent);
		});

		// delegates
		this._navTo = this.navTo.bind(this);
		this._readArticle = this.readArticle.bind(this);

		// routing
		this._createAbsoluteUrl = (path) =>
			`${props.webServerEndpoint.protocol}://${props.webServerEndpoint.host}${path}`;

		// screens
		this._screenFactoryMap = {
			[ScreenKey.Admin]: createAdminPageScreenFactory(ScreenKey.Admin, {
				onAssignAuthorToArticle: this._assignAuthorToArticle,
				onAssignUserAccountToAuthor: this._assignUserAccountToAuthor,
				onGetAuthorMetadataAssignmentQueue:
					this.props.serverApi.getAuthorMetadataAssignmentQueue,
				onCloseDialog: this._dialog.closeDialog,
				onGetArticleIssueReports:
					this.props.serverApi.getArticleIssueReportAnalytics,
				onGetBulkMailings: this.props.serverApi.getBulkMailings,
				onGetConversions: this.props.serverApi.getConversionAnalytics,
				onGetDailyTotals: this.props.serverApi.getDailyTotalAnalytics,
				onGetPayoutReport: this.props.serverApi.getPayoutReport,
				onGetRevenueReport:
					this.props.serverApi.getAdminSubscriptionRevenueReport,
				onGetSignups: this.props.serverApi.getSignupAnalytics,
				onGetUserStats: this.props.serverApi.getUserAccountStats,
				onGetWeeklyUserActivityReport:
					this.props.serverApi.getWeeklyUserActivityReport,
				onNavTo: this._navTo,
				onOpenDialog: this._dialog.openDialog,
				onSendBulkMailing: this.props.serverApi.sendBulkMailing,
				onSendTestBulkMailing: this.props.serverApi.sendTestBulkMailing,
				onShowToast: this._toaster.addToast,
				onUnassignAuthorFromArticle: this._unassignAuthorFromArticle,
			}),
			[ScreenKey.EmailConfirmation]: createEmailConfirmationScreenFactory(
				ScreenKey.EmailConfirmation
			),
			[ScreenKey.EmailSubscriptions]: createEmailSubscriptionsScreenFactory(
				ScreenKey.EmailSubscriptions,
				{
					onGetEmailSubscriptions: this.props.serverApi.getEmailSubscriptions,
					onUpdateEmailSubscriptions: this._updateEmailSubscriptions,
				}
			),
			[ScreenKey.ExtensionRemoval]: createExtensionRemovalScreenFactory(
				ScreenKey.ExtensionRemoval,
				{
					onLogExtensionRemovalFeedback:
						this.props.serverApi.logExtensionRemovalFeedback,
				}
			),
			[ScreenKey.Password]: createPasswordScreenFactory(ScreenKey.Password),
			[ScreenKey.PrivacyPolicy]: createPrivacyPolicyScreenFactory(
				ScreenKey.PrivacyPolicy,
				{
					onNavTo: this._navTo,
				}
			),
			[ScreenKey.Stats]: createStatsScreenFactory(ScreenKey.Stats, {
				onGetReadingTimeStats: this.props.serverApi.getReadingTimeStats,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler,
			}),
			[ScreenKey.About]: createMarketingScreenFactory(ScreenKey.About, {
				onCreateStaticContentUrl: this._createStaticContentUrl,
				onGetPublisherArticles: this.props.serverApi.getPublisherArticles,
				onNavTo: this._navTo,
			}),
		};
	}
	private checkProfileForUnsetValues(profile: WebAppUserProfile) {
		if (profile.userAccount.timeZoneId == null) {
			this._changeTimeZone({
				name: DateTime.local().zoneName,
			});
		}
		if (profile.displayPreference == null) {
			this._changeDisplayPreference(getClientDefaultDisplayPreference());
		}
	}
	private setThemeAttribute(theme: DisplayTheme | null) {
		document.documentElement.dataset['com_readup_theme'] =
			theme != null ? (theme === DisplayTheme.Dark ? 'dark' : 'light') : '';
		window.dispatchEvent(
			new CustomEvent('com.readup.themechange', {
				detail: theme,
			})
		);
	}
	private setUserAuthChangedState(
		userProfile: WebAppUserProfile | null,
		supplementaryState?: Partial<TState>
	) {
		this.setThemeAttribute(userProfile?.displayPreference?.theme);
		return new Promise<void>((resolve) => {
			this.setState(
				{
					...(supplementaryState as State),
					displayTheme: userProfile?.displayPreference.theme,
					showTrackingAnimationPrompt: userProfile ?
						!userProfile.userAccount.dateOrientationCompleted :
						!Cookies.get(hideTrackingAnimationPromptCookieKey),
					user: userProfile?.userAccount,
				},
				() => {
					this._eventManager.triggerEvent(
						'authChanged',
						userProfile?.userAccount
					);
					resolve();
				}
			);
		});
	}
	protected fetchUpdateStatus(): Promise<{
		isAvailable: boolean;
		version?: SemanticVersion;
	}> {
		const now = Date.now(),
			lastCheck = localStorage.getItem('lastUpdateCheck');
		if (!lastCheck || now - parseInt(lastCheck) >= 1 * 60 * 60 * 1000) {
			localStorage.setItem('lastUpdateCheck', now.toString());
			return fetch('/version')
				.then((res) => {
					if (res.ok) {
						return res.text().then((versionString) => {
							const version = new SemanticVersion(versionString);
							if (this.props.version.compareTo(version) < 0) {
								return {
									isAvailable: true,
									version,
								};
							}
							return { isAvailable: false };
						});
					} else {
						throw new Error();
					}
				})
				.catch(() => {
					localStorage.setItem('lastUpdateCheck', lastCheck || '0');
					return { isAvailable: false };
				});
		}
		return Promise.resolve({ isAvailable: false });
	}
	protected createScreen(
		key: ScreenKey,
		urlParams?: { [key: string]: string },
		options?: Pick<Screen, 'isReplacement'>
	) {
		const [path, queryString] = findRouteByKey(routes, key)
			.createUrl(urlParams)
			.split('?');
		const screen = this._screenFactoryMap[key].create(
			this._screenId++,
			{ path, queryString },
			this.getSharedState()
		);
		if (options) {
			screen.isReplacement = options.isReplacement;
		}
		return screen;
	}
	protected getLocationDependentState(location: RouteLocation) {
		const route = findRouteByLocation(
				routes,
				location,
				unroutableQueryStringKeys
			),
			sharedState = this.getSharedState();
		return {
			dialog:
				route.dialogKey != null
					? this._dialogCreatorMap[route.dialogKey](location, sharedState)
					: null,
			screen: this._screenFactoryMap[route.screenKey].create(
				this._screenId++,
				location,
				sharedState
			),
		};
	}
	protected abstract getPushDeviceForm(): PushDeviceForm | null;
	protected abstract getSharedState(): TSharedState;
	protected abstract getSignUpAnalyticsForm(
		action: string
	): SignUpAnalyticsForm;
	protected abstract navTo(ref: NavReference, options?: NavOptions): boolean;
	protected onArticleUpdated(event: ArticleUpdatedEvent) {
		this._eventManager.triggerEvent('articleUpdated', event);
	}
	protected onArticlePosted(post: Post) {
		this._eventManager.triggerEvent('articlePosted', post);
	}
	protected onCommentPosted(comment: CommentThread) {
		this._eventManager.triggerEvent('commentPosted', comment);
	}
	protected onCommentUpdated(comment: CommentThread) {
		this._eventManager.triggerEvent('commentUpdated', comment);
	}
	protected onDisplayPreferenceChanged(
		preference: DisplayPreference,
		eventSource: EventSource
	) {
		this.setThemeAttribute(preference.theme);
		this.setState({
			displayTheme: preference.theme,
		});
	}
	protected onLocationChanged(path: string, title?: ScreenTitle) {}
	protected onNotificationPreferenceChanged(
		preference: NotificationPreference
	) {
		this._eventManager.triggerEvent(
			'notificationPreferenceChanged',
			preference
		);
	}
	protected onTitleChanged(title: ScreenTitle) {}
	protected onUserSignedIn(
		userProfile: WebAppUserProfile,
		eventType: SignInEventType,
		eventSource: EventSource,
		supplementaryState?: Partial<TState>
	) {
		if (
			eventType === SignInEventType.ExistingUser &&
			eventSource === EventSource.Local
		) {
			this.checkProfileForUnsetValues(userProfile);
		}
		return this.setUserAuthChangedState(userProfile, supplementaryState);
	}
	protected onUserSignedOut(supplementaryState?: Partial<TState>) {
		return this.setUserAuthChangedState(null, supplementaryState);
	}
	protected onUserUpdated(
		user: UserAccount,
		eventSource: EventSource,
		supplementaryState?: Partial<TState>
	) {
		this.setState({
			...(supplementaryState as State),
			user,
		});
	}

	protected abstract readArticle(
		article: ReadArticleReference,
		ev?: React.MouseEvent<HTMLElement>
	): void;
	protected abstract reloadWindow(): void;
	protected abstract renderBody(): React.ReactNode;
	public componentDidMount() {
		if (this.props.initialUserProfile) {
			this.checkProfileForUnsetValues(this.props.initialUserProfile);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className={classNames('root_9rc2fv', this._concreteClassName)}>
				<RootErrorBoundary
					onNavTo={this._navTo}
					onReloadWindow={this._reloadWindow}
				>
					{this.renderBody()}
					<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
				</RootErrorBoundary>
			</div>
		);
	}
}
