import Source from '../../common/models/Source';
import UserArticle from '../../common/models/UserArticle';
import UserPage from '../../common/models/UserPage';
import NewReplyNotification, { isStateEqual as isNotificationStateEqual, shouldShowDesktopNotification } from '../../common/models/NewReplyNotification';
import SetStore from './SetStore';
import ObjectStore from './ObjectStore';
import ParseResult from '../common/ParseResult';
import ReadStateCommitData from '../common/ReadStateCommitData';
import Request from './Request';
import RequestType from './RequestType';
import ContentScriptTab from '../common/ContentScriptTab';
import readingParameters from '../../common/readingParameters';
import { Cached, cache, isExpired } from './Cached';
import Comment from '../../common/models/Comment';

export default class ServerApi {
	private static _newReplyNotificationAlarmName = 'ServerApi.checkNewReplyNotification';
	// static config parameters
	private _eventPageConfig = {
		articleUnlockThreshold: readingParameters.articleUnlockThreshold
	};
	private _contentScriptConfig = {
		readWordRate: 100,
		idleReadRate: 1000,
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
	// ephemeral requests store
	private _requests: Request[] = [];
	// handlers
	private _onRequestChanged: (type: RequestType) => void;
	private _onCacheUpdated: () => void;
	constructor(handlers: {
		onAuthenticationStatusChanged: (isAuthenticated: boolean) => void,
		onRequestChanged: (type: RequestType) => void,
		onCacheUpdated: () => void
	}) {
		// extension install
		chrome.runtime.onInstalled.addListener(details => this.clearCache());
		// cookie change
		chrome.cookies.onChanged.addListener(changeInfo => {
			if (changeInfo.cookie.name === 'sessionKey') {
				this.clearCache();
				handlers.onAuthenticationStatusChanged(!changeInfo.removed);
			}
		});
		// notifications
		chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
			if (message.type === 'updateNewReplyNotification') {
				this.processNewReplyNotification(message.data);
			}
		});
		chrome.alarms.onAlarm.addListener(alarm => {
			if (alarm.name === ServerApi._newReplyNotificationAlarmName) {
				this.getAuthStatus().then(isAuthenticated => {
					if (isAuthenticated && isExpired(this._newReplyNotification.get())) {
						this.fetchJson<NewReplyNotification>(new Request(RequestType.CacheRefresh, null, null, 'GET', '/UserAccounts/CheckNewReplyNotification'))
							.then(notification => this.processNewReplyNotification(notification));
					}
				});
			}
		});
		chrome.alarms.create(ServerApi._newReplyNotificationAlarmName, {
			when: Date.now(),
			periodInMinutes: 1
		});
		chrome.notifications.onClicked.addListener(url => window.open(url));
		// handlers
		this._onRequestChanged = handlers.onRequestChanged;
		this._onCacheUpdated = handlers.onCacheUpdated;
	}
	private clearCache() {
		this._newReplyNotification.clear();
		this._articles.clear();
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
					this.fetchJson<Comment>(new Request(RequestType.DesktopNotification, null, null, 'POST', '/UserAccounts/CreateDesktopNotification'))
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
	private fetchJson<T>(request: Request) {
		const removeRequest = () => {
			this._requests.splice(this._requests.indexOf(request), 1)
			this._onRequestChanged(request.type);
		};
		this._requests.push(request);
		this._onRequestChanged(request.type);
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest(),
				url = `${config.api.protocol}://${config.api.host}` + request.path;
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
				req.open(request.method, url);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(request.query));
			} else {
				req.open(request.method, url + request.getQueryString());
				req.send();
			}
		});
	}
	public findSource(tabId: number, hostname: string) {
		return this.fetchJson<Source>(new Request(RequestType.FindSource, tabId, null, 'GET', '/Extension/FindSource', { hostname }));
	}
	public registerPage(tabId: number, data: ParseResult) {
		return this.fetchJson<{
				userArticle: UserArticle,
				userPage: UserPage
			}>(new Request(RequestType.FindUserArticle, tabId, null, 'POST', '/Extension/GetUserArticle', data))
			.then(result => {
				this.cacheArticle(result.userArticle);
				return result;
			});
	}
	public getUserArticle(id: string) {
		const userArticle = this._articles.get(id);
		if (userArticle && isExpired(userArticle) && !this._requests.some(r => r.articleId === id)) {
			this.fetchJson<UserArticle>(new Request(RequestType.CacheRefresh, null, id, 'GET', '/Extension/UserArticle', { id }))
				.then(userArticle => this.cacheArticle(userArticle));
		}
		return userArticle && userArticle.value;
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		this.fetchJson<UserArticle>(new Request(RequestType.CommitReadState, tabId, null, 'POST', '/Extension/CommitReadState', data))
			.then(userArticle => this.cacheArticle(userArticle));
	}
	public getRequests(tab: ContentScriptTab) {
		return this._requests.filter(r => r.tabId === tab.id || (tab.articleId ? r.articleId === tab.articleId : false));
	}
	public getAuthStatus() {
		return new Promise(resolve => chrome.cookies.get({
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
		this.fetchJson(new Request(RequestType.NotificationAck, null, null, 'POST', '/UserAccounts/AckNewReply'));
	}
	public get eventPageConfig() {
		return this._eventPageConfig;
	}
	public get contentScriptConfig() {
		return this._contentScriptConfig;
	}
}