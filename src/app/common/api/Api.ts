import Fetchable from './Fetchable';
import Article from './models/Article';
import Comment from '../../../common/models/Comment';
import UserAccount from './models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import Endpoint from './Endpoint';
import NewReplyNotification from '../../../common/models/NewReplyNotification';

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
	public listArticles(callback: (articles: Fetchable<Article[]>) => void) {
		return this.get<Article[]>(new Request('/Articles/List'), callback);
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
	public listUserArticles(callback: (articles: Fetchable<Article[]>) => void) {
		return this.get<Article[]>(new Request('/Articles/UserList'), callback);
	}
	public getArticleDetails(slug: string, callback: (article: Fetchable<Article>) => void) {
		return this.get<Article>(new Request('/Articles/Details', { slug }), callback);
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
	public listReplies(callback: (comments: Fetchable<Comment[]>) => void) {
		return this.get<Comment[]>(new Request('/Articles/ListReplies'), callback);
	}
	public checkNewReplyNotification(callback: (states: Fetchable<NewReplyNotification>) => void) {
		return this.get<NewReplyNotification>(new Request('/UserAccounts/CheckNewReplyNotification'), callback);
	}
	public ackNewReply() {
		return this.post(new Request('/UserAccounts/AckNewReply'));
	}
}