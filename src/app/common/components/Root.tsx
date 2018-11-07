import * as React from 'react';
import UserAccount from '../../../common/models/UserAccount';
import Captcha from '../Captcha';
import { Toast, Intent } from './Toaster';
import ServerApi from '../serverApi/ServerApi';
import Fetchable from '../serverApi/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import Comment from '../../../common/models/Comment';
import PageResult from '../../../common/models/PageResult';
import ResetPasswordDialog from './ResetPasswordDialog';
import { parseQueryString, createQueryString, clientTypeQueryStringKey } from '../../../common/routing/queryString';
import Location from '../../../common/routing/Location';
import { createScreenFactory as createStarredPageScreenFactory } from './StarredPage';
import ScreenKey from '../../../common/routing/ScreenKey';
import DialogKey from '../../../common/routing/DialogKey';
import { findRouteByLocation, findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import CreateAccountDialog from './CreateAccountDialog';
import SignInDialog from './SignInDialog';
import RequestPasswordResetDialog from './RequestPasswordResetDialog';
import { createScreenFactory as createAdminPageScreenFactory } from './AdminPage';
import ChallengeState from '../../../common/models/ChallengeState';
import { createScreenFactory as createHistoryScreenFactory } from './HistoryPage';
import { createScreenFactory as createInboxPageScreenFactory } from './InboxPage';
import { createScreenFactory as createPizzaPageScreenFactory } from './PizzaPage';
import { createScreenFactory as createSettingsPageScreenFactory } from './SettingsPage';
import { createScreenFactory as createPrivacyPolicyScreenFactory } from './PrivacyPolicyPage';
import { createScreenFactory as createArticlePageScreenFactory } from './ArticlePage';
import ShareArticleDialog from './ShareArticleDialog';
import { createScreenFactory as createEmailConfirmationScreenFactory } from './EmailConfirmationPage';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import { createScreenFactory as createEmailSubscriptionsScreenFactory } from './EmailSubscriptionsPage';
import { createScreenFactory as createLeaderboardsScreenFactory } from './LeaderboardsPage';

export interface RootChallengeState extends ChallengeState {
	isLoading: boolean
}
export interface Props {
	captcha: Captcha,
	initialChallengeState: ChallengeState,
	initialLocation: Location,
	initialUser: UserAccount | null,
	serverApi: ServerApi
}
export interface Screen {
	articleLists?: { [key: string]: Fetchable<PageResult<UserArticle>> },
	articles?: { [key: string]: Fetchable<UserArticle> },
	key: ScreenKey,
	location?: Location,
	title?: string
}
export interface ScreenFactory {
	create: (location: Location) => Screen,
	render: (state: Screen) => React.ReactNode
}
export interface State {
	challengeState: RootChallengeState,
	dialog: React.ReactNode,
	screens: Screen[],
	toasts: Toast[],
	user: UserAccount | null
}
export default abstract class <P extends Props = Props, S extends State = State> extends React.Component<P, S> {
	// articles
	protected readonly _readArticle: (article: UserArticle, ev: React.MouseEvent) => void;
	protected readonly _shareArticle = (article: UserArticle) => {

	};
	protected readonly _toggleArticleStar = (article: UserArticle) => {
		return (article.dateStarred ?
			this.props.serverApi.unstarArticle :
			this.props.serverApi.starArticle)(article.id);
	};

	// challenge
	protected readonly _startChallenge = (timeZoneId: number) => {
		this.props.serverApi
			.startChallenge(this.state.challengeState.activeChallenge.id, timeZoneId)
			.then(({ response, score }) => {
				this.setState({
					challengeState: {
						...(this.state.challengeState as RootChallengeState),
						latestResponse: response,
						score
					}
				});
			});
	};
	protected readonly _quitChallenge = () => {
		this.props.serverApi
			.quitChallenge(this.state.challengeState.activeChallenge.id)
			.then(latestResponse => {
				this.setState({
					challengeState: {
						...(this.state.challengeState as RootChallengeState),
						latestResponse,
						score: null
					}
				});
			});
	};

	// comments
	protected readonly _postComment = (text: string, articleId: number, parentCommentId?: number) => {
		return this.props.serverApi
			.postComment(text, articleId, parentCommentId)
			.then(comment => {
				ga('send', {
					hitType: 'event',
					eventCategory: 'Comment',
					eventAction: comment.parentCommentId ? 'reply' : 'post',
					eventLabel: comment.articleTitle,
					eventValue: comment.text.length
				});
				return comment;
			});
	};
	protected readonly _readReply = (comment: Comment) => {

	};
	protected readonly _viewComments: (article: UserArticle) => void;

	// dialogs
	protected readonly _closeDialog = () => {
		this._openDialog(null);
	};
	protected readonly _dialogCreatorMap: { [P in DialogKey]: (location: Location) => React.ReactNode } = {
		[DialogKey.CreateAccount]: () => (
			<CreateAccountDialog
				captcha={this.props.captcha}
				onCreateAccount={this._createAccount}
				onCloseDialog={this._closeDialog}
				onShowToast={this._addToast}
			/>
		),
		[DialogKey.ResetPassword]: location => {
			const kvps = parseQueryString(location.queryString);
			return (
				<ResetPasswordDialog
					email={decodeURIComponent(kvps['email'])}
					onCloseDialog={this._closeDialog}
					onResetPassword={this.props.serverApi.resetPassword}
					onShowToast={this._addToast}
					token={decodeURIComponent(kvps['token'])}
				/>
			);
		},
		[DialogKey.ShareArticle]: location => {
			const [, sourceSlug, articleSlug] = location.path.match(findRouteByKey(routes, ScreenKey.ArticleDetails).pathRegExp);
			return (
				<ShareArticleDialog
					captcha={this.props.captcha}
					onCloseDialog={this._closeDialog}
					onGetArticle={this.props.serverApi.getArticleDetails}
					onShareArticle={this.props.serverApi.shareArticle}
					onShowToast={this._addToast}
					slug={sourceSlug + '_' + articleSlug}
				/>
			);
		},
		[DialogKey.SignIn]: () => (
			<SignInDialog
				onCloseDialog={this._closeDialog}
				onOpenPasswordResetDialog={this._openRequestPasswordResetDialog}
				onShowToast={this._addToast}
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
				onShowToast={this._addToast}
			/>
		);
	};
	protected readonly _openDialog = (dialog: React.ReactNode) => {
		this.setState({ dialog });
	};

	// events
	protected readonly _articleChangeEventHandlers: ((updatedArticle: UserArticle) => void)[] = [];
	protected readonly _registerArticleChangeEventHandler = (handler: (updatedArticle: UserArticle) => void) => {
		return this.registerEventHandler(this._articleChangeEventHandlers, handler);
	};

	// screens
	protected _screenFactoryMap: Partial<{ [P in ScreenKey]: ScreenFactory }>;

	// state
	protected readonly _getChallengeState = () => {
		return this.state.challengeState;
	};
	protected readonly _setScreenState = (key: ScreenKey, state: Partial<Screen>) => {
		const screen = this.state.screens.find(screen => screen.key === key);
		if (screen) {
			const screens = this.state.screens.slice();
			screens.splice(screens.indexOf(screen), 1, { ...screen, ...state });
			this.setState({ screens });
			if ('title' in state && state.title !== screen.title) {
				this.onTitleChanged(state.title);
			}
		}
	};
	protected readonly _getUser = () => {
		return this.state.user;
	};

	// toasts
	protected readonly _addToast = (text: string, intent: Intent) => {
		const toast = {
			text,
			intent,
			timeoutHandle: window.setTimeout(() => {
				const toasts = this.state.toasts.slice();
				toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
				this.setState({ toasts });
			}, 5000),
			remove: false
		};
		this.setState({ toasts: [...this.state.toasts, toast] });
	};
	protected readonly _removeToast = (timeoutHandle: number) => {
		this.setState({
			toasts: this.state.toasts.filter(toast => toast.timeoutHandle !== timeoutHandle)
		});
	};

	// user account
	protected readonly _changeEmailAddress = (email: string) => {
		return this.props.serverApi
			.changeEmailAddress(email)
			.then(user => {
				this.setState({ user });
			});
	};
	protected readonly _changePassword = (currentPassword: string, newPassword: string) => {
		return this.props.serverApi.changePassword(currentPassword, newPassword);
	};
	protected readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.props.serverApi
			.createUserAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this._addToast('Welcome to reallyread.it!\nPlease check your email and confirm your address.', Intent.Success);
				ga('send', {
					hitType: 'event',
					eventCategory: 'UserAccount',
					eventAction: 'create',
					eventLabel: userAccount.name
				});
				this.onUserChanged(userAccount);
			});
	};
	protected readonly _deleteArticle = (article: UserArticle) => {

	};
	protected readonly _resendConfirmationEmail = () => {
		return this.props.serverApi
			.resendConfirmationEmail()
			.then(() => {
				this._addToast('Confirmation email sent', Intent.Success);
			})
			.catch((errors: string[]) => {
				this._addToast(
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
			.then(userAccount => {
				this.onUserChanged(userAccount);
			});
	};
	protected readonly _signOut = () => {
		return this.props.serverApi
			.signOut()
			.then(() => {
				this.onUserChanged(null);
			});
	};
	protected readonly _updateContactPreferences = (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => {
		return this.props.serverApi
			.updateContactPreferences(receiveWebsiteUpdates, receiveSuggestedReadings)
			.then(user => {
				this.setState({ user });
			});
	};
	protected readonly _updateEmailSubscriptions = (token: string, subscriptions: EmailSubscriptions) => {
		return this.props.serverApi
			.updateEmailSubscriptions(token, subscriptions)
			.then(() => {
				// TODO: if user is signed in update user
			});
	};
	protected readonly _updateNotificationPreferences = (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => {
		return this.props.serverApi
			.updateNotificationPreferences(receiveEmailNotifications, receiveDesktopNotifications)
			.then(user => {
				this.setState({ user });
			});
	};

	constructor(props: P) {
		super(props);

		// state
		this.state = {
			challengeState: { ...props.initialChallengeState, isLoading: false },
			toasts: [],
			user: props.initialUser
		} as S;

		// delegates
		this._readArticle = this.readArticle.bind(this);
		this._viewComments = this.viewComments.bind(this);

		// screens
		this._screenFactoryMap = {
			[ScreenKey.AdminPage]: createAdminPageScreenFactory(ScreenKey.AdminPage, {
				onCloseDialog: this._closeDialog,
				onGetChallengeState: this._getChallengeState,
				onGetBulkMailings: this.props.serverApi.getBulkMailings,
				onGetBulkMailingLists: this.props.serverApi.getBulkMailingLists,
				onGetChallengeResponseActionTotals: this.props.serverApi.getChallengeResponseActionTotals,
				onGetChallengeWinners: this.props.serverApi.getChallengeWinners,
				onGetUser: this._getUser,
				onGetUserStats: this.props.serverApi.getUserStats,
				onOpenDialog: this._openDialog,
				onSendBulkMailing: this.props.serverApi.sendBulkMailing,
				onSendTestBulkMailing: this.props.serverApi.sendTestBulkMailing,
				onShowToast: this._addToast
			}),
			[ScreenKey.ArticleDetails]: createArticlePageScreenFactory(ScreenKey.ArticleDetails, {
				onGetArticle: this.props.serverApi.getArticleDetails,
				onGetComments: this.props.serverApi.listComments,
				onGetUser: this._getUser,
				onPostComment: this._postComment,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar
			}),
			[ScreenKey.EmailConfirmation]: createEmailConfirmationScreenFactory(ScreenKey.EmailConfirmation),
			[ScreenKey.EmailSubscriptions]: createEmailSubscriptionsScreenFactory(ScreenKey.EmailSubscriptions, {
				onGetEmailSubscriptions: this.props.serverApi.getEmailSubscriptions,
				onUpdateEmailSubscriptions: this._updateEmailSubscriptions
			}),
			[ScreenKey.History]: createHistoryScreenFactory(ScreenKey.History, {
				onDeleteArticle: this._deleteArticle,
				onGetUserArticleHistory: this.props.serverApi.listUserArticleHistory,
				onGetUser: this._getUser,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			}),
			[ScreenKey.Inbox]: createInboxPageScreenFactory(ScreenKey.Inbox, {
				onGetReplies: this.props.serverApi.listReplies,
				onReadReply: this._readReply
			}),
			[ScreenKey.Leaderboards]: createLeaderboardsScreenFactory(ScreenKey.Leaderboards, {
				onGetWeeklyReadingLeaderboards: this.props.serverApi.getWeeklyReadingLeaderboards,
				onGetWeeklyReadingStats: this.props.serverApi.getWeeklyReadingStats
			}),
			[ScreenKey.Password]: createEmailConfirmationScreenFactory(ScreenKey.Password),
			[ScreenKey.PizzaChallenge]: createPizzaPageScreenFactory(ScreenKey.PizzaChallenge, {
				onGetChallengeLeaderboard: this.props.serverApi.getChallengeLeaderboard,
				onGetChallengeState: this._getChallengeState,
				onGetTimeZones: this.props.serverApi.getTimeZones,
				onGetUser: this._getUser,
				onQuitChallenge: this._quitChallenge,
				onStartChallenge: this._startChallenge
			}),
			[ScreenKey.PrivacyPolicy]: createPrivacyPolicyScreenFactory(ScreenKey.PrivacyPolicy),
			[ScreenKey.Settings]: createSettingsPageScreenFactory(ScreenKey.Settings, {
				onCloseDialog: this._closeDialog,
				onChangeEmailAddress: this._changeEmailAddress,
				onChangePassword: this._changePassword,
				onGetUser: this._getUser,
				onOpenDialog: this._openDialog,
				onResendConfirmationEmail: this._resendConfirmationEmail,
				onShowToast: this._addToast,
				onUpdateContactPreferences: this._updateContactPreferences,
				onUpdateNotificationPreferences: this._updateNotificationPreferences
			}),
			[ScreenKey.Starred]: createStarredPageScreenFactory(ScreenKey.Starred, {
				onGetStarredArticles: this.props.serverApi.listStarredArticles,
				onGetUser: this._getUser,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			})
		};
	}
	protected clearQueryStringKvps(keys?: string[]) {
		const
			qsKvps = parseQueryString(window.location.search),
			qsKeys = Object.keys(qsKvps);
		if (!keys) {
			keys = qsKeys;
		}
		window.history.replaceState(
			null,
			window.document.title,
			window.location.pathname + createQueryString(
				qsKeys
					.filter(key => !keys.includes(key))
					.reduce((result, key) => {
						result[key] = qsKvps[key];
						return result;
					}, {} as { [key: string]: string })
			)
		);
	}
	protected createScreen(key: ScreenKey, urlParams?: { [key: string]: string }, title?: string) {
		const
			url = findRouteByKey(routes, key).createUrl(urlParams),
			[path, queryString] = url.split('?'),
			screen = this._screenFactoryMap[key].create({ path, queryString });
		if (title) {
			screen.title = title;
		}
		return { screen, url };
	}
	protected getLocationDependentState(location: Location) {
		const route = findRouteByLocation(routes, location, [clientTypeQueryStringKey]);
		return {
			dialog: route.dialogKey ?
				this._dialogCreatorMap[route.dialogKey](location) :
				null,
			screen: this._screenFactoryMap[route.screenKey].create(location)
		};
	}
	protected onTitleChanged(title: string) { }
	protected onUserChanged(userAccount: UserAccount | null) { }
	protected readArticle(article: UserArticle, ev: React.MouseEvent) { }
	protected registerEventHandler<T>(handlers: T[], handler: T) {
		handlers.push(handler);
		return () => {
			handlers.splice(handlers.indexOf(handler), 1);
		};
	}
	protected viewComments(article: UserArticle) { }
	public componentWillUnmount() {
		this.state.toasts.forEach(toast => window.clearTimeout(toast.timeoutHandle));
	}
}