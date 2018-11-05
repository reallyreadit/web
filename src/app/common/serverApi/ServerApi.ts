import Fetchable from './Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import BulkMailing from '../../../common/models/BulkMailing';
import Comment from '../../../common/models/Comment';
import UserAccount from '../../../common/models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import Endpoint from './Endpoint';
import NewReplyNotification from '../../../common/models/NewReplyNotification';
import PageResult from '../../../common/models/PageResult';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import HotTopics from '../../../common/models/HotTopics';
import TimeZoneSelectListItem from '../../../common/models/TimeZoneSelectListItem';
import ChallengeResponse from '../../../common/models/ChallengeResponse';
import ChallengeScore from '../../../common/models/ChallengeScore';
import ChallengeLeaderboard from '../../../common/models/ChallengeLeaderboard';
import ChallengeState from '../../../common/models/ChallengeState';
import UserStats from '../../../common/models/UserStats';
import ChallengeWinner from '../../../common/models/ChallengeWinner';
import ChallengeResponseTotal from '../../../common/models/ChallengeResponseTotal';
import UserWeeklyReadingStats from '../../../common/models/UserWeeklyReadingStats';
import WeeklyReadingLeaderboards from '../../../common/models/WeeklyReadingLeaderboards';

export type FetchFunction<T> = (callback: (value: Fetchable<T>) => void) => Fetchable<T>;
export interface InitData {
	endpoint: Endpoint,
	requests: Request[]
}
export default abstract class {
	protected readonly _endpoint: Endpoint;
	protected _reqStore: RequestStore;
	protected _isInitialized = false;
	constructor(endpoint: Endpoint) {
		this._endpoint = endpoint;
	}
	private createFetchFunction<T>(path: string) {
		return (callback: (value: Fetchable<T>) => void) => this.get<T>(new Request(path), callback);
	}
	protected abstract get<T = void>(request: Request, callback: (data: Fetchable<T>) => void) : Fetchable<T>;
	protected abstract post<T = void>(request: Request) : Promise<T>;
	protected getUrl(path: string) {
		return `${this._endpoint.scheme}://${this._endpoint.host}:${this._endpoint.port}${path}`;
	}
	public readonly listHotTopics = (pageNumber: number, pageSize: number, callback: (articles: Fetchable<HotTopics>) => void) => {
		return this.get<HotTopics>(new Request('/Articles/ListHotTopics', { pageNumber, pageSize }), callback);
	};
	public readonly createUserAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/CreateAccount',
			{ name, email, password, captchaResponse }
		));
	};
	public readonly resendConfirmationEmail = () => {
		return this.post(new Request('/UserAccounts/ResendConfirmationEmail'));
	};
	public readonly changePassword = (currentPassword: string, newPassword: string) => {
		return this.post(new Request('/UserAccounts/ChangePassword', { currentPassword, newPassword }));
	};
	public readonly resetPassword = (token: string, password: string) => {
		return this.post(new Request('/UserAccounts/ResetPassword', { token, password }));
	};
	public readonly changeEmailAddress = (email: string) => {
		return this.post<UserAccount>(new Request('/UserAccounts/ChangeEmailAddress', { email }));
	};
	public readonly requestPasswordReset = (email: string, captchaResponse: string) => {
		return this.post(new Request('/UserAccounts/RequestPasswordReset', { email, captchaResponse }));
	};
	public readonly updateContactPreferences = (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/UpdateContactPreferences',
			{ receiveWebsiteUpdates, receiveSuggestedReadings }
		));
	};
	public readonly updateNotificationPreferences = (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/UpdateNotificationPreferences',
			{ receiveEmailNotifications, receiveDesktopNotifications }
		));
	};
	public readonly getUserAccount = (callback: (userAccount: Fetchable<UserAccount>) => void) => {
		return this.get<UserAccount>(new Request('/UserAccounts/GetUserAccount'), callback);
	};
	public readonly signIn = (email: string, password: string) => {
		return this.post<UserAccount>(new Request('/UserAccounts/SignIn', { email, password }));
	};
	public readonly signOut = () => {
		return this.post<void>(new Request('/UserAccounts/SignOut'));
	};
	public readonly listStarredArticles = (pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) => {
		return this.get<PageResult<UserArticle>>(new Request('/Articles/ListStarred', { pageNumber }), callback);
	};
	public readonly listUserArticleHistory = (pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) => {
		return this.get<PageResult<UserArticle>>(new Request('/Articles/ListHistory', { pageNumber }), callback);
	};
	public readonly getArticleDetails = (slug: string, callback: (article: Fetchable<UserArticle>) => void) => {
		return this.get<UserArticle>(new Request('/Articles/Details', { slug }), callback);
	};
	public readonly listComments = (slug: string, callback: (comments: Fetchable<Comment[]>) => void) => {
		return this.get<Comment[]>(new Request('/Articles/ListComments', { slug }), callback);
	};
	public readonly postComment = (text: string, articleId: number, parentCommentId?: number) => {
		return this.post<Comment>(new Request('/Articles/PostComment', { text, articleId, parentCommentId }));
	};
	public readonly readReply = (commentId: number) => {
		return this.post(new Request('/Articles/ReadReply', { commentId }));
	};
	public readonly deleteUserArticle = (articleId: number) => {
		return this.post(new Request('/Articles/UserDelete', { articleId }));
	};
	public readonly starArticle = (articleId: number) => {
		return this.post<void>(new Request('/Articles/Star', { articleId }));
	};
	public readonly unstarArticle = (articleId: number) => {
		return this.post<void>(new Request('/Articles/Unstar', { articleId }));
	};
	public readonly listReplies = (pageNumber: number, callback: (comments: Fetchable<PageResult<Comment>>) => void) => {
		return this.get<PageResult<Comment>>(new Request('/Articles/ListReplies', { pageNumber }), callback);
	};
	public readonly checkNewReplyNotification = (callback: (states: Fetchable<NewReplyNotification>) => void) => {
		return this.get<NewReplyNotification>(new Request('/UserAccounts/CheckNewReplyNotification'), callback);
	};
	public readonly ackNewReply = () => {
		return this.post(new Request('/UserAccounts/AckNewReply'));
	};
	public readonly getBulkMailings = (callback: (mailings: Fetchable<BulkMailing[]>) => void) => {
		return this.get<BulkMailing[]>(new Request('/BulkMailings/List'), callback);
	};
	public readonly getBulkMailingLists = (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => {
		return this.get<{ key: string, value: string }[]>(new Request('/BulkMailings/Lists'), callback);
	};
	public readonly sendTestBulkMailing = (list: string, subject: string, body: string, emailAddress: string) => {
		return this.post(new Request('/BulkMailings/SendTest', { list, subject, body, emailAddress }));
	};
	public readonly sendBulkMailing = (list: string, subject: string, body: string) => {
		return this.post(new Request('/BulkMailings/Send', { list, subject, body }));
	};
	public readonly getEmailSubscriptions = (token: string, callback: (request: Fetchable<EmailSubscriptionsRequest>) => void) => {
		return this.get(new Request('/UserAccounts/EmailSubscriptions', { token }), callback);
	};
	public readonly updateEmailSubscriptions = (token: string, subscriptions: EmailSubscriptions) => {
		return this.post(new Request('/UserAccounts/UpdateEmailSubscriptions', { token, ...subscriptions }));
	};
	public readonly shareArticle = (articleId: number, emailAddresses: string[], message: string, captchaResponse: string) => {
		return this.post(new Request('/Articles/Share', { articleId, emailAddresses, message, captchaResponse }));
	};
	public readonly getTimeZones = (callback: (timeZones: Fetchable<TimeZoneSelectListItem[]>) => void) => {
		return this.get<TimeZoneSelectListItem[]>(new Request('/UserAccounts/TimeZones'), callback);
	};
	public readonly getChallengeScore = (challengeId: number, callback: (score: Fetchable<ChallengeScore>) => void) => {
		return this.get<ChallengeScore>(new Request('/Challenges/Score', { challengeId }), callback);
	};
	public readonly getChallengeLeaderboard = (challengeId: number, callback: (leaderboard: Fetchable<ChallengeLeaderboard>) => void) => {
		return this.get<ChallengeLeaderboard>(new Request('/Challenges/Leaderboard', { challengeId }), callback);
	};
	public readonly getChallengeState = (callback: (state: Fetchable<ChallengeState>) => void) => {
		return this.get<ChallengeState>(new Request('/Challenges/State'), callback);
	};
	public readonly startChallenge = (challengeId: number, timeZoneId: number) => {
		return this.post<{
			response: ChallengeResponse,
			score: ChallengeScore
		}>(new Request('/Challenges/Start', { challengeId, timeZoneId }));
	};
	public readonly quitChallenge = (challengeId: number) => {
		return this.post<ChallengeResponse>(new Request('/Challenges/Quit', { challengeId }));
	};
	public readonly getUserStats = (callback: (state: Fetchable<UserStats>) => void) => {
		return this.get<UserStats>(new Request('/UserAccounts/Stats'), callback);
	};
	public readonly getChallengeWinners = (challengeId: number, callback: (state: Fetchable<ChallengeWinner[]>) => void) => {
		return this.get<ChallengeWinner[]>(new Request('/Challenges/Winners', { challengeId }), callback);
	};
	public readonly getChallengeResponseActionTotals = (challengeId: number, callback: (state: Fetchable<ChallengeResponseTotal[]>) => void) => {
		return this.get<ChallengeResponseTotal[]>(new Request('/Challenges/ResponseActionTotals', { challengeId }), callback);
	};

	// Stats
	public readonly getWeeklyReadingLeaderboards = this.createFetchFunction<WeeklyReadingLeaderboards>('/Stats/WeeklyReadingLeaderboards');
	public readonly getWeeklyReadingStats = this.createFetchFunction<UserWeeklyReadingStats | null>('/Stats/WeeklyReading');
}