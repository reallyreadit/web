import * as React from 'react';
import UserAccount, { hasAlert } from '../../../common/models/UserAccount';
import Captcha from '../Captcha';
import { Intent } from '../../../common/components/Toaster';
import ServerApi from '../serverApi/ServerApi';
import UserArticle from '../../../common/models/UserArticle';
import ResetPasswordDialog from './ResetPasswordDialog';
import { parseQueryString, unroutableQueryStringKeys } from '../../../common/routing/queryString';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import { findRouteByLocation, findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import RequestPasswordResetDialog from './RequestPasswordResetDialog';
import createAdminPageScreenFactory from './AdminPage';
import createSettingsPageScreenFactory from './SettingsPage';
import { createScreenFactory as createPrivacyPolicyScreenFactory } from './PrivacyPolicyPage';
import { createScreenFactory as createEmailConfirmationScreenFactory } from './EmailConfirmationPage';
import { createScreenFactory as createPasswordScreenFactory } from './PasswordPage';
import { createScreenFactory as createEmailSubscriptionsScreenFactory } from './EmailSubscriptionsPage';
import { DateTime } from 'luxon';
import AsyncTracker from '../../../common/AsyncTracker';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import RootErrorBoundary from './RootErrorBoundary';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import ClipboardTextInput from '../../../common/components/ClipboardTextInput';
import HttpEndpoint from '../../../common/HttpEndpoint';
import ClipboardService from '../../../common/services/ClipboardService';
import CommentThread from '../../../common/models/CommentThread';
import SemanticVersion from '../../../common/SemanticVersion';
import EventManager from '../EventManager';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import { createScreenFactory as createStatsScreenFactory } from './screens/StatsScreen';
import Analytics from '../Analytics';
import createExtensionRemovalScreenFactory from './ExtensionRemovalScreen';
import UserNameForm from '../../../common/models/social/UserNameForm';
import PostDialog from '../../../common/components/PostDialog';
import PostForm from '../../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../../common/models/social/Post';
import DialogService, { State as DialogState } from '../../../common/services/DialogService';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import Alert from '../../../common/models/notifications/Alert';
import FollowingListDialog from './FollowingListDialog';
import Fetchable from '../../../common/Fetchable';
import Following from '../../../common/models/social/Following';
import FolloweeCountChange from '../../../common/models/social/FolloweeCountChange';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import { Form as CreateAccountDialogForm } from './CreateAccountDialog';
import { Form as CreateAuthServiceAccountDialogForm } from './CreateAuthServiceAccountDialog';
import SignInDialog, { Form as SignInDialogForm } from './SignInDialog';
import SignUpAnalyticsForm from '../../../common/models/userAccounts/SignUpAnalyticsForm';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';

export interface Props {
	analytics: Analytics,
	captcha: Captcha,
	initialLocation: RouteLocation,
	initialUser: UserAccount | null,
	marketingVariant: number,
	serverApi: ServerApi,
	version: SemanticVersion,
	webServerEndpoint: HttpEndpoint
}
export enum TemplateSection {
	None = 0,
	Header = 1,
	Navigation = 2,
	Footer = 4
}
export interface Screen<T = any> {
	id: number,
	componentState?: T,
	key: ScreenKey,
	location: RouteLocation,
	templateSection?: TemplateSection,
	title?: string,
	titleContent?: React.ReactNode
}
export interface ScreenFactory<TSharedState> {
	create: (id: number, location: RouteLocation, sharedState: TSharedState) => Screen,
	render: (screenState: Screen, sharedState: TSharedState) => React.ReactNode,
	renderHeaderContent?: (screenState: Screen, sharedState: TSharedState) => React.ReactNode
}
export type State = (
	{
		screens: Screen[],
		user: UserAccount | null
	} &
	ToasterState &
	DialogState
);
export type SharedState = Pick<State, 'user'>;
export type SharedEvents = {
	'articleUpdated': ArticleUpdatedEvent,
	'articlePosted': Post,
	'authChanged': UserAccount | null,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'followeeCountChanged': FolloweeCountChange,
	'notificationPreferenceChanged': NotificationPreference
};
export default abstract class Root<
	P extends Props,
	S extends State,
	TSharedState extends SharedState,
	TEvents extends SharedEvents
> extends React.Component<P, S> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _autoFocusInputs: boolean;
	private readonly _concreteClassName: ClassValue;

	// articles
	protected readonly _rateArticle = (article: UserArticle, score: number) => {
		return this.props.serverApi
			.rateArticle(article.id, score)
			.then(result => {
				this.onArticleUpdated(
					{
						article: result.article,
						isCompletionCommit: false
					}
				);
				return result.rating;
			});
	};
	protected readonly _readArticle: (article: UserArticle, ev: React.MouseEvent) => void;
	protected readonly _toggleArticleStar = (article: UserArticle) => {
		return (
			article.dateStarred ?
				this.props.serverApi.unstarArticle :
				this.props.serverApi.starArticle
			)(article.id)
			.then(article => {
				this.onArticleUpdated(
					{
						article,
						isCompletionCommit: false
					}
				);
			});
	};

	// clipboard
	protected readonly _clipboard: ClipboardService;

	// comments
	protected readonly _deleteComment = (form: CommentDeletionForm) => {
		return this.props.serverApi
			.deleteComment(form)
			.then(
				comment => {
					this.onCommentUpdated(comment);
					return comment;
				}
			);
	};
	protected readonly _postComment = (form: CommentForm) => {
		return this.props.serverApi
			.postComment(form)
			.then(result => {
				this.onArticleUpdated(
					{
						article: result.article,
						isCompletionCommit: false
					}
				);
				this.onCommentPosted(result.comment);
				return result.comment;
			});
	};
	protected readonly _postCommentAddendum = (form: CommentAddendumForm) => {
		return this.props.serverApi
			.postCommentAddendum(form)
			.then(
				comment => {
					this.onCommentUpdated(comment);
					return comment;
				}
			);
	};
	protected readonly _postCommentRevision = (form: CommentRevisionForm) => {
		return this.props.serverApi
			.postCommentRevision(form)
			.then(
				comment => {
					this.onCommentUpdated(comment);
					return comment;
				}
			);
	};
	protected readonly _viewComments: (article: UserArticle) => void;
	protected readonly _viewThread = (comment: CommentThread) => {
		this.viewComments(
			{
				slug: comment.articleSlug,
				title: comment.articleTitle
			},
			comment.id
		);
	};

	// dialogs
	protected readonly _dialog = new DialogService({
		setState: delegate => {
			this.setState(delegate);
		}
	});
	protected _dialogCreatorMap: Partial<{ [P in DialogKey]: (location: RouteLocation, sharedState: TSharedState) => React.ReactNode }> = {
		[DialogKey.Followers]: (location, sharedState) => (
			<FollowingListDialog
				clearFollowersAlerts
				highlightedUser={parseQueryString(location.queryString)['user']}
				onClearAlerts={this._clearAlerts}
				onCloseDialog={this._dialog.closeDialog}
				onCreateAbsoluteUrl={this._createAbsoluteUrl}
				onFollowUser={this._followUser}
				onGetFollowings={
					(callback: (value: Fetchable<Following[]>) => void) => this.props.serverApi.getFollowers({ userName: sharedState.user.name }, callback)
				}
				onUnfollowUser={this._unfollowUser}
				onViewProfile={this._viewProfile}
				title="Followers"
				userAccount={sharedState.user}
			/>
		),
		[DialogKey.ResetPassword]: location => {
			const kvps = parseQueryString(location.queryString);
			return (
				<ResetPasswordDialog
					email={kvps['email']}
					onCloseDialog={this._dialog.closeDialog}
					onResetPassword={this._resetPassword}
					onShowToast={this._toaster.addToast}
					token={kvps['token']}
				/>
			);
		}
	};
	protected readonly _openLinkAuthServiceAccountDialog = (token: string) => {
		this._dialog.openDialog(
			<SignInDialog
				analyticsAction="LinkAuthServiceAccount"
				authServiceToken={token}
				autoFocus={this._autoFocusInputs}
				onCloseDialog={this._dialog.closeDialog}
				onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
				onShowToast={this._toaster.addToast}
				onSignIn={this._signIn}
			/>
		);
	};
	protected readonly _openPostDialog = (article: UserArticle) => {
		this._dialog.openDialog(
			<PostDialog
				article={article}
				onCloseDialog={this._dialog.closeDialog}
				onOpenDialog={this._dialog.openDialog}
				onShowToast={this._toaster.addToast}
				onSubmit={this._postArticle}
			/>
		);
	};
	protected readonly _openRequestPasswordResetDialog = (authServiceToken?: string) => {
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
	protected readonly _registerArticleChangeEventHandler = (handler: (event: ArticleUpdatedEvent) => void) => {
		return this._eventManager.addListener('articleUpdated', handler);
	};
	protected readonly _registerArticlePostedEventHandler = (handler: (event: Post) => void) => {
		return this._eventManager.addListener('articlePosted', handler);
	};
	protected readonly _registerAuthChangedEventHandler = (handler: (user: UserAccount | null) => void) => {
		return this._eventManager.addListener('authChanged', handler);
	};
	protected readonly _registerCommentPostedEventHandler = (handler: (comment: CommentThread) => void) => {
		return this._eventManager.addListener('commentPosted', handler);
	};
	protected readonly _registerCommentUpdatedEventHandler = (handler: (comment: CommentThread) => void) => {
		return this._eventManager.addListener('commentUpdated', handler);
	};
	protected readonly _registerFolloweeCountChangedEventHandler = (handler: (change: FolloweeCountChange) => void) => {
		return this._eventManager.addListener('followeeCountChanged', handler);
	};
	protected readonly _registerNotificationPreferenceChangedEventHandler = (handler: (preference: NotificationPreference) => void) => {
		return this._eventManager.addListener('notificationPreferenceChanged', handler);
	};

	// notifications
	protected readonly _clearAlerts = (alert: Alert) => {
		const user = this.state.user as UserAccount;
		let newUser: UserAccount;
		switch (alert) {
			case Alert.Aotd:
				if (hasAlert(user, alert)) {
					newUser = { ...user, aotdAlert: false };
				}
				break;
			case Alert.Followers:
				if (hasAlert(user, alert)) {
					newUser = { ...user, followerAlertCount: 0 };
				}
				break;
			case Alert.Following:
				if (hasAlert(user, alert)) {
					newUser = { ...user, postAlertCount: 0 };
				}
				break;
			case Alert.Inbox:
				if (hasAlert(user, alert)) {
					newUser = {
						...user,
						replyAlertCount: 0,
						loopbackAlertCount: 0
					};
				}
				break;
		}
		if (newUser) {
			this.props.serverApi.clearAlerts({ alert });
			this.onUserUpdated(newUser);
		}
	};

	// routing
	protected readonly _createAbsoluteUrl: (path: string) => string;

	// screens
	protected _screenFactoryMap: Partial<{ [P in ScreenKey]: ScreenFactory<TSharedState> }>;

	// social
	protected readonly _followUser = (form: UserNameForm) => this.props.serverApi
		.followUser(form)
		.then(
			() => {
				this._eventManager.triggerEvent('followeeCountChanged', FolloweeCountChange.Increment);
			}
		);
	protected readonly _postArticle = (form: PostForm) => {
		return this.props.serverApi
			.postArticle(form)
			.then(
				post => {
					this.onArticlePosted(post);
					this.onArticleUpdated(
						{
							article: post.article,
							isCompletionCommit: false
						}
					);
					if (post.comment) {
						this.onCommentPosted(createCommentThread(post));
					}
					return post;
				}
			);
	};
	protected readonly _unfollowUser = (form: UserNameForm) => this.props.serverApi
		.unfollowUser(form)
		.then(
			() => {
				this._eventManager.triggerEvent('followeeCountChanged', FolloweeCountChange.Decrement);
			}
		);
	protected readonly _viewProfile: (userName?: string) => void;

	// state
	private _screenId = 0;
	protected readonly _setScreenState = (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => {
		const screen = this.state.screens.find(screen => screen.id === id);
		if (screen) {
			const
				screens = this.state.screens.slice(),
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
				} else if (
					'title' in nextState &&
					nextState.title !== screen.title
				) {
					this.onTitleChanged(nextState.title);
				}
			}
		}
	};

	// toasts
	protected readonly _toaster = new ToasterService({
		asyncTracker: this._asyncTracker,
		setState: (state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
			this.setState(state);
		}
	});

	// user account
	protected readonly _changeEmailAddress = (email: string) => {
		return this.props.serverApi
			.changeEmailAddress(email)
			.then(user => {
				this.onUserUpdated(user);
			});
	};
	protected readonly _changeNotificationPreference = (data: NotificationPreference) => {
		return this.props.serverApi
			.changeNotificationPreference(data)
			.then(
				preference => {
					this.onNotificationPreferenceChanged(preference);
					return preference;
				}
			);
	};
	protected readonly _changePassword = (currentPassword: string, newPassword: string) => {
		return this.props.serverApi.changePassword(currentPassword, newPassword);
	};
	protected readonly _changeTimeZone = (timeZone: { id?: number, name?: string }) => {
		return this.props.serverApi
			.changeTimeZone(timeZone)
			.then(user => {
				this.onUserUpdated(user);
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
				analytics: this.getSignUpAnalyticsForm(form.analyticsAction),
				pushDevice: this.getPushDeviceForm()
			})
			.then(
				user => {
					this.props.analytics.sendSignUp();
					this.onUserSignedIn(user, SignInEventType.NewUser);
				}
			);
	};
	protected readonly _createAuthServiceAccount = (form: CreateAuthServiceAccountDialogForm) => {
		return this.props.serverApi
			.createAuthServiceAccount({
				...form,
				timeZoneName: DateTime.local().zoneName,
				pushDevice: this.getPushDeviceForm()
			})
			.then(
				user => {
					this.props.analytics.sendSignUp();
					this.onUserSignedIn(user, SignInEventType.NewUser);
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
			.then(user => this.onUserSignedIn(user, SignInEventType.ExistingUser));
	};
	protected readonly _resendConfirmationEmail = () => {
		return this.props.serverApi
			.resendConfirmationEmail()
			.then(() => {
				this._toaster.addToast('Confirmation email sent', Intent.Success);
			})
			.catch((errors: string[]) => {
				this._toaster.addToast(
					errors.includes('ResendLimitExceeded') ?
						'Error sending email.\nPlease try again in a few minutes.' :
						'Error sending email.\nPlease try again later.',
					Intent.Danger
				);
			});
	};
	protected readonly _sendPasswordCreationEmail = () => {
		return this.props.serverApi.sendPasswordCreationEmail();
	};
	protected readonly _signIn = (form: SignInDialogForm) => {
		return this.props.serverApi
			.signIn({
				...form,
				pushDevice: this.getPushDeviceForm()
			})
			.then(user => {
				if (user.timeZoneId == null) {
					this.setTimeZone();
				}
				return this.onUserSignedIn(user, SignInEventType.ExistingUser);
			});
	};
	protected readonly _signOut = () => {
		const pushDeviceForm = this.getPushDeviceForm();
		return this.props.serverApi
			.signOut({
				installationId: pushDeviceForm && pushDeviceForm.installationId
			})
			.then(() => this.onUserSignedOut());
	};
	protected readonly _updateEmailSubscriptions = (token: string, preference: NotificationPreference) => {
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

	constructor(className: ClassValue, autoFocusInputs: boolean, props: P) {
		super(props);
		this._autoFocusInputs = autoFocusInputs;
		this._concreteClassName = className;

		// state
		this.state = {
			toasts: [],
			user: props.initialUser
		} as S;

		// clipboard
		this._clipboard = new ClipboardService(
			(content, intent) => {
				this._toaster.addToast(content, intent);
			}
		);

		// delegates
		this._readArticle = this.readArticle.bind(this);
		this._viewComments = this.viewComments.bind(this);
		this._viewProfile = this.viewProfile.bind(this);

		// routing
		this._createAbsoluteUrl = path => `${props.webServerEndpoint.protocol}://${props.webServerEndpoint.host}${path}`;

		// screens
		this._screenFactoryMap = {
			[ScreenKey.Admin]: createAdminPageScreenFactory(ScreenKey.Admin, {
				onCloseDialog: this._dialog.closeDialog,
				onGetBulkMailings: this.props.serverApi.getBulkMailings,
				onGetBulkMailingLists: this.props.serverApi.getBulkMailingLists,
				onGetKeyMetrics: this.props.serverApi.getKeyMetrics,
				onGetUserAccountCreations: this.props.serverApi.getUserAccountCreations,
				onGetUserStats: this.props.serverApi.getUserAccountStats,
				onOpenDialog: this._dialog.openDialog,
				onSendBulkMailing: this.props.serverApi.sendBulkMailing,
				onSendTestBulkMailing: this.props.serverApi.sendTestBulkMailing,
				onShowToast: this._toaster.addToast
			}),
			[ScreenKey.EmailConfirmation]: createEmailConfirmationScreenFactory(ScreenKey.EmailConfirmation),
			[ScreenKey.EmailSubscriptions]: createEmailSubscriptionsScreenFactory(ScreenKey.EmailSubscriptions, {
				onGetEmailSubscriptions: this.props.serverApi.getEmailSubscriptions,
				onUpdateEmailSubscriptions: this._updateEmailSubscriptions
			}),
			[ScreenKey.ExtensionRemoval]: createExtensionRemovalScreenFactory(ScreenKey.ExtensionRemoval, {
				onLogExtensionRemovalFeedback: this.props.serverApi.logExtensionRemovalFeedback
			}),
			[ScreenKey.Password]: createPasswordScreenFactory(ScreenKey.Password),
			[ScreenKey.PrivacyPolicy]: createPrivacyPolicyScreenFactory(ScreenKey.PrivacyPolicy),
			[ScreenKey.Settings]: createSettingsPageScreenFactory(ScreenKey.Settings, {
				onCloseDialog: this._dialog.closeDialog,
				onChangeEmailAddress: this._changeEmailAddress,
				onChangeNotificationPreference: this._changeNotificationPreference,
				onChangePassword: this._changePassword,
				onChangeTimeZone: this._changeTimeZone,
				onGetSettings: this.props.serverApi.getSettings,
				onGetTimeZones: this.props.serverApi.getTimeZones,
				onOpenDialog: this._dialog.openDialog,
				onRegisterNotificationPreferenceChangedEventHandler: this._registerNotificationPreferenceChangedEventHandler,
				onResendConfirmationEmail: this._resendConfirmationEmail,
				onSendPasswordCreationEmail: this._sendPasswordCreationEmail,
				onShowToast: this._toaster.addToast
			}),
			[ScreenKey.Stats]: createStatsScreenFactory(ScreenKey.Stats, {
				onGetReadingTimeStats: this.props.serverApi.getReadingTimeStats,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler
			})
		};
	}
	private setTimeZone() {
		return this._changeTimeZone({ name: DateTime.local().zoneName });
	}
	private setUserAuthChangedState(user: UserAccount | null, supplementaryState?: Partial<S>) {
		return new Promise<void>(
			resolve => {
				this.setState(
					{
						...supplementaryState as State,
						user
					},
					() => {
						this._eventManager.triggerEvent('authChanged', user);
						resolve();
					}
				);
			}
		);
	}
	protected fetchUpdateStatus(): Promise<{ isAvailable: boolean, version?: SemanticVersion }> {
		const
			now = Date.now(),
			lastCheck = localStorage.getItem('lastUpdateCheck');
		if (
			!lastCheck ||
			now - parseInt(lastCheck) >= 1 * 60 * 60 * 1000
		) {
			localStorage.setItem('lastUpdateCheck', now.toString());
			return fetch('/version')
				.then(res => {
					if (res.ok) {
						return res.text().then(versionString => {
							const version = new SemanticVersion(versionString);
							if (this.props.version.compareTo(version) < 0) {
								return {
									isAvailable: true,
									version
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
	protected createScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		const
			[path, queryString] = findRouteByKey(routes, key)
				.createUrl(urlParams)
				.split('?'),
			screen = this._screenFactoryMap[key].create(this._screenId++, { path, queryString }, this.getSharedState());
		if (title) {
			screen.title = title;
		}
		return screen;
	}
	protected getLocationDependentState(location: RouteLocation) {
		const
			route = findRouteByLocation(routes, location, unroutableQueryStringKeys),
			sharedState = this.getSharedState();
		return {
			dialog: route.dialogKey != null ?
				this._dialogCreatorMap[route.dialogKey](location, sharedState) :
				null,
			screen: this._screenFactoryMap[route.screenKey].create(this._screenId++, location, sharedState)
		};
	}
	protected abstract getPushDeviceForm(): PushDeviceForm | null;
	protected abstract getSharedState(): TSharedState;
	protected abstract getSignUpAnalyticsForm(action: string): SignUpAnalyticsForm;
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
	protected onLocationChanged(path: string, title?: string) { }
	protected onNotificationPreferenceChanged(preference: NotificationPreference) {
		this._eventManager.triggerEvent('notificationPreferenceChanged', preference);
	}
	protected onTitleChanged(title: string) { }
	protected onUserSignedIn(user: UserAccount, eventType: SignInEventType, supplementaryState?: Partial<S>) {
		return this.setUserAuthChangedState(user, supplementaryState);
	}
	protected onUserSignedOut(supplementaryState?: Partial<S>) {
		return this.setUserAuthChangedState(null, supplementaryState);
	}
	protected onUserUpdated(user: UserAccount) {
		this.setState({ user });
	}
	protected abstract readArticle(article: UserArticle, ev: React.MouseEvent): void;
	protected abstract reloadWindow(): void;
	protected abstract renderBody(): React.ReactNode;
	protected abstract viewComments(article: Pick<UserArticle, 'slug' | 'title'>, highlightedCommentId?: string): void;
	protected abstract viewProfile(userName?: string): void;
	public componentDidMount() {
		if (this.state.user && this.state.user.timeZoneId == null) {
			this.setTimeZone();
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className={classNames('root_9rc2fv', this._concreteClassName)}>
				<RootErrorBoundary onReloadWindow={this._reloadWindow}>
					{this.renderBody()}
					<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
				</RootErrorBoundary>
			</div>
		);
	}
}