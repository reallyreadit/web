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
import Rating from '../../../common/models/Rating';
import ClientType from '../ClientType';
import DailyTotalsReportRow from '../../../common/models/analytics/DailyTotalsReportRow';
import ReadingTimeTotalsTimeWindow from '../../../common/models/stats/ReadingTimeTotalsTimeWindow';
import ReadingTimeStats from '../../../common/models/ReadingTimeStats';
import SignupsReportRow from '../../../common/models/analytics/SignupsReportRow';
import UserNameForm from '../../../common/models/social/UserNameForm';
import PostForm from '../../../common/models/social/PostForm';
import Post from '../../../common/models/social/Post';
import UserPostsQuery from '../../../common/models/social/UserPostsQuery';
import UserNameQuery from '../../../common/models/social/UserNameQuery';
import Profile from '../../../common/models/social/Profile';
import Following from '../../../common/models/social/Following';
import NotificationPostsQuery from '../../../common/models/social/NotificationPostsQuery';
import Settings from '../../../common/models/Settings';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import ReplyPostsQuery from '../../../common/models/social/ReplyPostsQuery';
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
import AuthServiceCredentialAuthResponse from '../../../common/models/auth/AuthServiceCredentialAuthResponse';
import PublisherArticleQuery from '../../../common/models/articles/PublisherArticleQuery';
import CommunityReadsQuery from '../../../common/models/articles/CommunityReadsQuery';
import NewPlatformNotificationRequest from '../../../common/models/analytics/NewPlatformNotificationRequest';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import TwitterCredentialAuthForm from '../../../common/models/auth/TwitterCredentialAuthForm';
import TwitterBrowserAuthRequestTokenRequest from '../../../common/models/auth/TwitterBrowserAuthRequestTokenRequest';
import TwitterRequestToken from '../../../common/models/auth/TwitterRequestToken';
import TwitterCredentialLinkForm from '../../../common/models/auth/TwitterCredentialLinkForm';
import DateRangeQuery from '../../../common/models/analytics/DateRangeQuery';
import ConversionsReportRow from '../../../common/models/analytics/ConversionsReportRow';
import ArticleIssuesReportRow from '../../../common/models/analytics/ArticleIssuesReportRow';
import AuthorArticleQuery from '../../../common/models/articles/AuthorArticleQuery';
import AuthorProfileRequest from '../../../common/models/authors/AuthorProfileRequest';
import AuthorProfile from '../../../common/models/authors/AuthorProfile';
import AuthorLeaderboardsRequest from '../../../common/models/stats/AuthorLeaderboardsRequest';
import AuthorRanking from '../../../common/models/AuthorRanking';
import SearchOptions from '../../../common/models/articles/SearchOptions';
import SearchQuery from '../../../common/models/articles/SearchQuery';
import DisplayPreference from '../../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../../common/models/userAccounts/WebAppUserProfile';
import CommentCreationResponse from '../../../common/models/social/CommentCreationResponse';
import { DeviceType, isMobileDevice } from '../../../common/DeviceType';
import { AppleSubscriptionValidationRequest, AppleSubscriptionValidationResponse } from '../../../common/models/subscriptions/AppleSubscriptionValidation';
import { StripeSubscriptionPaymentRequest } from '../../../common/models/subscriptions/StripeSubscriptionPaymentRequest';
import { SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse } from '../../../common/models/subscriptions/SubscriptionPriceLevels';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { StripePaymentConfirmationRequest } from '../../../common/models/subscriptions/StripePaymentConfirmationRequest';
import { StripePaymentResponse } from '../../../common/models/subscriptions/StripePaymentResponse';
import { SubscriptionDistributionSummaryResponse } from '../../../common/models/subscriptions/SubscriptionDistributionSummaryResponse';
import { StripeAutoRenewStatusRequest } from '../../../common/models/subscriptions/StripeAutoRenewStatusRequest';
import { StripePriceChangeRequest } from '../../../common/models/subscriptions/StripePriceChangeRequest';
import { SubscriptionPaymentMethodUpdateRequest, SubscriptionPaymentMethodResponse, SubscriptionPaymentMethodChangeRequest } from '../../../common/models/subscriptions/SubscriptionPaymentMethod';
import { StripeSetupIntentResponse } from '../../../common/models/subscriptions/StripeSetupIntentResponse';
import { RevenueReportResponse, RevenueReportRequest } from '../../../common/models/subscriptions/RevenueReport';
import { AuthorAssignmentRequest, AuthorUnassignmentRequest } from '../../../common/models/articles/AuthorAssignment';
import { AuthorMetadataAssignmentQueueResponse } from '../../../common/models/analytics/AuthorMetadataAssignmentQueue';
import { AuthorsEarningsReportResponse } from '../../../common/models/subscriptions/AuthorEarningsReport';
import { RevenueReportResponse as AdminRevenueReportResponse } from '../../../common/models/analytics/RevenueReport';

