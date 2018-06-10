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
import ChallengeResponseAction from '../../../common/models/ChallengeResponseAction';
import ChallengeResponse from '../../../common/models/ChallengeResponse';
import ChallengeScore from '../../../common/models/ChallengeScore';
import ChallengeLeaderboard from '../../../common/models/ChallengeLeaderboard';
import ChallengeState from '../../../common/models/ChallengeState';

export interface InitData {
	endpoint: Endpoint,
	requests: Request[]
}
export default abstract class Api {
	protected readonly _endpoint: Endpoint;
	protected _reqStore: RequestStore;
	protected _isInitialized = false;
	constructor(endpoint: Endpoint) {
		this._endpoint = endpoint;
	}
	protected abstract get<T>(request: Request, callback: (data: Fetchable<T>) => void) : Fetchable<T>;
	protected abstract post<T>(request: Request) : Promise<T>;
	protected getUrl(path: string) {
		return `${this._endpoint.scheme}://${this._endpoint.host}:${this._endpoint.port}${path}`;
	}
	public listHotTopics(pageNumber: number, callback: (articles: Fetchable<HotTopics>) => void) {
		return this.get<HotTopics>(new Request('/Articles/ListHotTopics', { pageNumber }), callback);
	}
	public createUserAccount(name: string, email: string, password: string, captchaResponse: string) {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/CreateAccount',
			{ name, email, password, captchaResponse }
		));
	}
	public resendConfirmationEmail() {
		return this.post(new Request('/UserAccounts/ResendConfirmationEmail'));
	}
	public changePassword(currentPassword: string, newPassword: string) {
		return this.post(new Request('/UserAccounts/ChangePassword', { currentPassword, newPassword }));
	}
	public resetPassword(token: string, password: string) {
		return this.post(new Request('/UserAccounts/ResetPassword', { token, password }));
	}
	public changeEmailAddress(email: string) {
		return this.post<UserAccount>(new Request('/UserAccounts/ChangeEmailAddress', { email }));
	}
	public requestPasswordReset(email: string, captchaResponse: string) {
		return this.post(new Request('/UserAccounts/RequestPasswordReset', { email, captchaResponse }));
	}
	public updateContactPreferences(receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/UpdateContactPreferences',
			{ receiveWebsiteUpdates, receiveSuggestedReadings }
		));
	}
	public updateNotificationPreferences(receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/UpdateNotificationPreferences',
			{ receiveEmailNotifications, receiveDesktopNotifications }
		));
	}
	public getUserAccount(callback: (userAccount: Fetchable<UserAccount>) => void) {
		return this.get<UserAccount>(new Request('/UserAccounts/GetUserAccount'), callback);
	}
	public signIn(email: string, password: string) {
		return this.post<UserAccount>(new Request('/UserAccounts/SignIn', { email, password }));
	}
	public signOut() {
		return this.post(new Request('/UserAccounts/SignOut'));
	}
	public listStarredArticles(pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) {
		return this.get<PageResult<UserArticle>>(new Request('/Articles/ListStarred', { pageNumber }), callback);
	}
	public listUserArticleHistory(pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) {
		return this.get<PageResult<UserArticle>>(new Request('/Articles/ListHistory', { pageNumber }), callback);
	}
	public getArticleDetails(slug: string, callback: (article: Fetchable<UserArticle>) => void) {
		return this.get<UserArticle>(new Request('/Articles/Details', { slug }), callback);
	}
	public listComments(slug: string, callback: (comments: Fetchable<Comment[]>) => void) {
		return this.get<Comment[]>(new Request('/Articles/ListComments', { slug }), callback);
	}
	public postComment(text: string, articleId: number, parentCommentId?: number) {
		return this.post<Comment>(new Request('/Articles/PostComment', { text, articleId, parentCommentId }));
	}
	public readReply(commentId: number) {
		return this.post(new Request('/Articles/ReadReply', { commentId }));
	}
	public deleteUserArticle(articleId: number) {
		return this.post(new Request('/Articles/UserDelete', { articleId }));
	}
	public starArticle(articleId: number) {
		return this.post(new Request('/Articles/Star', { articleId }));
	}
	public unstarArticle(articleId: number) {
		return this.post(new Request('/Articles/Unstar', { articleId }));
	}
	public listReplies(pageNumber: number, callback: (comments: Fetchable<PageResult<Comment>>) => void) {
		return this.get<PageResult<Comment>>(new Request('/Articles/ListReplies', { pageNumber }), callback);
	}
	public checkNewReplyNotification(callback: (states: Fetchable<NewReplyNotification>) => void) {
		return this.get<NewReplyNotification>(new Request('/UserAccounts/CheckNewReplyNotification'), callback);
	}
	public ackNewReply() {
		return this.post(new Request('/UserAccounts/AckNewReply'));
	}
	public getBulkMailings(callback: (mailings: Fetchable<BulkMailing[]>) => void) {
		return this.get<BulkMailing[]>(new Request('/BulkMailings/List'), callback);
	}
	public getBulkMailingLists(callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) {
		return this.get<{ key: string, value: string }[]>(new Request('/BulkMailings/Lists'), callback);
	}
	public sendTestBulkMailing(list: string, subject: string, body: string, emailAddress: string) {
		return this.post(new Request('/BulkMailings/SendTest', { list, subject, body, emailAddress }));
	}
	public sendBulkMailing(list: string, subject: string, body: string) {
		return this.post(new Request('/BulkMailings/Send', { list, subject, body }));
	}
	public getEmailSubscriptions(token: string, callback: (request: Fetchable<EmailSubscriptionsRequest>) => void) {
		return this.get(new Request('/UserAccounts/EmailSubscriptions', { token }), callback);
	}
	public updateEmailSubscriptions(token: string, subscriptions: EmailSubscriptions) {
		return this.post(new Request('/UserAccounts/UpdateEmailSubscriptions', { token, ...subscriptions }));
	}
	public shareArticle(articleId: number, emailAddresses: string[], message: string, captchaResponse: string) {
		return this.post(new Request('/Articles/Share', { articleId, emailAddresses, message, captchaResponse }));
	}
	public getTimeZones(callback: (timeZones: Fetchable<TimeZoneSelectListItem[]>) => void) {
		return this.get<TimeZoneSelectListItem[]>(new Request('/UserAccounts/TimeZones'), callback);
	}
	public createChallengeResponse(challengeId: number, action: ChallengeResponseAction, timeZoneId: number | null = null) {
		return this.post<{
			response: ChallengeResponse,
			score: ChallengeScore
		}>(new Request('/Challenges/Respond', { challengeId, action, timeZoneId }));
	}
	public getChallengeScore(challengeId: number, callback: (score: Fetchable<ChallengeScore>) => void) {
		return this.get<ChallengeScore>(new Request('/Challenges/Score', { challengeId }), callback);
	}
	public getChallengeLeaderboard(challengeId: number, callback: (leaderboard: Fetchable<ChallengeLeaderboard>) => void) {
		return this.get<ChallengeLeaderboard>(new Request('/Challenges/Leaderboard', { challengeId }), callback);
	}
	public getChallengeState(callback: (state: Fetchable<ChallengeState>) => void) {
		return this.get<ChallengeState>(new Request('/Challenges/State'), callback);
	}
}