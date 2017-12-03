import UserArticle from '../../common/models/UserArticle';
import UserPage from '../../common/models/UserPage';
import NewReplyNotification, { isStateEqual as isNotificationStateEqual, shouldShowDesktopNotification } from '../../common/models/NewReplyNotification';
import SetStore from './SetStore';
import ObjectStore from './ObjectStore';
import ParseResult from '../common/ParseResult';
import ReadStateCommitData from '../common/ReadStateCommitData';
import Request from './Request';
import { Cached, cache, isExpired } from './Cached';
import Comment from '../../common/models/Comment';
import SourceRule from '../../common/models/SourceRule';

export default class ServerApi {
	private static _alarms = {
		checkNewReplyNotification: 'ServerApi.checkNewReplyNotification',
		getSourceRules: 'ServerApi.getSourceRules'
	};
	private static fetchJson<T>(request: Request) {
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest(),
				url = `${config.api.protocol}://${config.api.host}` + request.path;
			req.withCredentials = true;
			req.addEventListener('load', function () {
				if (this.status === 200 || this.status === 400) {
					const contentType = this.getResponseHeader('Content-Type');
					let object: any;
					if (contentType && contentType.startsWith('application/json')) {
						object = JSON.parse(this.responseText);
					}
					if (this.status === 200) {
						if (object) {
							resolve(object);
						} else {	
							resolve();
						}
					} else {
						reject(object || []);
					}
				} else if (this.status === 401) {
					chrome.cookies.remove({
						url: `${config.api.protocol}://${config.api.host}`,
						name: 'sessionKey'
					});
					reject(['Unauthenticated']);
				} else {
					reject([]);
				}
			});
			req.addEventListener('error', function () {
				reject([]);
			});
			if (request.method === 'POST') {
				req.open(request.method, url);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(request.data));
			} else {
				req.open(request.method, url + request.getQueryString());
				req.send();
			}
		});
	}
	// static config parameters
	private _contentScriptConfig = {
		readWordRate: 100,
		idleReadRate: 500,
		pageOffsetUpdateRate: 3000,
		readStateCommitRate: 3000
	};
	// cached local storage
	private _newReplyNotification = new ObjectStore<Cached<NewReplyNotification>>('newReplyNotification', 'local', {
		value: {
			lastReply: 0,
			lastNewReplyAck: 0,
			lastNewReplyDesktopNotification: 0,
			timestamp: 0
		},
		timestamp: 0,
		expirationTimespan: 0
	});
	private _articles = new SetStore<string, Cached<UserArticle>>('articles', 'local', a => a.value.id);
	private _sourceRules = new ObjectStore<Cached<SourceRule[]>>('sourceRules', 'local', {
		value: [],
		timestamp: 0,
		expirationTimespan: 0
	});
	// ephemeral requests stores
	private _articleLookupRequests: Request[] = [];
	private _articleCacheRequets: Request[] = [];
	// handlers
	private _onArticleLookupRequestChanged: () => void;
	private _onCacheUpdated: () => void;
	constructor(handlers: {
		onAuthenticationStatusChanged: (isAuthenticated: boolean) => void,
		onArticleLookupRequestChanged: () => void,
		onCacheUpdated: () => void
	}) {
		// extension install
		chrome.runtime.onInstalled.addListener(details => {
			// clear entire cache
			this._newReplyNotification.clear();
			this._articles.clear();
			this._sourceRules.clear();
		});
		// cookie change
		chrome.cookies.onChanged.addListener(changeInfo => {
			if (changeInfo.cookie.name === 'sessionKey') {
				const isAuthenticated = !changeInfo.removed;
				// clear user specific cache
				this._newReplyNotification.clear();
				this._articles.clear();
				// check source rules cache
				if (isAuthenticated) {
					this.checkSourceRulesCache();
				}
				// fire handler
				handlers.onAuthenticationStatusChanged(isAuthenticated);
			}
		});
		// external message
		chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
			if (message.type === 'updateNewReplyNotification') {
				this.processNewReplyNotification(message.data);
			}
		});
		// alarms
		chrome.alarms.onAlarm.addListener(alarm => {
			switch (alarm.name) {
				case ServerApi._alarms.checkNewReplyNotification:
					this.getAuthStatus().then(isAuthenticated => {
						if (isAuthenticated && isExpired(this._newReplyNotification.get())) {
							ServerApi
								.fetchJson<NewReplyNotification>(new Request('GET', '/UserAccounts/CheckNewReplyNotification'))
								.then(notification => this.processNewReplyNotification(notification))
								.catch(() => {});
						}
					});
					break;
				case ServerApi._alarms.getSourceRules:
					this.getAuthStatus().then(isAuthenticated => {
						if (isAuthenticated) {
							this.checkSourceRulesCache();
						}
					});
					break;
			}
		});
		chrome.alarms.create(ServerApi._alarms.checkNewReplyNotification, {
			when: Date.now(),
			periodInMinutes: 1
		});
		chrome.alarms.create(ServerApi._alarms.getSourceRules, {
			when: Date.now(),
			periodInMinutes: 120
		});
		// notifications
		chrome.notifications.onClicked.addListener(url => window.open(url));
		// handlers
		this._onArticleLookupRequestChanged = handlers.onArticleLookupRequestChanged;
		this._onCacheUpdated = handlers.onCacheUpdated;
	}
	private cacheArticle(userArticle: UserArticle) {
		this._articles.set(cache(userArticle, 60000));
		this._onCacheUpdated();
	}
	private processNewReplyNotification(notification: NewReplyNotification) {
		const current = this._newReplyNotification.get();
		if (notification.timestamp > current.value.timestamp) {
			this._newReplyNotification.set(cache(notification, 50000));
			if (!isNotificationStateEqual(current.value, notification)) {
				if (shouldShowDesktopNotification(notification)) {
					ServerApi
						.fetchJson<Comment>(new Request('POST', '/UserAccounts/CreateDesktopNotification'))
						.then(reply => {
							if (reply) {
								const now = Date.now();
								this.processNewReplyNotification({
									...this._newReplyNotification.get().value,
									lastNewReplyDesktopNotification: now,
									timestamp: now
								});
								chrome.notifications.create(
									`${config.api.protocol}://${config.api.host}/UserAccounts/ViewReplyFromDesktopNotification/${reply.id}`,
									{
										type: 'basic',
										iconUrl: '../icons/desktop-notification-icon.svg',
										title: `${reply.userAccount} just replied to your comment re: ${reply.articleTitle}`,
										message: 'Click here to view the reply in the comment thread.',
										isClickable: true
									}
								);
							}
						})
						.catch(() => {});
				}
				this._onCacheUpdated();
			}
		}
	}
	private checkSourceRulesCache() {
		if (isExpired(this._sourceRules.get())) {
			ServerApi
				.fetchJson<SourceRule[]>(new Request('GET', '/Extension/GetSourceRules'))
				.then(rules => this._sourceRules.set(cache(rules, 719000)))
				.catch(() => {});
		}
	}
	private logRequest<T>(request: Request, store: Request[]) {
		const removeRequest = () => {
			store.splice(store.indexOf(request), 1)
		};
		store.push(request);
		return ServerApi
			.fetchJson<T>(request)
			.then(res => {
				removeRequest();
				return res;
			})
			.catch(reason => {
				removeRequest();
				throw reason;
			});
	}
	public registerPage(tabId: number, data: ParseResult) {
		const request = this.logRequest<{
				userArticle: UserArticle,
				userPage: UserPage
			}>(new Request(tabId, 'POST', '/Extension/GetUserArticle', data), this._articleLookupRequests)
			.then(result => {
				this._onArticleLookupRequestChanged();
				this.cacheArticle(result.userArticle);
				return result;
			})
			.catch(reason => {
				this._onArticleLookupRequestChanged();
				throw reason;
			});
		this._onArticleLookupRequestChanged();
		return request;
	}
	public getUserArticle(id: string) {
		const userArticle = this._articles.get(id);
		if (userArticle && isExpired(userArticle) && !this._articleCacheRequets.some(r => r.id === id)) {
			this
				.logRequest<UserArticle>(new Request(id, 'GET', '/Extension/UserArticle', { id }), this._articleCacheRequets)
				.then(userArticle => this.cacheArticle(userArticle))
				.catch(() => {});
		}
		return userArticle && userArticle.value;
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		ServerApi
			.fetchJson<UserArticle>(new Request('POST', '/Extension/CommitReadState', data))
			.then(userArticle => this.cacheArticle(userArticle))
			.catch(() => {});
	}
	public getArticleLookupRequests(tabId: number) {
		return this._articleLookupRequests.filter(r => r.id === tabId);
	}
	public getAuthStatus() {
		return new Promise<boolean>(resolve => chrome.cookies.get({
			url: `${config.api.protocol}://${config.api.host}`,
			name: 'sessionKey'
		}, cookie => resolve(!!cookie)));
	}
	public hasNewReply() {
		const notif = this._newReplyNotification.get().value;
		return notif.lastReply > notif.lastNewReplyAck;
	}
	public ackNewReply() {
		const now = Date.now();
		this.processNewReplyNotification({
			...this._newReplyNotification.get().value,
			lastNewReplyAck: now,
			timestamp: now
		});
		ServerApi
			.fetchJson(new Request('POST', '/UserAccounts/AckNewReply'))
			.catch(() => {});
	}
	public getSourceRules(hostname: string) {
		return this._sourceRules.get().value.filter(rule => hostname.endsWith(rule.hostname));
	}
	public setStarred(articleId: string, isStarred: boolean) {
		return ServerApi
			.fetchJson<UserArticle>(new Request('POST', '/Extension/SetStarred', { articleId, isStarred }))
			.then(userArticle => this.cacheArticle(userArticle))
			.catch(() => {});
	}
	public get contentScriptConfig() {
		return this._contentScriptConfig;
	}
}