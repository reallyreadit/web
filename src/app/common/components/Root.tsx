import * as React from 'react';
import UserAccount from '../../../common/models/UserAccount';
import Captcha from '../Captcha';
import { Intent } from '../../../common/components/Toaster';
import ServerApi from '../serverApi/ServerApi';
import UserArticle from '../../../common/models/UserArticle';
import ResetPasswordDialog from './ResetPasswordDialog';
import { parseQueryString, clientTypeQueryStringKey, redirectedQueryStringKey } from '../../../common/routing/queryString';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import { findRouteByLocation, findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import RequestPasswordResetDialog from './RequestPasswordResetDialog';
import createAdminPageScreenFactory from './AdminPage';
import createSettingsPageScreenFactory from './SettingsPage';
import { createScreenFactory as createPrivacyPolicyScreenFactory } from './PrivacyPolicyPage';
import { createScreenFactory as createEmailConfirmationScreenFactory } from './EmailConfirmationPage';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import { createScreenFactory as createEmailSubscriptionsScreenFactory } from './EmailSubscriptionsPage';
import { DateTime } from 'luxon';
import AsyncTracker from '../../../common/AsyncTracker';
import classNames, { ClassValue } from 'classnames';
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

export interface Props {
	analytics: Analytics,
	captcha: Captcha,
	initialLocation: RouteLocation,
	initialUser: UserAccount | null,
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
	componentState?: T,
	key: ScreenKey,
	location: RouteLocation,
	templateSection?: TemplateSection,
	title?: string,
	titleContent?: React.ReactNode
}
export interface ScreenFactory<TSharedState> {
	create: (location: RouteLocation, sharedState: TSharedState) => Screen,
	render: (screenState: Screen, sharedState: TSharedState) => React.ReactNode,
	renderHeaderContent?: (screenState: Screen, sharedState: TSharedState) => React.ReactNode
}
export interface State extends ToasterState {
	dialog: React.ReactNode,
	screens: Screen[],
	user: UserAccount | null
}
export type SharedState = Pick<State, 'user'>;
export type SharedEvents = {
	'articleUpdated': ArticleUpdatedEvent,
	'authChanged': UserAccount | null,
	'commentPosted': CommentThread
};
export default abstract class Root<
	P extends Props,
	S extends State,
	TSharedState extends SharedState,
	TEvents extends SharedEvents
> extends React.Component<P, S> {
	private readonly _asyncTracker = new AsyncTracker();
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
				)
			});
	};

	// clipboard
	protected readonly _clipboard: ClipboardService;

	// comments
	protected readonly _postComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props.serverApi
			.postComment(text, articleId, parentCommentId)
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
	protected readonly _viewComments: (article: UserArticle) => void;

	// dialogs
	protected readonly _closeDialog = () => {
		this._openDialog(null);
	};
	protected readonly _dialogCreatorMap: { [P in DialogKey]: (location: RouteLocation) => React.ReactNode } = {
		[DialogKey.CreateAccount]: () => (
			<CreateAccountDialog
				captcha={this.props.captcha}
				onCreateAccount={this._createAccount}
				onCloseDialog={this._closeDialog}
				onShowToast={this._toaster.addToast}
			/>
		),
		[DialogKey.ResetPassword]: location => {
			const kvps = parseQueryString(location.queryString);
			return (
				<ResetPasswordDialog
					email={kvps['email']}
					onCloseDialog={this._closeDialog}
					onResetPassword={this._resetPassword}
					onShowToast={this._toaster.addToast}
					token={kvps['token']}
				/>
			);
		},
		[DialogKey.SignIn]: () => (
			<SignInDialog
				onCloseDialog={this._closeDialog}
				onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
				onShowToast={this._toaster.addToast}
				onSignIn={this._signIn}
			/>
		)
	};
	protected readonly _openRequestPasswordResetDialog = () => {
		this._openDialog(
			<RequestPasswordResetDialog
				captcha={this.props.captcha}
				onCloseDialog={this._closeDialog}
				onRequestPasswordReset={this.props.serverApi.requestPasswordReset}
				onShowToast={this._toaster.addToast}
			/>
		);
	};
	protected readonly _openDialog = (dialog: React.ReactNode) => {
		this.setState({ dialog });
	};

	// events
	protected readonly _eventManager = new EventManager<TEvents>();
	protected readonly _registerArticleChangeEventHandler = (handler: (event: ArticleUpdatedEvent) => void) => {
		return this._eventManager.addListener('articleUpdated', handler);
	};
	protected readonly _registerAuthChangedEventHandler = (handler: (user: UserAccount | null) => void) => {
		return this._eventManager.addListener('authChanged', handler);
	};
	protected readonly _registerCommentPostedEventHandler = (handler: (comment: CommentThread) => void) => {
		return this._eventManager.addListener('commentPosted', handler);
	};

	// routing
	protected readonly _createAbsoluteUrl: (path: string) => string;

	// screens
	protected _screenFactoryMap: Partial<{ [P in ScreenKey]: ScreenFactory<TSharedState> }>;

	// state
	protected readonly _setScreenState = (key: ScreenKey, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => {
		const screen = this.state.screens.find(screen => screen.key === key);
		if (screen) {
			const
				screens = this.state.screens.slice(),
				nextState = getNextState(screen);
			screens.splice(screens.indexOf(screen), 1, { ...screen, ...nextState });
			this.setState({ screens });
			if ('title' in nextState && nextState.title !== screen.title) {
				this.onTitleChanged(nextState.title);
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
	protected readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.props.serverApi
			.createUserAccount(name, email, password, captchaResponse, DateTime.local().zoneName)
			.then(user => {
				this.onUserSignedIn(user);
			});
	};
	protected readonly _resetPassword = (token: string, password: string) => {
		return this.props.serverApi
			.resetPassword(token, password)
			.then(user => {
				this.onUserSignedIn(user);
			});
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
	protected readonly _signIn = (email: string, password: string) => {
		return this.props.serverApi
			.signIn(email, password)
			.then(user => {
				if (user.timeZoneId == null) {
					this.setTimeZone();
				}
				this.onUserSignedIn(user);
			});
	};
	protected readonly _signOut = () => {
		return this.props.serverApi
			.signOut()
			.then(() => {
				this.onUserSignedOut();
			});
	};
	protected readonly _updateContactPreferences = (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => {
		return this.props.serverApi
			.updateContactPreferences(receiveWebsiteUpdates, receiveSuggestedReadings)
			.then(user => {
				this.onUserUpdated(user);
			});
	};
	protected readonly _updateEmailSubscriptions = (token: string, subscriptions: EmailSubscriptions) => {
		return this.props.serverApi
			.updateEmailSubscriptions(token, subscriptions)
			.then(() => {
				if (this.state.user) {
					this.props.serverApi.getUserAccount(user => {
						this.onUserUpdated(user.value);
					});
				}
			});
	};
	protected readonly _updateNotificationPreferences = (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => {
		return this.props.serverApi
			.updateNotificationPreferences(receiveEmailNotifications, receiveDesktopNotifications)
			.then(user => {
				this.onUserUpdated(user);
			});
	};

	// window
	protected readonly _reloadWindow = () => {
		this.reloadWindow();
	};

	constructor(className: ClassValue, props: P) {
		super(props);
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

		// routing
		this._createAbsoluteUrl = path => `${props.webServerEndpoint.protocol}://${props.webServerEndpoint.host}${path}`;

		// screens
		this._screenFactoryMap = {
			[ScreenKey.Admin]: createAdminPageScreenFactory(ScreenKey.Admin, {
				onCloseDialog: this._closeDialog,
				onGetBulkMailings: this.props.serverApi.getBulkMailings,
				onGetBulkMailingLists: this.props.serverApi.getBulkMailingLists,
				onGetKeyMetrics: this.props.serverApi.getKeyMetrics,
				onGetUserStats: this.props.serverApi.getUserAccountStats,
				onOpenDialog: this._openDialog,
				onSendBulkMailing: this.props.serverApi.sendBulkMailing,
				onSendTestBulkMailing: this.props.serverApi.sendTestBulkMailing,
				onShowToast: this._toaster.addToast
			}),
			[ScreenKey.EmailConfirmation]: createEmailConfirmationScreenFactory(ScreenKey.EmailConfirmation),
			[ScreenKey.EmailSubscriptions]: createEmailSubscriptionsScreenFactory(ScreenKey.EmailSubscriptions, {
				onGetEmailSubscriptions: this.props.serverApi.getEmailSubscriptions,
				onUpdateEmailSubscriptions: this._updateEmailSubscriptions
			}),
			[ScreenKey.Password]: createEmailConfirmationScreenFactory(ScreenKey.Password),
			[ScreenKey.PrivacyPolicy]: createPrivacyPolicyScreenFactory(ScreenKey.PrivacyPolicy),
			[ScreenKey.Settings]: createSettingsPageScreenFactory(ScreenKey.Settings, {
				onCloseDialog: this._closeDialog,
				onChangeEmailAddress: this._changeEmailAddress,
				onChangePassword: this._changePassword,
				onChangeTimeZone: this._changeTimeZone,
				onGetTimeZones: this.props.serverApi.getTimeZones,
				onOpenDialog: this._openDialog,
				onResendConfirmationEmail: this._resendConfirmationEmail,
				onShowToast: this._toaster.addToast,
				onUpdateContactPreferences: this._updateContactPreferences,
				onUpdateNotificationPreferences: this._updateNotificationPreferences
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
		this.setState(
			{
				...supplementaryState as State,
				user
			},
			() => {
				this._eventManager.triggerEvent('authChanged', user);
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
			screen = this._screenFactoryMap[key].create({ path, queryString }, this.getSharedState());
		if (title) {
			screen.title = title;
		}
		return screen;
	}
	protected getLocationDependentState(location: RouteLocation) {
		const route = findRouteByLocation(routes, location, [clientTypeQueryStringKey, redirectedQueryStringKey]);
		return {
			dialog: route.dialogKey != null ?
				this._dialogCreatorMap[route.dialogKey](location) :
				null,
			screen: this._screenFactoryMap[route.screenKey].create(location, this.getSharedState())
		};
	}
	protected abstract getSharedState(): TSharedState;
	protected onArticleUpdated(event: ArticleUpdatedEvent) {
		this._eventManager.triggerEvent('articleUpdated', event);
	}
	protected onCommentPosted(comment: CommentThread) {
		this._eventManager.triggerEvent('commentPosted', comment);
	}
	protected onTitleChanged(title: string) { }
	protected onUserSignedIn(user: UserAccount, supplementaryState?: Partial<S>) {
		this.setUserAuthChangedState(user, supplementaryState);
	}
	protected onUserSignedOut(supplementaryState?: Partial<S>) {
		this.setUserAuthChangedState(null, supplementaryState);
	}
	protected onUserUpdated(user: UserAccount) {
		this.setState({ user });
	}
	protected abstract readArticle(article: UserArticle, ev: React.MouseEvent): void;
	protected abstract reloadWindow(): void;
	protected abstract renderBody(): React.ReactNode;
	protected abstract viewComments(article: Pick<UserArticle, 'slug' | 'title'>): void;
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