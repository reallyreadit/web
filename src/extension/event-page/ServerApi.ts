import EventPageConfig from './EvetPageConfig';
import ContentScriptConfig from '../common/ContentScriptConfig';
import Source from './Source';
import UserArticle from '../common/UserArticle';
import UserPage from '../common/UserPage';
import ObjectStore from './ObjectStore';
import ParseResult from '../common/ParseResult';
import ReadStateCommitData from '../common/ReadStateCommitData';
import Request from './Request';
import RequestType from './RequestType';
import ContentScriptTab from './ContentScriptTab';
import readingParameters from '../../common/readingParameters';
import { Cached, cache, isExpired } from './Cached';

export default class ServerApi {
	private static getUrl(path: string) {
		return `${config.api.protocol}://${config.api.host}` + path;
	}
	private _eventPageConfig: EventPageConfig;
	private _contentScriptConfig: ContentScriptConfig;
	private _articles = new ObjectStore<string, Cached<UserArticle>>('articles', 'local', a => a.value.id);
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
			articleUnlockThreshold: readingParameters.articleUnlockThreshold
		};
		this._contentScriptConfig = {
			readWordRate: 100,
			idleReadRate: 1000,
			pageOffsetUpdateRate: 3000,
			readStateCommitRate: 3000
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
	private _cache(userArticle: UserArticle) {
		this._articles.set(cache(userArticle, 60000));
		this._onCacheUpdated();
	}
	private _fetchJson<T>(request: Request) {
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
				switch (this.status) {
					case 200:
						if (parseInt(this.getResponseHeader('Content-Length'))) {
							resolve(JSON.parse(this.responseText));
						} else {
							resolve();
						}
						break;
					case 400:
						// TODO: update api server to always return JSON on bad request response
						const contentType = this.getResponseHeader('Content-Type');
						if (contentType && contentType.startsWith('application/json')) {
							reject(JSON.parse(this.responseText));
						} else {
							reject([]);
						}
						break;
					case 401:
						// cookie will be cleared by http response
						// auth logic handled by cookie change listener
						reject(['Unauthenticated']);
						break;
					default:
						reject([]);
						break;
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
		return this._fetchJson<Source>(new Request(RequestType.FindSource, tabId, null, 'GET', '/Extension/FindSource', { hostname }));
	}
	public registerPage(tabId: number, data: ParseResult) {
		return this._fetchJson<{
				userArticle: UserArticle,
				userPage: UserPage
			}>(new Request(RequestType.FindUserArticle, tabId, null, 'POST', '/Extension/GetUserArticle', data))
			.then(result => {
				this._cache(result.userArticle);
				return result;
			});
	}
	public getUserArticle(id: string) {
		const userArticle = this._articles.get(id);
		if (userArticle && isExpired(userArticle) && !this._requests.some(r => r.articleId === id)) {
			this._fetchJson<UserArticle>(new Request(RequestType.CacheRefresh, null, id, 'GET', '/Extension/UserArticle', { id }))
				.then(userArticle => this._cache(userArticle));
		}
		return userArticle && userArticle.value;
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		this._fetchJson<UserArticle>(new Request(RequestType.CommitReadState, tabId, null, 'POST', '/Extension/CommitReadState', data))
			.then(userArticle => this._cache(userArticle));
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