import Fetchable from '../../../common/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import BulkMailing from '../../../common/models/BulkMailing';
import CommentThread from '../../../common/models/CommentThread';
import UserAccount from '../../../common/models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import HttpEndpoint from '../../../common/HttpEndpoint';
import PageResult from '../../../common/models/PageResult';
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
import ArticleQuery from '../../../common/models/articles/ArticleQuery';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import CommentsQuery from '../../../common/models/social/CommentsQuery';
import AuthServiceAccountForm from '../../../common/models/userAccounts/AuthServiceAccountForm';
import PasswordResetRequestForm from '../../../common/models/userAccounts/PasswordResetRequestForm';
import AppleIdCredentialAuthForm from '../../../common/models/app/AppleIdCredentialAuthForm';
import AppleIdCredentialAuthResponse from '../../../common/models/app/AppleIdCredentialAuthResponse';
import PublisherArticleQuery from '../../../common/models/articles/PublisherArticleQuery';
import ShareForm from '../../../common/models/analytics/ShareForm';
import OrientationAnalytics from '../../../common/models/analytics/OrientationAnalytics';

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
	public abstract getClientHeaderValue(): string;
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
	public readonly getUserAccount = (callback: (userAccount: Fetchable<UserAccount>) => void) => {
		return this.get<UserAccount>({ path: '/UserAccounts/GetUserAccount' }, callback);
	};
	public readonly signOut = (data: SignOutForm) => {
		return this.post<void>({ path: '/UserAccounts/SignOut', data });
	};
	public readonly starArticle = (articleId: number) => {
		return this.post<UserArticle>({ path: '/Articles/Star', data: { articleId } });
	};
	public readonly unstarArticle = (articleId: number) => {
		return this.post<UserArticle>({ path: '/Articles/Unstar', data: { articleId } });
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
	public readonly updateEmailSubscriptions = (token: string, preference: NotificationPreference) => {
		return this.post({ path: '/UserAccounts/UpdateEmailSubscriptions', data: { token, ...preference } });
	};
	public readonly getUserAccountStats = (callback: (state: Fetchable<UserAccountStats>) => void) => {
		return this.get<UserAccountStats>({ path: '/UserAccounts/Stats' }, callback);
	};

	// Analytics
	public readonly getKeyMetrics = this.createFetchFunctionWithParams<{ startDate: string, endDate: string }, KeyMetricsReportRow[]>('/Analytics/KeyMetrics');
	public readonly getUserAccountCreations = this.createFetchFunctionWithParams<{ startDate: string, endDate: string }, UserAccountCreation[]>('/Analytics/UserAccountCreations');
	public readonly logExtensionRemoval = (installationId: string) => this.post({ path: '/Extension/Uninstall', data: { installationId } });
	public readonly logExtensionRemovalFeedback = (data: { installationId: string, reason: string }) => this.post({ path: '/Extension/UninstallFeedback', data });
	public readonly logShareAnalytics = (data: ShareForm) => this.post({ path: '/Analytics/Share', data });
	public readonly logOrientationAnalytics = (data: OrientationAnalytics) => this.post({ path: '/Analytics/Orientation', data });

	// Articles
	public readonly getAotdHistory = this.createFetchFunctionWithParams<ArticleQuery, PageResult<UserArticle>>('/Articles/AotdHistory');
	public readonly getArticle = this.createFetchFunctionWithParams<{ slug: string }, UserArticle>('/Articles/Details');
	public readonly getCommunityReads = this.createFetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>('/Articles/CommunityReads');
	public readonly getPublisherArticles = this.createFetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>('/Articles/Publisher');
	public readonly getStarredArticles = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListStarred');
	public readonly getUserArticleHistory = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListHistory');
	public readonly rateArticle = (id: number, score: number) => this.post<{ article: UserArticle, rating: Rating }>({ path: '/Articles/Rate', data: { articleId: id, score } });

	// Auth
	public readonly authenticateAppleIdCredential = (data: AppleIdCredentialAuthForm) => this.post<AppleIdCredentialAuthResponse>({ path: '/Auth/AppleIos', data });

	// Extension
	public readonly sendExtensionInstructions = () => this.post({ path: '/Extension/SendInstructions' });

	// Notifications
	public readonly clearAlerts = (data: ClearAlertForm) => this.post({ path: '/Notifications/ClearAlerts', data });

	// Social
	public readonly deleteComment = (data: CommentDeletionForm) => this.post<CommentThread>({ path: '/Social/CommentDeletion', data });
	public readonly followUser = (data: UserNameForm) => this.post({ path: '/Social/Follow', data });
	public readonly getComments = this.createFetchFunctionWithParams<CommentsQuery, CommentThread[]>('/Social/Comments');
	public readonly getFollowees = this.createFetchFunction<Following[]>('/Social/Followees');
	public readonly getFollowers = this.createFetchFunctionWithParams<UserNameQuery, Following[]>('/Social/Followers');
	public readonly getPostsFromFollowees = this.createFetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>('/Social/FolloweesPosts');
	public readonly postArticle = (data: PostForm) => this.post<Post>({ path: '/Social/Post', data });
	public readonly postComment = (data: CommentForm) => this.post<{ article: UserArticle, comment: CommentThread }>({ path: '/Social/Comment', data });
	public readonly postCommentAddendum = (data: CommentAddendumForm) => this.post<CommentThread>({ path: '/Social/CommentAddendum', data });
	public readonly postCommentRevision = (data: CommentRevisionForm) => this.post<CommentThread>({ path: '/Social/CommentRevision', data });
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
	public readonly createAuthServiceAccount = (data: AuthServiceAccountForm) => this.post<UserAccount>({ path: '/UserAccounts/AuthServiceAccount', data });
	public readonly getSettings = this.createFetchFunction<Settings>('/UserAccounts/Settings');
	public readonly getTimeZones = this.createFetchFunction<TimeZoneSelectListItem[]>('/UserAccounts/TimeZones');
	public readonly requestPasswordReset = (data: PasswordResetRequestForm) => this.post({ path: '/UserAccounts/RequestPasswordReset', data });
	public readonly sendPasswordCreationEmail = () => this.post({ path: '/UserAccounts/PasswordCreationEmailDispatch' });
	public readonly signIn = (data: SignInForm) => this.post<UserAccount>({ path: '/UserAccounts/SignIn', data });
}