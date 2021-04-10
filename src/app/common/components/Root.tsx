import * as React from 'react';
import UserAccount, { hasAnyAlerts } from '../../../common/models/UserAccount';
import CaptchaBase from '../../../common/captcha/CaptchaBase';
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
import { createScreenFactory as createPrivacyPolicyScreenFactory } from './PrivacyPolicyPage';
import { createScreenFactory as createEmailConfirmationScreenFactory } from './EmailConfirmationPage';
import { createScreenFactory as createPasswordScreenFactory } from './PasswordPage';
import { createScreenFactory as createFaqScreenFactory } from './FaqPage';
import { createScreenFactory as createMissionScreenFactory } from './MissionPage';
import { createScreenFactory as createEmailSubscriptionsScreenFactory } from './EmailSubscriptionsPage';
import { DateTime } from 'luxon';
import AsyncTracker from '../../../common/AsyncTracker';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import RootErrorBoundary from './RootErrorBoundary';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
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
import DialogService, { DialogServiceState } from '../../../common/services/DialogService';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import Alert from '../../../common/models/notifications/Alert';
import FolloweeCountChange from '../../../common/models/social/FolloweeCountChange';
import PushDeviceForm from '../../../common/models/userAccounts/PushDeviceForm';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import { Form as CreateAccountDialogForm } from './CreateAccountDialog';
import { Form as CreateAuthServiceAccountDialogForm } from './CreateAuthServiceAccountDialog';
import SignInDialog, { Form as SignInDialogForm } from './SignInDialog';
import SignUpAnalyticsForm from '../../../common/models/analytics/SignUpAnalyticsForm';
import SignInEventType from '../../../common/models/userAccounts/SignInEventType';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import DisplayPreference, { getClientPreferredColorScheme, DisplayTheme, getClientDefaultDisplayPreference } from '../../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import EventSource from '../EventSource';
import Fetchable from '../../../common/Fetchable';
import Settings from '../../../common/models/Settings';
import { SubscriptionStatus, ActiveSubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import { SubscriptionDistributionSummaryResponse } from '../../../common/models/subscriptions/SubscriptionDistributionSummaryResponse';
import Lazy from '../../../common/Lazy';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { StripePaymentResponse, StripePaymentResponseType } from '../../../common/models/subscriptions/StripePaymentResponse';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { SubscriptionPriceSelection, isStandardSubscriptionPriceLevel } from '../../../common/models/subscriptions/SubscriptionPrice';
import { StripeSubscriptionPaymentRequest } from '../../../common/models/subscriptions/StripeSubscriptionPaymentRequest';
import StripeSubscriptionPrompt from './StripeSubscriptionPrompt';
import StripePaymentConfirmationDialog from './StripePaymentConfirmationDialog';
import StripeAutoRenewDialog from './StripeAutoRenewDialog';
import { StripeAutoRenewStatusRequest } from '../../../common/models/subscriptions/StripeAutoRenewStatusRequest';
import StripePriceChangeDialog from './StripePriceChangeDialog';
import NewPlatformNotificationRequestDialog from './BrowserRoot/NewPlatformNotificationRequestDialog';
import { SubscriptionPaymentMethodUpdateRequest } from '../../../common/models/subscriptions/SubscriptionPaymentMethod';

export interface Props {
	captcha: CaptchaBase,
	initialLocation: RouteLocation,
	initialUserProfile: WebAppUserProfile | null,
	serverApi: ServerApi,
	staticServerEndpoint: HttpEndpoint,
	stripeLoader: Lazy<Promise<Stripe>>,
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
		displayTheme: DisplayTheme | null,
		screens: Screen[],
		subscriptionStatus: SubscriptionStatus,
		user: UserAccount | null
	} &
	ToasterState &
	DialogServiceState
);
export type SharedState = Pick<State, 'displayTheme' | 'subscriptionStatus' | 'user'>;
export type Events = {
	'articleUpdated': ArticleUpdatedEvent,
	'articlePosted': Post,
	'authChanged': UserAccount | null,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'followeeCountChanged': FolloweeCountChange,
	'notificationPreferenceChanged': NotificationPreference
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
	protected readonly _readArticle: (article: UserArticle, ev?: React.MouseEvent<HTMLAnchorElement>) => void;
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
	protected readonly _viewThread = (comment: Pick<CommentThread, 'articleSlug' | 'id'>) => {
		this.viewComments(
			{
				slug: comment.articleSlug
			},
			comment.id
		);
	};

	// dialogs
	protected readonly _dialog = new DialogService<TSharedState>({
		setState: (delegate, callback) => {
			this.setState(delegate, callback);
		}
	});
	protected _dialogCreatorMap: Partial<{ [P in DialogKey]: (location: RouteLocation, sharedState: TSharedState) => React.ReactNode }> = {
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
	protected readonly _clearAlerts = (alerts: Alert) => {
		if (!hasAnyAlerts(this.state.user, alerts)) {
			return;
		}
		let newUser = {
			...this.state.user
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
			alerts
		});
		this.onUserUpdated(newUser, EventSource.Local);
	};

	// routing
	protected readonly _createAbsoluteUrl: (path: string) => string;
	protected readonly _createStaticContentUrl = (path: string) => createUrl(this.props.staticServerEndpoint, path);

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

	// subscriptions
	private readonly _changeStripeSubscriptionPrice = (price: SubscriptionPriceSelection) => this.props.serverApi
		.changeStripeSubscriptionPrice(
			isStandardSubscriptionPriceLevel(price) ?
				({
					priceLevelId: price.id
				}) :
				({
					customPriceAmount: price.amount
				})
		)
		.then(this._handleSubscriptionPaymentResponse);
	protected readonly _changeSubscriptionPaymentMethod = (card: StripeCardElement) => this.props.serverApi
		.createStripeSetupIntent()
		.then(
			response => this.props.stripeLoader.value.then(
				stripe => stripe.confirmCardSetup(
					response.clientSecret,
					{
						payment_method: {
							card
						}
					}
				)
			)
		)
		.then(
			result => {
				if (!result.setupIntent) {
					throw result.error;
				}
				return this.props.serverApi.changeSubscriptionPaymentMethod({
					paymentMethodId: result.setupIntent.payment_method
				});
			}
		);
	private readonly _completeStripeSubscriptionUpgrade = (card: StripeCardElement, price: SubscriptionPriceSelection) => this._processStripeSubscriptionPayment(
		card,
		price,
		request => this.props.serverApi.completeStripeSubscriptionUpgrade(request)
	);
	private readonly _confirmSubscriptionCardPayment: ((invoiceId: string, clientSecret?: string) => Promise<StripePaymentResponse>) = (invoiceId, clientSecret) => {
		let clientConfirmation: Promise<any>;
		if (clientSecret) {
			clientConfirmation = this.props.stripeLoader.value.then(
				stripe => stripe.confirmCardPayment(clientSecret)
			);
		} else {
			clientConfirmation = Promise.resolve();
		}
		return clientConfirmation.then(
			() => this.props.serverApi
				.confirmStripeSubscriptionPayment({
					invoiceId
				})
				.then(this._handleSubscriptionPaymentResponse)
		);
	};
	private readonly _createStripeSubscription = (card: StripeCardElement, price: SubscriptionPriceSelection) => this._processStripeSubscriptionPayment(
		card,
		price,
		request => this.props.serverApi.createStripeSubscription(request)
	);
	private readonly _handleSubscriptionPaymentResponse = (response: StripePaymentResponse) => {
		this.onSubscriptionStatusChanged(response.subscriptionStatus, EventSource.Local);
		if (response.type === StripePaymentResponseType.RequiresConfirmation) {
			return this._confirmSubscriptionCardPayment(response.invoiceId, response.clientSecret);
		}
		return response;
	};
	protected readonly _getSubscriptionDistributionSummary = (callback: (result: Fetchable<SubscriptionDistributionSummaryResponse>) => void) => {
		return this.props.serverApi.getSubscriptionDistributionSummary(
			summary => {
				if (summary.value) {
					this.onSubscriptionStatusChanged(summary.value.subscriptionStatus, EventSource.Local);
				}
				callback(summary);
			}
		);
	}
	protected readonly _getSubscriptionStatus = (callback: (response: Fetchable<SubscriptionStatusResponse>) => void) => this.props.serverApi.getSubscriptionStatus(
		response => {
			if (response.value) {
				this.onSubscriptionStatusChanged(response.value.status, EventSource.Local);
			}
			callback(response);
		}
	);
	protected readonly _openStripeAutoRenewDialog = (currentStatus: ActiveSubscriptionStatus) => new Promise<void>(
		resolve => {
			const
				close = () => {
					this._dialog.closeDialog();
					resolve();
				},
				setAutoRenewStatus = (request: StripeAutoRenewStatusRequest) => this.props.serverApi
					.setStripeSubscriptionAutoRenewStatus(request)
					.then(
						response => {
							this.onSubscriptionStatusChanged(response.status, EventSource.Local);
							return response;
						}
					);
			this._dialog.openDialog(
				() => (
					<StripeAutoRenewDialog
						currentStatus={currentStatus}
						onClose={close}
						onSetStripeSubscriptionAutoRenewStatus={setAutoRenewStatus}
						onShowToast={this._toaster.addToast}
					/>
				)
			);
		}
	);
	protected readonly _openStripePaymentConfirmationDialog = (invoiceId: string) => {
		this._dialog.openDialog(
			() => (
				<StripePaymentConfirmationDialog
					invoiceId={invoiceId}
					onClose={this._dialog.closeDialog}
					onGetSubscriptionStatus={this._getSubscriptionStatus}
					onShowToast={this._toaster.addToast}
					onConfirmPayment={this._confirmSubscriptionCardPayment}
				/>
			)
		);
	};
	protected readonly _openStripePriceChangeDialog = (activeSubscription: ActiveSubscriptionStatus) => {
		this._dialog.openDialog(
			sharedState => (
				<StripePriceChangeDialog
					activeSubscription={activeSubscription}
					displayTheme={sharedState.displayTheme}
					onChangePrice={this._changeStripeSubscriptionPrice}
					onClose={this._dialog.closeDialog}
					onCompleteUpgrade={this._completeStripeSubscriptionUpgrade}
					onCreateStaticContentUrl={this._createStaticContentUrl}
					onGetSubscriptionPriceLevels={this.props.serverApi.getSubscriptionPriceLevels}
					onGetSubscriptionStatus={this._getSubscriptionStatus}
					onOpenStripeSubscriptionPrompt={this._openStripeSubscriptionPromptDialog}
					onShowToast={this._toaster.addToast}
					stripe={this.props.stripeLoader.value}
				/>
			)
		);
	};
	protected readonly _openStripeSubscriptionPromptDialog = (article?: UserArticle) => {
		this._dialog.openDialog(
			sharedState => (
				<StripeSubscriptionPrompt
					article={article}
					displayTheme={sharedState.displayTheme}
					onClose={this._dialog.closeDialog}
					onCreateStaticContentUrl={this._createStaticContentUrl}
					onGetSubscriptionPriceLevels={this.props.serverApi.getSubscriptionPriceLevels}
					onGetSubscriptionStatus={this._getSubscriptionStatus}
					onReadArticle={this._readArticle}
					onShowToast={this._toaster.addToast}
					onSubscribe={this._createStripeSubscription}
					stripe={this.props.stripeLoader.value}
					subscriptionStatus={sharedState.subscriptionStatus}
				/>
			)
		);
	};
	private readonly _processStripeSubscriptionPayment = (
		card: StripeCardElement,
		price: SubscriptionPriceSelection,
		submit: (request: StripeSubscriptionPaymentRequest) => Promise<StripePaymentResponse>
	) => this.props.stripeLoader.value
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
				let request: StripeSubscriptionPaymentRequest;
				if (
					isStandardSubscriptionPriceLevel(price)
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
				return submit(request)
					.then(this._handleSubscriptionPaymentResponse);
			}
		);
	protected readonly _updateSubscriptionPaymentMethod = (request: SubscriptionPaymentMethodUpdateRequest) =>
		this.props.serverApi.updateSubscriptionPaymentMethod(request);

	// toasts
	protected readonly _toaster = new ToasterService({
		asyncTracker: this._asyncTracker,
		setState: (state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
			this.setState(state);
		}
	});

	// user account
	protected readonly _changeDisplayPreference = (preference: DisplayPreference) => {
		this.onDisplayPreferenceChanged(preference, EventSource.Local);
		return this.props.serverApi.changeDisplayPreference(preference);
	};
	protected readonly _changeEmailAddress = (email: string) => {
		return this.props.serverApi
			.changeEmailAddress(email)
			.then(user => {
				this.onUserUpdated(user, EventSource.Local);
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
				pushDevice: this.getPushDeviceForm()
			})
			.then(
				profile => {
					this.onUserSignedIn(profile, SignInEventType.NewUser, EventSource.Local);
				}
			);
	};
	protected readonly _createAuthServiceAccount = (form: CreateAuthServiceAccountDialogForm) => {
		return this.props.serverApi
			.createAuthServiceAccount({
				...form,
				timeZoneName: DateTime.local().zoneName,
				theme: getClientPreferredColorScheme(),
				pushDevice: this.getPushDeviceForm()
			})
			.then(
				profile => {
					this.onUserSignedIn(profile, SignInEventType.NewUser, EventSource.Local);
				}
			);
	};
	protected readonly _getSettings = (callback: (result: Fetchable<Settings>) => void) => {
		return this.props.serverApi.getSettings(
			settings => {
				if (settings.value) {
					this.onDisplayPreferenceChanged(settings.value.displayPreference, EventSource.Local);
					this.onSubscriptionStatusChanged(settings.value.subscriptionStatus, EventSource.Local);
				}
				callback(settings);
			}
		);
	}
	protected abstract readonly _linkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<AuthServiceAccountAssociation>;
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
			.then(
				profile => {
					return this.onUserSignedIn(profile, SignInEventType.ExistingUser, EventSource.Local);
				}
			);
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

	constructor(className: ClassValue, autoFocusInputs: boolean, props: TProps) {
		super(props);
		this._autoFocusInputs = autoFocusInputs;
		this._concreteClassName = className;

		// state
		this.state = {
			displayTheme: props.initialUserProfile?.displayPreference?.theme,
			toasts: [],
			subscriptionStatus: props.initialUserProfile?.subscriptionStatus,
			user: props.initialUserProfile?.userAccount
		} as TState;

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
				onGetArticleIssueReports: this.props.serverApi.getArticleIssueReportAnalytics,
				onGetBulkMailings: this.props.serverApi.getBulkMailings,
				onGetBulkMailingLists: this.props.serverApi.getBulkMailingLists,
				onGetConversions: this.props.serverApi.getConversionAnalytics,
				onGetDailyTotals: this.props.serverApi.getDailyTotalAnalytics,
				onGetSignups: this.props.serverApi.getSignupAnalytics,
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
			[ScreenKey.Faq]: createFaqScreenFactory(ScreenKey.Faq, {
				onOpenNewPlatformNotificationRequestDialog: this._openNewPlatformNotificationRequestDialog
			}),
			[ScreenKey.Mission]: createMissionScreenFactory(ScreenKey.Mission),
			[ScreenKey.Password]: createPasswordScreenFactory(ScreenKey.Password),
			[ScreenKey.PrivacyPolicy]: createPrivacyPolicyScreenFactory(ScreenKey.PrivacyPolicy),
			[ScreenKey.Stats]: createStatsScreenFactory(ScreenKey.Stats, {
				onGetReadingTimeStats: this.props.serverApi.getReadingTimeStats,
				onRegisterArticleChangeHandler: this._registerArticleChangeEventHandler
			})
		};
	}
	private checkProfileForUnsetValues(profile: WebAppUserProfile) {
		if (profile.userAccount.timeZoneId == null) {
			this._changeTimeZone({
				name: DateTime
					.local()
					.zoneName
			});
		}
		if (profile.displayPreference == null) {
			this._changeDisplayPreference(
				getClientDefaultDisplayPreference()
			);
		}
	}
	private setThemeAttribute(theme: DisplayTheme | null) {
		document.documentElement.dataset['com_readup_theme'] = (
			theme != null ?
				theme === DisplayTheme.Dark ?
					'dark' :
					'light' :
				''
		);
		window.dispatchEvent(
			new CustomEvent(
				'com.readup.themechange',
				{
					detail: theme
				}
			)
		);
	}
	private setUserAuthChangedState(userProfile: WebAppUserProfile | null, supplementaryState?: Partial<TState>) {
		this.setThemeAttribute(userProfile?.displayPreference?.theme);
		return new Promise<void>(
			resolve => {
				this.setState(
					{
						...supplementaryState as State,
						displayTheme: userProfile?.displayPreference.theme,
						subscriptionStatus: userProfile?.subscriptionStatus,
						user: userProfile?.userAccount
					},
					() => {
						this._eventManager.triggerEvent('authChanged', userProfile?.userAccount);
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
	protected onDisplayPreferenceChanged(preference: DisplayPreference, eventSource: EventSource) {
		this.setThemeAttribute(preference.theme);
		this.setState({
			displayTheme: preference.theme
		});
	}
	protected onLocationChanged(path: string, title?: string) { }
	protected onNotificationPreferenceChanged(preference: NotificationPreference) {
		this._eventManager.triggerEvent('notificationPreferenceChanged', preference);
	}
	protected onSubscriptionStatusChanged(status: SubscriptionStatus, eventSource: EventSource) {
		this.setState({
			subscriptionStatus: status
		});
	}
	protected onTitleChanged(title: string) { }
	protected onUserSignedIn(userProfile: WebAppUserProfile, eventType: SignInEventType, eventSource: EventSource, supplementaryState?: Partial<TState>) {
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
	protected onUserUpdated(user: UserAccount, eventSource: EventSource, supplementaryState?: Partial<TState>) {
		this.setState({
			...supplementaryState as State,
			user
		});
	}
	protected abstract readArticle(article: UserArticle, ev?: React.MouseEvent<HTMLAnchorElement>): void;
	protected abstract reloadWindow(): void;
	protected abstract renderBody(): React.ReactNode;
	protected abstract viewComments(article: Pick<UserArticle, 'slug'>, highlightedCommentId?: string): void;
	protected abstract viewProfile(userName?: string): void;
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
				<RootErrorBoundary onReloadWindow={this._reloadWindow}>
					{this.renderBody()}
					<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
				</RootErrorBoundary>
			</div>
		);
	}
}