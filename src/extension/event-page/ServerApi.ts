import UserArticle from '../../common/models/UserArticle';
import UserPage from '../../common/models/UserPage';
import NewReplyNotification, { isStateEqual as isNotificationStateEqual, shouldShowDesktopNotification } from '../../common/models/NewReplyNotification';
import SetStore from '../../common/webStorage/SetStore';
import ObjectStore from '../../common/webStorage/ObjectStore';
import ParseResult from '../../common/reading/ParseResult';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import Request from './Request';
import { Cached, cache, isExpired } from './Cached';
import Comment from '../../common/models/Comment';
import SourceRule from '../../common/models/SourceRule';
import { createUrl } from '../../common/HttpEndpoint';
import Rating from '../../common/models/Rating';
import { createQueryString } from '../../common/routing/queryString';

function addCustomHeaders(req: XMLHttpRequest, params: Request) {
	req.setRequestHeader('X-Readup-Client', `web/extension@${config.version}`);
	if (params.context) {
		req.setRequestHeader('X-Readup-Context', params.context);
	}
}
function fetchJson<T>(request: Request) {
	return new Promise<T>((resolve, reject) => {
		const
			req = new XMLHttpRequest(),
			url = createUrl(config.api, request.path);
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
					url: createUrl(config.api),
					name: config.cookieName
				});
				// mirror reallyread.it auth cookie to readup.com
				chrome.cookies.remove({
					url: 'https://readup.com/',
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
			addCustomHeaders(req, request);
			req.setRequestHeader('Content-Type', 'application/json');
			req.send(JSON.stringify(request.data));
		} else {
			req.open(request.method, url + createQueryString(request.data));
			addCustomHeaders(req, request);
			req.send();
		}
	});
}
export default class ServerApi {
	private static _alarms = {
		checkNewReplyNotification: 'ServerApi.checkNewReplyNotification',
		getSourceRules: 'ServerApi.getSourceRules'
	};
	// cached local storage
	private _newReplyNotification = new ObjectStore<Cached<NewReplyNotification>>('newReplyNotification', {
		value: {
			lastReply: 0,
			lastNewReplyAck: 0,
			lastNewReplyDesktopNotification: 0,
			timestamp: 0
		},
		timestamp: 0,
		expirationTimespan: 0
	});
	private _articles = new SetStore<number, Cached<UserArticle>>('articles', a => a.value.id);
	private _sourceRules = new ObjectStore<Cached<SourceRule[]>>('sourceRules', {
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
			if (changeInfo.cookie.domain === '.' + config.cookieDomain && changeInfo.cookie.name === config.cookieName) {
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
				// mirror reallyread.it auth cookie to readup.com
				if (isAuthenticated) {
					chrome.cookies.set({
						url: 'https://readup.com/',
						name: 'sessionKey',
						value: changeInfo.cookie.value,
						domain: '.readup.com',
						secure: true,
						httpOnly: true,
						expirationDate: changeInfo.cookie.expirationDate
					});
				} else {
					chrome.cookies.remove({
						url: 'https://readup.com/',
						name: 'sessionKey'
					});
				}
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
							fetchJson<NewReplyNotification>({ method: 'GET', path: '/UserAccounts/CheckNewReplyNotification' })
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
					fetchJson<Comment>({ method: 'POST',  path: '/UserAccounts/CreateDesktopNotification' })
						.then(reply => {
							if (reply) {
								const now = Date.now();
								this.processNewReplyNotification({
									...this._newReplyNotification.get().value,
									lastNewReplyDesktopNotification: now,
									timestamp: now
								});
								chrome.notifications.create(
									createUrl(config.web, '/viewReply/' + reply.id),
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
			fetchJson<SourceRule[]>({ method: 'GET', path: '/Extension/GetSourceRules' })
				.then(rules => this._sourceRules.set(cache(rules, 719000)))
				.catch(() => {});
		}
	}
	private logRequest<T>(request: Request, store: Request[]) {
		const removeRequest = () => {
			store.splice(store.indexOf(request), 1)
		};
		store.push(request);
		return fetchJson<T>(request)
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
			}>({ method: 'POST', path: '/Extension/GetUserArticle', data, id: tabId }, this._articleLookupRequests)
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
	public getUserArticle(id: number) {
		const userArticle = this._articles.get(id);
		if (userArticle && isExpired(userArticle) && !this._articleCacheRequets.some(r => r.id === id)) {
			this
				.logRequest<UserArticle>({ method: 'GET', path: '/Extension/UserArticle', data: { id }, id }, this._articleCacheRequets)
				.then(userArticle => this.cacheArticle(userArticle))
				.catch(() => {});
		}
		return userArticle && userArticle.value;
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		return fetchJson<UserArticle>({ method: 'POST', path: '/Extension/CommitReadState', data })
			.then(userArticle => {
				this.cacheArticle(userArticle);
				return userArticle;
			});
	}
	public getArticleLookupRequests(tabId: number) {
		return this._articleLookupRequests.filter(r => r.id === tabId);
	}
	public getAuthStatus() {
		return new Promise<boolean>(resolve => chrome.cookies.get({
			url: createUrl(config.api),
			name: config.cookieName
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
		fetchJson({ method: 'POST', path: '/UserAccounts/AckNewReply' })
			.catch(() => {});
	}
	public getSourceRules(hostname: string) {
		return this._sourceRules.get().value.filter(rule => hostname.endsWith(rule.hostname));
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return fetchJson<UserArticle>({ method: 'POST', path: '/Extension/SetStarred', data: { articleId, isStarred } })
			.then(userArticle => {
				this.cacheArticle(userArticle);
				return userArticle;
			})
			.catch(() => {});
	}
	public rateArticle(articleId: number, score: number) {
		return fetchJson<Rating>({
			method: 'POST',
			path: '/Articles/Rate',
			data: { articleId, score }
		});
	}
}