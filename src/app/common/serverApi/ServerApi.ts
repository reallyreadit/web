import Fetchable from '../../../common/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import BulkMailing from '../../../common/models/BulkMailing';
import CommentThread from '../../../common/models/CommentThread';
import UserAccount from '../../../common/models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import HttpEndpoint from '../../../common/HttpEndpoint';
import NewReplyNotification from '../../../common/models/NewReplyNotification';
import PageResult from '../../../common/models/PageResult';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import CommunityReads from '../../../common/models/CommunityReads';
import TimeZoneSelectListItem from '../../../common/models/TimeZoneSelectListItem';
import UserAccountStats from '../../../common/models/UserAccountStats';
import UserStats from '../../../common/models/UserStats';
import Leaderboards from '../../../common/models/Leaderboards';
import CommunityReadSort from '../../../common/models/CommunityReadSort';
import Rating from '../../../common/models/Rating';
import ClientType from '../ClientType';
import CommunityReadTimeWindow from '../../../common/models/CommunityReadTimeWindow';
import KeyMetricsReportRow from '../../../common/models/KeyMetricsReportRow';
import ReadingTimeTotalsTimeWindow from '../../../common/models/ReadingTimeTotalsTimeWindow';
import ReadingTimeStats from '../../../common/models/ReadingTimeStats';

