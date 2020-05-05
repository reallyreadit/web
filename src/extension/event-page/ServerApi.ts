import UserArticle from '../../common/models/UserArticle';
import SetStore from '../../common/webStorage/SetStore';
import ObjectStore from '../../common/webStorage/ObjectStore';
import ParseResult from '../../common/reading/ParseResult';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import Request from './Request';
import { Cached, cache, isExpired } from './Cached';
import { createUrl } from '../../common/HttpEndpoint';
import { createQueryString } from '../../common/routing/queryString';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import CommentThread from '../../common/models/CommentThread';
import CommentForm from '../../common/models/social/CommentForm';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import UserAccount, { areEqual } from '../../common/models/UserAccount';
import NotificationsQueryResult from '../common/models/NotificationsQueryResult';
import DisplayedNotification from './DisplayedNotification';
import Rating from '../../common/models/Rating';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';
import TwitterRequestToken from '../../common/models/auth/TwitterRequestToken';
import ArticleIssueReportRequest from '../../common/models/analytics/ArticleIssueReportRequest';

function addCustomHeaders(req: XMLHttpRequest, params: Request) {
	req.setRequestHeader('X-Readup-Client', `web/extension@${window.reallyreadit.extension.config.version}`);
	if (params.context) {
		req.setRequestHeader('X-Readup-Context', params.context);
	}
}
function fetchJson<T>(request: Request) {
	return new Promise<T>((resolve, reject) => {
		const
			req = new XMLHttpRequest(),
			url = createUrl(window.reallyreadit.extension.config.api, request.path);
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
					reject(object || ['ServerApi XMLHttpRequest load event. Status: ' + this.status + ' Status text: ' + this.statusText + ' Response text: ' + this.responseText]);
				}
			} else {
				reject(['ServerApi XMLHttpRequest load event. Status: ' + this.status + ' Status text: ' + this.statusText + ' Response text: ' + this.responseText]);
			}
		});
		req.addEventListener('error', function () {
			reject(['ServerApi XMLHttpRequest error event']);
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
	public static alarms = {
		checkNotifications: 'ServerApi.checkNotifications',
		getBlacklist: 'ServerApi.getBlacklist'
	};
	// cached local storage
	private _displayedNotifications = new SetStore<string, DisplayedNotification>(
		'displayedNotifications',
		notification => notification.id
	);
	private _blacklist = new ObjectStore<Cached<string[]>>('blacklist', {
		value: [],
		timestamp: 0,
		expirationTimespan: 0
	});
	private _user = new ObjectStore<UserAccount>('user', null);
	// handlers
	private readonly _onUserUpdated: (user: UserAccount) => void;
	constructor(handlers: {
		onAuthenticationStatusChanged: (isAuthenticated: boolean) => void,
		onUserUpdated: (user: UserAccount) => void
	}) {
		// extension install
		chrome.runtime.onInstalled.addListener(details => {
			// clear entire cache
			this._displayedNotifications.clear();
			this._blacklist.clear();
			this._user.clear();
		});
		// cookie change
		chrome.cookies.onChanged.addListener(changeInfo => {
			if (changeInfo.cookie.domain === '.' + window.reallyreadit.extension.config.cookieDomain && changeInfo.cookie.name === window.reallyreadit.extension.config.cookieName) {
				const isAuthenticated = !changeInfo.removed;
				// clear user specific cache
				this._displayedNotifications.clear();
				this._user.clear();
				// check source rules cache
				if (isAuthenticated) {
					this.checkNotifications();
					this.checkBlacklistCache();
				}
				// fire handler
				handlers.onAuthenticationStatusChanged(isAuthenticated);
			}
		});
		// alarms
		chrome.alarms.onAlarm.addListener(alarm => {
			switch (alarm.name) {
				case ServerApi.alarms.checkNotifications:
					this
						.getAuthStatus()
						.then(
							isAuthenticated => {
								if (isAuthenticated) {
									this.checkNotifications();
								}
							}
						);
					break;
				case ServerApi.alarms.getBlacklist:
					this.getAuthStatus().then(isAuthenticated => {
						if (isAuthenticated) {
							this.checkBlacklistCache();
						}
					});
					break;
			}
		});
		// notifications
		chrome.notifications.onClicked.addListener(
			id => {
				chrome.tabs.create({
					url: createUrl(window.reallyreadit.extension.config.api, '/Extension/Notification/' + id)
				});
			}
		);
		// handlers
		this._onUserUpdated = handlers.onUserUpdated;
	}
	private checkNotifications() {
		chrome.notifications.getAll(
			chromeNotifications => {
				const
					now = Date.now(),
					displayedNotificationExpiration = now - (2 * 60 * 1000),
					{
						current: currentNotifications,
						expired: expiredNotifications
					} = this._displayedNotifications
						.getAll()
						.reduce<{
							current: DisplayedNotification[],
							expired: DisplayedNotification[]
						}>(
							(result, notification) => {
								if (notification.date >= displayedNotificationExpiration) {
									result.current.push(notification);
								} else {
									result.expired.push(notification);
								}
								return result;
							},
							{
								current: [],
								expired: []
							}
						);
				expiredNotifications.forEach(
					notification => {
						this._displayedNotifications.remove(notification.id);
					}
				);
				fetchJson<NotificationsQueryResult>({
						method: 'GET',
						path: '/Extension/Notifications',
						data: {
							ids: Object
								.keys(chromeNotifications)
								.concat(
									currentNotifications
										.filter(
											notification => !(notification.id in chromeNotifications)
										)
										.map(
											notification => notification.id
										)
								)
						}
					})
					.then(
						result => {
							result.cleared.forEach(
								id => {
									chrome.notifications.clear(id);
									this._displayedNotifications.remove(id);
								}
							);
							result.created.forEach(
								notification => {
									chrome.notifications.create(
										notification.id,
										{
											type: 'basic',
											iconUrl: '../icons/icon.svg',
											title: notification.title,
											message: notification.message,
											isClickable: true
										}
									);
									this._displayedNotifications.set({
										id: notification.id,
										date: Date.now()
									});
								}
							);
							const currentUser = this._user.get();
							if (!areEqual(currentUser, result.user)) {
								this._user.set(result.user);
								this._onUserUpdated(result.user);
							}
						}
					)
					.catch(
						() => { }
					);	
			}
		);
	}
	private checkBlacklistCache() {
		if (isExpired(this._blacklist.get())) {
			fetchJson<string[]>({ method: 'GET', path: '/Extension/Blacklist' })
				.then(rules => this._blacklist.set(cache(rules, 719000)))
				.catch(() => {});
		}
	}
	public registerPage(tabId: number, data: ParseResult) {
		return fetchJson<ArticleLookupResult>({
			method: 'POST',
			path: '/Extension/GetUserArticle',
			data,
			id: tabId
		});
	}
	public getComments(slug: string) {
		return fetchJson<CommentThread[]>({
			method: 'GET',
			path: '/Articles/ListComments',
			data: { slug }
		});
	}
	public postArticle(form: PostForm) {
		return fetchJson<Post>({
			method: 'POST',
			path: '/Social/Post',
			data: form
		});
	}
	public postComment(form: CommentForm) {
		return fetchJson<{
			article: UserArticle,
			comment: CommentThread
		}>({
			method: 'POST',
			path: '/Social/Comment',
			data: form
		});
	}
	public postCommentAddendum(form: CommentAddendumForm) {
		return fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentAddendum',
			data: form
		});
	}
	public postCommentRevision(form: CommentRevisionForm) {
		return fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentRevision',
			data: form
		});
	}
	public deleteComment(form: CommentDeletionForm) {
		return fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentDeletion',
			data: form
		});
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		return fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/CommitReadState',
			data
		});
	}
	public getAuthStatus() {
		return new Promise<boolean>(resolve => chrome.cookies.get({
			url: createUrl(window.reallyreadit.extension.config.web),
			name: window.reallyreadit.extension.config.cookieName
		}, cookie => resolve(!!cookie)));
	}
	public getBlacklist() {
		return this._blacklist
			.get().value
			.map(
				pattern => new RegExp(pattern)
			);
	}
	public rateArticle(articleId: number, score: number) {
		return fetchJson<{
			article: UserArticle,
			rating: Rating
		}>({
			method: 'POST',
			path: '/Articles/Rate',
			data: {
				articleId,
				score
			}
		});
	}
	public reportArticleIssue(request: ArticleIssueReportRequest) {
		return fetchJson<void>({
			method: 'POST',
			path: '/Analytics/ArticleIssueReport',
			data: request
		});
	}
	public requestTwitterBrowserLinkRequestToken() {
		return fetchJson<TwitterRequestToken>({
			method: 'POST',
			path: '/Auth/TwitterBrowserLinkRequest'
		});
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/SetStarred',
			data: {
				articleId,
				isStarred
			}
		});
	}
	public logExtensionInstallation(platformInfo: Pick<chrome.runtime.PlatformInfo, 'arch' | 'os'>) {
		return fetchJson<{ installationId: string }>({
			method: 'POST',
			path: '/Extension/Install',
			data: platformInfo
		});
	}
	public getUser() {
		return this._user.get();
	}
	public updateUser(user: UserAccount) {
		this._user.set(user || null);
	}
}