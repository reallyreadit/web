import Fetchable from './Fetchable';
import Article from './models/Article';
import UserArticle from './models/UserArticle';
import UserAccount from './models/UserAccount';
import Request from './Request';
import RequestStore from './RequestStore';
import Endpoint from './Endpoint';

abstract class Api {
	protected reqStore: RequestStore;
	protected isInitialized = false;
	constructor(protected readonly endpoint: Endpoint) { }
	protected abstract get<T>(request: Request, callback: (data: Fetchable<T>) => void) : Fetchable<T>;
	protected abstract post<T>(request: Request) : Promise<T>;
	protected getUrl(path: string) {
		return `${this.endpoint.scheme}://${this.endpoint.host}:${this.endpoint.port}${path}`;
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
	public signIn(name: string, password: string) {
		return this.post<UserAccount>(new Request('/UserAccounts/SignIn', { name, password }));
	}
	public signOut() {
		return this.post(new Request('/UserAccounts/SignOut'));
	}
	public listUserArticles(callback: (articles: Fetchable<UserArticle[]>) => void) {
		return this.get<UserArticle[]>(new Request('/Articles/UserList'), callback);
	}
}
export default Api;