export type FetchFunction<TResult> = (callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
export type FetchFunctionWithParams<TParams, TResult> = (params: TParams, callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
export default abstract class {
	protected readonly _endpoint: HttpEndpoint;
	protected readonly _reqStore: RequestStore;
	protected readonly _clientType: ClientType;
	protected readonly _clientVersion: string;
	protected _isInitialized = false;
	constructor(endpoint: HttpEndpoint, requestStore: RequestStore, clientType: ClientType, clientVersion: string) {
		this._endpoint = endpoint;
		this._reqStore = requestStore;
		this._clientType = clientType;
		this._clientVersion = clientVersion;
	}
	private createFetchFunction<TResult>(path: string) {
		return (callback: (value: Fetchable<TResult>) => void) => this.get<TResult>({ path }, callback);
	}
	private createFetchFunctionWithParams<TParams, TResult>(path: string) {
		return (params: TParams, callback: (value: Fetchable<TResult>) => void) => this.get<TResult>({ path, data: params }, callback);
	}
	protected abstract get<T = void>(request: Request, callback: (data: Fetchable<T>) => void) : Fetchable<T>;
	protected abstract post<T = void>(request: Request) : Promise<T>;
	public readonly createUserAccount = (name: string, email: string, password: string, captchaResponse: string, timeZoneName: string) => {
		return this.post<UserAccount>({
			path: '/UserAccounts/CreateAccount',
			data: { name, email, password, captchaResponse, timeZoneName }
		});
	};
	public readonly resendConfirmationEmail = () => {
		return this.post({ path: '/UserAccounts/ResendConfirmationEmail' });
	};
	public readonly changePassword = (currentPassword: string, newPassword: string) => {
		return this.post({ path: '/UserAccounts/ChangePassword', data: { currentPassword, newPassword } });
	};
	public readonly resetPassword = (token: string, password: string) => {
		return this.post<UserAccount>({ path: '/UserAccounts/ResetPassword', data: { token, password } });
	};
	public readonly changeEmailAddress = (email: string) => {
		return this.post<UserAccount>({ path: '/UserAccounts/ChangeEmailAddress', data: { email } });
	};
	public readonly requestPasswordReset = (email: string, captchaResponse: string) => {
		return this.post({ path: '/UserAccounts/RequestPasswordReset', data: { email, captchaResponse } });
	};
	public readonly updateContactPreferences = (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => {
		return this.post<UserAccount>({
			path: '/UserAccounts/UpdateContactPreferences',
			data: { receiveWebsiteUpdates, receiveSuggestedReadings }
		});
	};
	public readonly updateNotificationPreferences = (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => {
		return this.post<UserAccount>({
			path: '/UserAccounts/UpdateNotificationPreferences',
			data: { receiveEmailNotifications, receiveDesktopNotifications }
		});
	};
	public readonly getUserAccount = (callback: (userAccount: Fetchable<UserAccount>) => void) => {
		return this.get<UserAccount>({ path: '/UserAccounts/GetUserAccount' }, callback);
	};
	public readonly signIn = (email: string, password: string) => {
		return this.post<UserAccount>({ path: '/UserAccounts/SignIn', data: { email, password } });
	};
	public readonly signOut = () => {
		return this.post<void>({ path: '/UserAccounts/SignOut' });
	};
	public readonly postComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.post<{ article: UserArticle, comment: CommentThread }>({ path: '/Articles/PostComment', data: { text, articleId, parentCommentId } });
	};
	public readonly readReply = (commentId: string) => {
		return this.post({ path: '/Articles/ReadReply', data: { commentId } });
	};
	public readonly starArticle = (articleId: number) => {
		return this.post<UserArticle>({ path: '/Articles/Star', data: { articleId } });
	};
	public readonly unstarArticle = (articleId: number) => {
		return this.post<UserArticle>({ path: '/Articles/Unstar', data: { articleId } });
	};
	public readonly listReplies = (pageNumber: number, callback: (comments: Fetchable<PageResult<CommentThread>>) => void) => {
		return this.get<PageResult<CommentThread>>({ path: '/Articles/ListReplies', data: { pageNumber } }, callback);
	};
	public readonly checkNewReplyNotification = (callback: (states: Fetchable<NewReplyNotification>) => void) => {
		return this.get<NewReplyNotification>({ path: '/UserAccounts/CheckNewReplyNotification' }, callback);
	};
	public readonly ackNewReply = () => {
		return this.post({ path: '/UserAccounts/AckNewReply' });
	};
	public readonly getBulkMailings = (callback: (mailings: Fetchable<BulkMailing[]>) => void) => {
		return this.get<BulkMailing[]>({ path: '/BulkMailings/List' }, callback);
	};
	public readonly getBulkMailingLists = (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => {
		return this.get<{ key: string, value: string }[]>({ path: '/BulkMailings/Lists' }, callback);
	};
	public readonly sendTestBulkMailing = (list: string, subject: string, body: string, emailAddress: string) => {
		return this.post({ path: '/BulkMailings/SendTest', data: { list, subject, body, emailAddress } });
	};
	public readonly sendBulkMailing = (list: string, subject: string, body: string) => {
		return this.post({ path: '/BulkMailings/Send', data: { list, subject, body } });
	};
	public readonly getEmailSubscriptions = (token: string, callback: (request: Fetchable<EmailSubscriptionsRequest>) => void) => {
		return this.get({ path: '/UserAccounts/EmailSubscriptions', data: { token } }, callback);
	};
	public readonly updateEmailSubscriptions = (token: string, subscriptions: EmailSubscriptions) => {
		return this.post({ path: '/UserAccounts/UpdateEmailSubscriptions', data: { token, ...subscriptions } });
	};
	public readonly getUserAccountStats = (callback: (state: Fetchable<UserAccountStats>) => void) => {
		return this.get<UserAccountStats>({ path: '/UserAccounts/Stats' }, callback);
	};

	// Analytics
	public readonly getKeyMetrics = this.createFetchFunctionWithParams<{ startDate: string, endDate: string }, KeyMetricsReportRow[]>('/Analytics/KeyMetrics');
	public readonly logExtensionRemoval = (installationId: string) => this.post({ path: '/Extension/Uninstall', data: { installationId } });
	public readonly logExtensionRemovalFeedback = (data: { installationId: string, reason: string }) => this.post({ path: '/Extension/UninstallFeedback', data });

	// Articles
	public readonly getArticle = this.createFetchFunctionWithParams<{ slug: string }, UserArticle>('/Articles/Details');
	public readonly getComments = this.createFetchFunctionWithParams<{ slug: string }, CommentThread[]>('/Articles/ListComments');
	public readonly getCommunityReads = this.createFetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>('/Articles/CommunityReads');
	public readonly getStarredArticles = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListStarred');
	public readonly getUserArticleHistory = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListHistory');
	public readonly rateArticle = (id: number, score: number) => this.post<{ article: UserArticle, rating: Rating }>({ path: '/Articles/Rate', data: { articleId: id, score } });

	// Extension
	public readonly sendExtensionInstructions = () => this.post({ path: '/Extension/SendInstructions' });

	// Stats
	public readonly getReadingTimeStats = this.createFetchFunctionWithParams<{ timeWindow: ReadingTimeTotalsTimeWindow }, ReadingTimeStats>('/Stats/ReadingTime');
	public readonly getLeaderboards = this.createFetchFunction<Leaderboards>('/Stats/Leaderboards');
	public readonly getUserStats = this.createFetchFunction<UserStats | null>('/Stats/UserStats');

	// UserAccounts
	public readonly changeTimeZone = (timeZone: { id?: number, name?: string }) => this.post<UserAccount>({ path: '/UserAccounts/ChangeTimeZone', data: timeZone });
	public readonly getTimeZones = this.createFetchFunction<TimeZoneSelectListItem[]>('/UserAccounts/TimeZones');
}