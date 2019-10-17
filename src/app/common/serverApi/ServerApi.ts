import Fetchable from '../../../common/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import BulkMailing from '../../../common/models/BulkMailing';
import CommentThread from '../../../common/models/CommentThread';
import UserAccount from '../../../common/models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import HttpEndpoint from '../../../common/HttpEndpoint';
import PageResult from '../../../common/models/PageResult';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import CommunityReads from '../../../common/models/CommunityReads';
import TimeZoneSelectListItem from '../../../common/models/TimeZoneSelectListItem';
import UserAccountStats from '../../../common/models/UserAccountStats';
import Leaderboards from '../../../common/models/Leaderboards';
import CommunityReadSort from '../../../common/models/CommunityReadSort';
import Rating from '../../../common/models/Rating';
import ClientType from '../ClientType';
import CommunityReadTimeWindow from '../../../common/models/CommunityReadTimeWindow';
import KeyMetricsReportRow from '../../../common/models/KeyMetricsReportRow';
import ReadingTimeTotalsTimeWindow from '../../../common/models/ReadingTimeTotalsTimeWindow';
import ReadingTimeStats from '../../../common/models/ReadingTimeStats';
import UserAccountCreation from '../../../common/models/UserAccountCreation';
import UserNameForm from '../../../common/models/social/UserNameForm';
import PostForm from '../../../common/models/social/PostForm';
import Post from '../../../common/models/social/Post';
import UserPostsQuery from '../../../common/models/social/UserPostsQuery';
import UserNameQuery from '../../../common/models/social/UserNameQuery';
import Profile from '../../../common/models/social/Profile';
import Following from '../../../common/models/social/Following';
import FolloweesPostsQuery from '../../../common/models/social/FolloweesPostsQuery';
import Settings from '../../../common/models/Settings';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import InboxPostsQuery from '../../../common/models/social/InboxPostsQuery';
import ClearAlertForm from '../../../common/models/notifications/ClearAlertForm';
import PasswordResetForm from '../../../common/models/userAccounts/PasswordResetForm';
import UserAccountForm from '../../../common/models/userAccounts/UserAccountForm';
import SignInForm from '../../../common/models/userAccounts/SignInForm';
import SignOutForm from '../../../common/models/userAccounts/SignOutForm';

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
	public readonly createUserAccount = (data: UserAccountForm) => {
		return this.post<UserAccount>({ path: '/UserAccounts/CreateAccount', data });
	};
	public readonly resendConfirmationEmail = () => {
		return this.post({ path: '/UserAccounts/ResendConfirmationEmail' });
	};
	public readonly changePassword = (currentPassword: string, newPassword: string) => {
		return this.post({ path: '/UserAccounts/ChangePassword', data: { currentPassword, newPassword } });
	};
	public readonly resetPassword = (data: PasswordResetForm) => {
		return this.post<UserAccount>({ path: '/UserAccounts/ResetPassword', data });
	};
	public readonly changeEmailAddress = (email: string) => {
		return this.post<UserAccount>({ path: '/UserAccounts/ChangeEmailAddress', data: { email } });
	};
	public readonly requestPasswordReset = (email: string, captchaResponse: string) => {
		return this.post({ path: '/UserAccounts/RequestPasswordReset', data: { email, captchaResponse } });
	};
	public readonly getUserAccount = (callback: (userAccount: Fetchable<UserAccount>) => void) => {
		return this.get<UserAccount>({ path: '/UserAccounts/GetUserAccount' }, callback);
	};
	public readonly signIn = (data: SignInForm) => {
		return this.post<UserAccount>({ path: '/UserAccounts/SignIn', data });
	};
	public readonly signOut = (data: SignOutForm) => {
		return this.post<void>({ path: '/UserAccounts/SignOut', data });
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
	public readonly getUserAccountCreations = this.createFetchFunctionWithParams<{ startDate: string, endDate: string }, UserAccountCreation[]>('/Analytics/UserAccountCreations');
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

	// Notifications
	public readonly clearAlerts = (data: ClearAlertForm) => this.post({ path: '/Notifications/ClearAlerts', data });

	// Social
	public readonly followUser = (data : UserNameForm) => this.post({ path: '/Social/Follow', data });
	public readonly getFollowees = this.createFetchFunction<Following[]>('/Social/Followees');
	public readonly getFollowers = this.createFetchFunctionWithParams<UserNameQuery, Following[]>('/Social/Followers');
	public readonly postArticle = (data: PostForm) => this.post<Post>({ path: '/Social/Post', data });
	public readonly getPostsFromFollowees = this.createFetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>('/Social/FolloweesPosts');
	public readonly getPostsFromInbox = this.createFetchFunctionWithParams<InboxPostsQuery, PageResult<Post>>('/Social/InboxPosts');
	public readonly getPostsFromUser = this.createFetchFunctionWithParams<UserPostsQuery, PageResult<Post>>('/Social/UserPosts');
	public readonly getProfile = this.createFetchFunctionWithParams<UserNameQuery, Profile>('/Social/Profile');
	public readonly unfollowUser = (data: UserNameForm) => this.post({ path: '/Social/Unfollow', data });

	// Stats
	public readonly getReadingTimeStats = this.createFetchFunctionWithParams<{ timeWindow: ReadingTimeTotalsTimeWindow }, ReadingTimeStats>('/Stats/ReadingTime');
	public readonly getLeaderboards = this.createFetchFunction<Leaderboards>('/Stats/Leaderboards');
	public readonly getUserCount = this.createFetchFunction<{ userCount: number }>('/Stats/UserCount');

	// UserAccounts
	public readonly changeNotificationPreference = (data: NotificationPreference) => this.post<NotificationPreference>({ path: '/UserAccounts/NotificationPreference', data });
	public readonly changeTimeZone = (timeZone: { id?: number, name?: string }) => this.post<UserAccount>({ path: '/UserAccounts/ChangeTimeZone', data: timeZone });
	public readonly getSettings = this.createFetchFunction<Settings>('/UserAccounts/Settings');
	public readonly getTimeZones = this.createFetchFunction<TimeZoneSelectListItem[]>('/UserAccounts/TimeZones');
}