export type FetchFunction<TResult> = (callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
export type FetchFunctionWithParams<TParams, TResult> = (params: TParams, callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
export default abstract class {
	protected readonly _endpoint: HttpEndpoint;
	protected readonly _reqStore: RequestStore;
	protected readonly _clientType: ClientType;
	protected readonly _clientVersion: string;
	protected readonly _shouldIncludeCredentials: boolean;
	constructor(
		endpoint: HttpEndpoint,
		requestStore: RequestStore,
		clientType: ClientType,
		clientVersion: string,
		deviceType: DeviceType
	) {
		this._endpoint = endpoint;
		this._reqStore = requestStore;
		this._clientType = clientType;
		this._clientVersion = clientVersion;
		this._shouldIncludeCredentials = (
			clientType === ClientType.App ||
			!isMobileDevice(deviceType)
		);
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
	public get shouldIncludeCredentials() {
		return this._shouldIncludeCredentials;
	}
	public readonly resendConfirmationEmail = () => {
		return this.post({ path: '/UserAccounts/ResendConfirmationEmail' });
	};
	public readonly changePassword = (currentPassword: string, newPassword: string) => {
		return this.post({ path: '/UserAccounts/ChangePassword', data: { currentPassword, newPassword } });
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
	public readonly getAdminSubscriptionRevenueReport = this.createFetchFunctionWithParams<DateRangeQuery, AdminRevenueReportResponse>('/Analytics/RevenueReport');
	public readonly getArticleIssueReportAnalytics = this.createFetchFunctionWithParams<DateRangeQuery, ArticleIssuesReportRow[]>('/Analytics/ArticleIssueReports');
	public readonly getAuthorMetadataAssignmentQueue = this.createFetchFunction<AuthorMetadataAssignmentQueueResponse>('/Analytics/AuthorMetadataAssignmentQueue');
	public readonly getConversionAnalytics = this.createFetchFunctionWithParams<DateRangeQuery, ConversionsReportRow[]>('/Analytics/Conversions');
	public readonly getDailyTotalAnalytics = this.createFetchFunctionWithParams<DateRangeQuery, DailyTotalsReportRow[]>('/Analytics/DailyTotals');
	public readonly getSignupAnalytics = this.createFetchFunctionWithParams<DateRangeQuery, SignupsReportRow[]>('/Analytics/Signups');
	public readonly logExtensionRemoval = (installationId: string) => this.post({ path: '/Extension/Uninstall', data: { installationId } });
	public readonly logExtensionRemovalFeedback = (data: { installationId: string, reason: string }) => this.post({ path: '/Extension/UninstallFeedback', data });
	public readonly logNewPlatformNotificationRequest = (data: NewPlatformNotificationRequest) => this.post({ path: '/Analytics/NewPlatformNotificationRequest', data });

	// Articles
	public readonly assignAuthorToArticle = (request: AuthorAssignmentRequest) => this.post({ path: '/Articles/AuthorAssignment', data: request });
	public readonly getAotdHistory = this.createFetchFunctionWithParams<ArticleQuery, PageResult<UserArticle>>('/Articles/AotdHistory');
	public readonly getArticle = this.createFetchFunctionWithParams<{ slug: string }, UserArticle>('/Articles/Details');
	public readonly getArticleSearchOptions = this.createFetchFunction<SearchOptions>('/Articles/SearchOptions');
	public readonly getAuthorArticles = this.createFetchFunctionWithParams<AuthorArticleQuery, PageResult<UserArticle>>('/Articles/Author');
	public readonly getCommunityReads = this.createFetchFunctionWithParams<CommunityReadsQuery, CommunityReads>('/Articles/CommunityReads');
	public readonly getPublisherArticles = this.createFetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>('/Articles/Publisher');
	public readonly getStarredArticles = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListStarred');
	public readonly getUserArticleHistory = this.createFetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>('/Articles/ListHistory');
	public readonly rateArticle = (id: number, score: number) => this.post<{ article: UserArticle, rating: Rating }>({ path: '/Articles/Rate', data: { articleId: id, score } });
	public readonly searchArticles = (query: SearchQuery) => this.post<PageResult<UserArticle>>({ path: '/Articles/Search', data: query });
	public readonly unassignAuthorFromArticle = (request: AuthorUnassignmentRequest) => this.post({ path: '/Articles/AuthorUnassignment', data: request });

	// Auth
	public readonly authenticateAppleIdCredential = (data: AppleIdCredentialAuthForm) => this.post<AuthServiceCredentialAuthResponse>({ path: '/Auth/AppleIos', data });
	public readonly authenticateTwitterCredential = (data: TwitterCredentialAuthForm) => this.post<AuthServiceCredentialAuthResponse>({ path: '/Auth/TwitterAuthentication', data });
	public readonly requestTwitterBrowserAuthRequestToken = (data: TwitterBrowserAuthRequestTokenRequest) => this.post<TwitterRequestToken>({ path: '/Auth/TwitterBrowserAuthRequest', data });
	public readonly requestTwitterBrowserLinkRequestToken = () => this.post<TwitterRequestToken>({ path: '/Auth/TwitterBrowserLinkRequest' });
	public readonly requestTwitterWebViewRequestToken = () => this.post<TwitterRequestToken>({ path: '/Auth/TwitterWebViewRequest' });
	public readonly linkTwitterAccount = (data: TwitterCredentialLinkForm) => this.post<AuthServiceAccountAssociation>({ path: '/Auth/TwitterLink', data });

	// Authors
	public readonly getAuthorProfile = this.createFetchFunctionWithParams<AuthorProfileRequest, AuthorProfile>('/Authors/Profile');

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
	public readonly getNotificationPosts = this.createFetchFunctionWithParams<NotificationPostsQuery, PageResult<Post>>('/Social/NotificationPosts');
	public readonly getReplyPosts = this.createFetchFunctionWithParams<ReplyPostsQuery, PageResult<Post>>('/Social/ReplyPosts');
	public readonly postArticle = (data: PostForm) => this.post<Post>({ path: '/Social/Post', data });
	public readonly postComment = (data: CommentForm) => this.post<CommentCreationResponse>({ path: '/Social/Comment', data });
	public readonly postCommentAddendum = (data: CommentAddendumForm) => this.post<CommentThread>({ path: '/Social/CommentAddendum', data });
	public readonly postCommentRevision = (data: CommentRevisionForm) => this.post<CommentThread>({ path: '/Social/CommentRevision', data });
	public readonly getPostsFromUser = this.createFetchFunctionWithParams<UserPostsQuery, PageResult<Post>>('/Social/UserPosts');
	public readonly getProfile = this.createFetchFunctionWithParams<UserNameQuery, Profile>('/Social/Profile');
	public readonly unfollowUser = (data: UserNameForm) => this.post({ path: '/Social/Unfollow', data });

	// Stats
	public readonly getAuthorLeaderboards = this.createFetchFunctionWithParams<AuthorLeaderboardsRequest, AuthorRanking[]>('/Stats/AuthorLeaderboards');
	public readonly getReadingTimeStats = this.createFetchFunctionWithParams<{ timeWindow: ReadingTimeTotalsTimeWindow }, ReadingTimeStats>('/Stats/ReadingTime');
	public readonly getLeaderboards = this.createFetchFunction<Leaderboards>('/Stats/Leaderboards');
	public readonly getUserCount = this.createFetchFunction<{ userCount: number }>('/Stats/UserCount');

	// Subscriptions
	public readonly changeStripeSubscriptionPrice = (request: StripePriceChangeRequest) => this.post<StripePaymentResponse>({ path: '/Subscriptions/StripePriceChange', data: request });
	public readonly changeSubscriptionPaymentMethod = (request: SubscriptionPaymentMethodChangeRequest) => this.post<SubscriptionPaymentMethodResponse>({ path: '/Subscriptions/StripePaymentMethodChange', data: request });
	public readonly confirmStripeSubscriptionPayment = (request: StripePaymentConfirmationRequest) => this.post<StripePaymentResponse>({ path: '/Subscriptions/StripePaymentConfirmation', data: request });
	public readonly completeStripeSubscriptionUpgrade = (request: StripeSubscriptionPaymentRequest) => this.post<StripePaymentResponse>({ path: '/Subscriptions/StripeUpgradePayment', data: request });
	public readonly getAuthorsEarningsReport = this.createFetchFunction<AuthorsEarningsReportResponse>('/Subscriptions/AuthorsEarningsReport');
	public readonly getSubscriptionDistributionSummary = this.createFetchFunction<SubscriptionDistributionSummaryResponse>('/Subscriptions/DistributionSummary');
	public readonly getSubscriptionPriceLevels = this.createFetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>('/Subscriptions/PriceLevels');
	public readonly getSubscriptionRevenueReport = this.createFetchFunctionWithParams<RevenueReportRequest, RevenueReportResponse>('/Subscriptions/RevenueReport');
	public readonly getSubscriptionStatus = this.createFetchFunction<SubscriptionStatusResponse>('/Subscriptions/Status');
	public readonly createStripeSetupIntent = () => this.post<StripeSetupIntentResponse>({ path: '/Subscriptions/StripeSetupIntentRequest' });
	public readonly createStripeSubscription = (request: StripeSubscriptionPaymentRequest) => this.post<StripePaymentResponse>({ path: '/Subscriptions/StripeSubscription', data: request });
	public readonly requestAppleSubscriptionStatusUpdate = () => this.post<SubscriptionStatusResponse>({ path: '/Subscriptions/AppleSubscriptionStatusUpdateRequest' });
	public readonly setStripeSubscriptionAutoRenewStatus = (request: StripeAutoRenewStatusRequest) => this.post<SubscriptionStatusResponse>({ path: '/Subscriptions/StripeAutoRenewStatus', data: request });
	public readonly updateSubscriptionPaymentMethod = (request: SubscriptionPaymentMethodUpdateRequest) => this.post<SubscriptionPaymentMethodResponse>({ path: '/Subscriptions/StripePaymentMethodUpdate', data: request });
	public readonly validateAppleSubscription = (request: AppleSubscriptionValidationRequest) => this.post<AppleSubscriptionValidationResponse>({ path: '/Subscriptions/AppleSubscriptionValidation', data: request });

	// UserAccounts
	public readonly changeDisplayPreference = (data: DisplayPreference) => this.post<DisplayPreference>({ path: '/UserAccounts/DisplayPreference', data });
	public readonly changeNotificationPreference = (data: NotificationPreference) => this.post<NotificationPreference>({ path: '/UserAccounts/NotificationPreference', data });
	public readonly changeTimeZone = (timeZone: { id?: number, name?: string }) => this.post<UserAccount>({ path: '/UserAccounts/ChangeTimeZone', data: timeZone });
	public readonly createAuthServiceAccount = (data: AuthServiceAccountForm) => this.post<WebAppUserProfile>({ path: '/UserAccounts/AuthServiceAccount', data });
	public readonly createUserAccount = (data: UserAccountForm) => this.post<WebAppUserProfile>({ path: '/UserAccounts/CreateAccount', data });
	public readonly getDisplayPreference = this.createFetchFunction<DisplayPreference>('/UserAccounts/DisplayPreference');
	public readonly getSettings = this.createFetchFunction<Settings>('/UserAccounts/Settings');
	public readonly getTimeZones = this.createFetchFunction<TimeZoneSelectListItem[]>('/UserAccounts/TimeZones');
	public readonly registerOrientationCompletion = () => this.post<UserAccount>({ path: '/UserAccounts/OrientationCompletion' });
	public readonly requestPasswordReset = (data: PasswordResetRequestForm) => this.post({ path: '/UserAccounts/RequestPasswordReset', data });
	public readonly resetPassword = (data: PasswordResetForm) => this.post<WebAppUserProfile>({ path: '/UserAccounts/ResetPassword', data });
	public readonly sendPasswordCreationEmail = () => this.post({ path: '/UserAccounts/PasswordCreationEmailDispatch' });
	public readonly signIn = (data: SignInForm) => this.post<WebAppUserProfile>({ path: '/UserAccounts/SignIn', data });
}