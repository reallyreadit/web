import EventPageConfig from './EvetPageConfig';
import ContentScriptConfig from '../common/ContentScriptConfig';
import Source from '../common/Source';
import UserArticle from './UserArticle';
import UserPage from '../common/UserPage';
import ObjectStore from './ObjectStore';
import PageInfo from '../common/PageInfo';
import ReadStateCommitData from '../common/ReadStateCommitData';
import Request from './Request';
import RequestType from './RequestType';
import ContentScriptTab from './ContentScriptTab';

export default class ServerApi {
	private static getUrl(path: string) {
		return `${config.api.protocol}://${config.api.host}` + path;
	}
	private static parseResponse(request: XMLHttpRequest, handler: (data: any) => void, defaultValue?: any) {
		const contentType = request.getResponseHeader('Content-Type');
		if (contentType && contentType.startsWith('application/json')) {
			handler(JSON.parse(request.responseText));
		} else {
			handler(defaultValue);
		}
	}
	private _eventPageConfig: EventPageConfig;
	private _contentScriptConfig: ContentScriptConfig;
	private _articles = new ObjectStore<string, UserArticle>('articles', 'local', a => a.id);
	private _requests: Request[] = [];
	private _onRequestChanged: (type: RequestType) => void;
	private _onCacheUpdated: () => void;
	constructor(handlers: {
		onAuthenticationStatusChanged: (isAuthenticated: boolean) => void,
		onRequestChanged: (type: RequestType) => void,
		onCacheUpdated: () => void
	}) {
		// configs
		this._eventPageConfig = {
			articleUnlockThreshold: 90
		};
		this._contentScriptConfig = {
			wordReadRate: 100,
			idleReadRate: 3000,
			pageOffsetUpdateRate: 3000,
			readStateCommitRate: 3000,
			urlCheckRate: 1000
		};
		// authentication
		chrome.cookies.onChanged.addListener(changeInfo => {
			if (changeInfo.cookie.name === 'sessionKey') {
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
			this._onRequestChanged(request.type);
		};
		this._requests.push(request);
		this._onRequestChanged(request.type);
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
		return this.fetchJson<Source>(new Request(RequestType.FindSource, tabId, null, 'GET', '/Extension/FindSource', { hostname }));
	}
	public registerPage(tabId: number, data: PageInfo) {
		return this
			.fetchJson<{
				userArticle: UserArticle,
				userPage: UserPage
			}>(new Request(RequestType.GetUserArticle, tabId, null, 'POST', '/Extension/GetUserArticle', data))
			.then(result => {
				this._articles.set(result.userArticle)
				return result;
			});
	}
	public getUserArticle(id: string) {
		return Promise.resolve(this._articles.get(id));
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		this.fetchJson<UserArticle>(new Request(RequestType.CommitReadState, tabId, null, 'POST', '/Extension/CommitReadState', data))
			.then(userArticle => {
				this._articles.set(userArticle);
				this._onCacheUpdated();
			});
	}
	public getRequests(tab: ContentScriptTab) {
		return this._requests.filter(r => r.tabId === tab.id || (tab.articleId ? r.articleId === tab.articleId : false));
	}
	public get eventPageConfig() {
		return this._eventPageConfig;
	}
	public get contentScriptConfig() {
		return this._contentScriptConfig;
	}
	public getAuthStatus() {
		return new Promise<boolean>((resolve, reject) => {
			try {
				chrome.cookies.get({
					url: `${config.api.protocol}://${config.api.host}`,
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