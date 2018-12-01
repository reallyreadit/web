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
import UserAccountStats from '../../../common/models/UserAccountStats';
import ChallengeWinner from '../../../common/models/ChallengeWinner';
import ChallengeResponseTotal from '../../../common/models/ChallengeResponseTotal';
import UserStats from '../../../common/models/UserStats';
import Leaderboards from '../../../common/models/Leaderboards';

export type FetchFunction<TResult> = (callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
export type FetchFunctionWithParams<TParams, TResult> = (params: TParams, callback: (value: Fetchable<TResult>) => void) => Fetchable<TResult>;
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
	private createFetchFunction<TResult>(path: string) {
		return (callback: (value: Fetchable<TResult>) => void) => this.get<TResult>(new Request(path), callback);
	}
	private createFetchFunctionWithParams<TParams, TResult>(path: string) {
		return (params: TParams, callback: (value: Fetchable<TResult>) => void) => this.get<TResult>(new Request(path, params), callback);
	}
	protected abstract get<T = void>(request: Request, callback: (data: Fetchable<T>) => void) : Fetchable<T>;
	protected abstract post<T = void>(request: Request) : Promise<T>;
	protected getUrl(path: string) {
		return `${this._endpoint.scheme}://${this._endpoint.host}:${this._endpoint.port}${path}`;
	}
	public readonly createUserAccount = (name: string, email: string, password: string, captchaResponse: string, timeZoneName: string) => {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/CreateAccount',
			{ name, email, password, captchaResponse, timeZoneName }
		));
	};
	public readonly resendConfirmationEmail = () => {
		return this.post(new Request('/UserAccounts/ResendConfirmationEmail'));
	};
	public readonly changePassword = (currentPassword: string, newPassword: string) => {
		return this.post(new Request('/UserAccounts/ChangePassword', { currentPassword, newPassword }));
	};
	public readonly resetPassword = (token: string, password: string) => {
		return this.post<UserAccount>(new Request('/UserAccounts/ResetPassword', { token, password }));
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
	public readonly quitChallenge = (challengeId: number) => {
		return this.post<ChallengeResponse>(new Request('/Challenges/Quit', { challengeId }));
	};
	public readonly getUserAccountStats = (callback: (state: Fetchable<UserAccountStats>) => void) => {
		return this.get<UserAccountStats>(new Request('/UserAccounts/Stats'), callback);
	};
	public readonly getChallengeWinners = (challengeId: number, callback: (state: Fetchable<ChallengeWinner[]>) => void) => {
		return this.get<ChallengeWinner[]>(new Request('/Challenges/Winners', { challengeId }), callback);
	};
	public readonly getChallengeResponseActionTotals = (challengeId: number, callback: (state: Fetchable<ChallengeResponseTotal[]>) => void) => {
		return this.get<ChallengeResponseTotal[]>(new Request('/Challenges/ResponseActionTotals', { challengeId }), callback);
	};

	// Articles
	public readonly getArticle = this.createFetchFunctionWithParams<{ slug: string }, UserArticle>('/Articles/Details');
	public readonly getComments = this.createFetchFunctionWithParams<{ slug: string }, Comment[]>('/Articles/ListComments');
	public readonly getHotTopics = this.createFetchFunctionWithParams<{ pageNumber: number, pageSize: number }, HotTopics>('/Articles/ListHotTopics');
	public readonly getStarredArticles = this.createFetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>('/Articles/ListStarred');
	public readonly getUserArticleHistory = this.createFetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>('/Articles/ListHistory');

	// Challenges
	public readonly getChallengeLeaderboard = this.createFetchFunctionWithParams<{ challengeId: number }, ChallengeLeaderboard>('/Challenges/Leaderboard');
	public readonly getChallengeScore = this.createFetchFunctionWithParams<{ challengeId: number }, ChallengeScore>('/Challenges/Score');
	public readonly getChallengeState = this.createFetchFunction<ChallengeState>('/Challenges/State');
	public readonly startChallenge = (challengeId: number) => this.post<{
		response: ChallengeResponse,
		score: ChallengeScore
	}>(new Request('/Challenges/Start', { challengeId }));

	// Extension
	public readonly sendExtensionInstructions = () => this.post(new Request('/Extension/SendInstructions'));

	// Stats
	public readonly getLeaderboards = this.createFetchFunction<Leaderboards>('/Stats/Leaderboards');
	public readonly getUserStats = this.createFetchFunction<UserStats | null>('/Stats/UserStats');

	// UserAccounts
	public readonly changeTimeZone = (timeZone: { id?: number, name?: string }) => this.post<UserAccount>(new Request('/UserAccounts/ChangeTimeZone', timeZone));
	public readonly getTimeZones = this.createFetchFunction<TimeZoneSelectListItem[]>('/UserAccounts/TimeZones');
}