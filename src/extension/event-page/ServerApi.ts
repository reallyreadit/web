import EventPageOptions from './EventPageOptions';
import ContentScriptOptions from '../common/ContentScriptOptions';
import Source from '../common/Source';
import UserArticle from './UserArticle';
import UserPage from '../common/UserPage';
import ObjectStore from './ObjectStore';
import PageInfo from '../common/PageInfo';
import ReadStateCommitData from '../common/ReadStateCommitData';
import Request from './Request';
import ContentScriptTab from './ContentScriptTab';

export default class ServerApi {
	private static getUrl(path: string) {
		return 'http://api.dev.reallyread.it' + path;
	}
	private static parseResponse(request: XMLHttpRequest, handler: (data: any) => void, defaultValue?: any) {
		const contentType = request.getResponseHeader('Content-Type');
		if (contentType && contentType.startsWith('application/json')) {
			handler(JSON.parse(request.responseText));
		} else {
			handler(defaultValue);
		}
	}
	private _eventPageOptions: EventPageOptions;
	private _contentScriptOptions: ContentScriptOptions;
	private _articles = new ObjectStore<string, UserArticle>('articles', 'local', a => a.id);
	private _requests: Request[] = [];
	private _onRequestChanged: () => void;
	private _onCacheUpdated: () => void;
	constructor(handlers: {
		onAuthenticationStatusChanged: (isAuthenticated: boolean) => void,
		onRequestChanged: () => void,
		onCacheUpdated: () => void
	}) {
		// options
		this._eventPageOptions = {
			articleUnlockThreshold: 90
		};
		this._contentScriptOptions = {
			wordReadRate: 100,
			pageOffsetUpdateRate: 2000,
			readStateCommitRate: 2000,
			urlCheckRate: 2500
		};
		// authentication
		chrome.cookies.onChanged.addListener(changeInfo => {
			if (changeInfo.cookie.name === 'sessionKey') {
				console.log(`chrome.cookies.onChanged (${changeInfo.cause}/${changeInfo.cookie}/removed:${changeInfo.removed})`);
				// clear cache
				this._articles.clear();
				// fire handler
				handlers.onAuthenticationStatusChanged(!changeInfo.removed);
			}
		});
		// requests handler
		this._onRequestChanged = handlers.onRequestChanged;
		// cache update handler
		this._onCacheUpdated = handlers.onCacheUpdated;
	}
	private fetchJson<T>(request: Request) {
		const removeRequest = () => {
			this._requests.splice(this._requests.indexOf(request), 1)
			this._onRequestChanged();
		};
		this._requests.push(request);
		this._onRequestChanged();
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.withCredentials = true;
			req.addEventListener('load', function () {
				removeRequest();
				if (this.status === 200) {
					ServerApi.parseResponse(this, resolve);
				} else {
					ServerApi.parseResponse(this, reject, []);
				}
			});
			req.addEventListener('error', function () {
				removeRequest();
				reject([]);
			});
			if (request.method === 'POST') {
				req.open(request.method, ServerApi.getUrl(request.path));
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(request.query));
			} else {
				req.open(request.method, ServerApi.getUrl(request.path + request.getQueryString()));
				req.send();
			}
		});
	}
	public findSource(tabId: number, hostname: string) {
		return this.fetchJson<Source>(new Request('FindSource', tabId, null, 'GET', '/Extension/FindSource', { hostname }));
	}
	public getUserArticle(tabId: number, data: PageInfo) {
		return this
			.fetchJson<{
				userArticle: UserArticle,
				userPage: UserPage
			}>(new Request('GetUserArticle', tabId, null, 'POST', '/Extension/GetUserArticle', data))
			.then(result => {
				this._articles.set(result.userArticle)
				return result;
			});
	}
	public getUserArticleFromCache(id: string) {
		return Promise.resolve(this._articles.get(id));
	}
	public commitReadState(data: ReadStateCommitData) {
		this.fetchJson<UserArticle>(new Request('CommitReadState', null, null, 'POST', '/Extension/CommitReadState', data))
			.then(userArticle => {
				this._articles.set(userArticle);
				this._onCacheUpdated();
			});
	}
	public getRequests(tab: ContentScriptTab) {
		return this._requests.filter(r => r.tabId === tab.id || (tab.articleId ? r.articleId === tab.articleId : false));
	}
	public get eventPageOptions() {
		return this._eventPageOptions;
	}
	public get contentScriptOptions() {
		return this._contentScriptOptions;
	}
	public getAuthStatus() {
		return new Promise<boolean>((resolve, reject) => {
			try {
				chrome.cookies.get({
					url: 'http://dev.reallyread.it',
					name: 'sessionKey'
				}, cookie => resolve(!!cookie));
			} catch (ex) {
				reject();
			}
		});
	}
	public clearCache() {
		this._articles.clear();
	}
}