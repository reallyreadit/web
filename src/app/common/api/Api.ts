import Fetchable from './Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import Comment from '../../../common/models/Comment';
import UserAccount from '../../../common/models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import Endpoint from './Endpoint';
import NewReplyNotification from '../../../common/models/NewReplyNotification';
import PageResult from '../../../common/models/PageResult';

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
	public listHotTopics(pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) {
		return this.get<PageResult<UserArticle>>(new Request('/Articles/ListHotTopics', { pageNumber }), callback);
	}
	public createUserAccount(name: string, email: string, password: string) {
		return this.post<UserAccount>(new Request(
			'/UserAccounts/CreateAccount',
			{ name, email, password }
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
	public requestPasswordReset(email: string) {
		return this.post(new Request('/UserAccounts/RequestPasswordReset', { email }));
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
	public listUserArticles(callback: (articles: Fetchable<UserArticle[]>) => void) {
		return this.get<UserArticle[]>(new Request('/Articles/UserList'), callback);
	}
	public getArticleDetails(slug: string, callback: (article: Fetchable<UserArticle>) => void) {
		return this.get<UserArticle>(new Request('/Articles/Details', { slug }), callback);
	}
	public listComments(slug: string, callback: (comments: Fetchable<Comment[]>) => void) {
		return this.get<Comment[]>(new Request('/Articles/ListComments', { slug }), callback);
	}
	public postComment(text: string, articleId: string, parentCommentId?: string) {
		return this.post<Comment>(new Request('/Articles/PostComment', { text, articleId, parentCommentId }));
	}
	public readReply(commentId: string) {
		return this.post(new Request('/Articles/ReadReply', { commentId }));
	}
	public deleteUserArticle(articleId: string) {
		return this.post(new Request('/Articles/UserDelete', { articleId }));
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
}