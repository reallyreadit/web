import UserArticle from '../../common/models/UserArticle';
import ParseResult from '../../common/reading/ParseResult';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ReadupRequest from './Request';
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
import DisplayPreference, {
	areEqual as areDisplayPreferencesEqual,
	getClientDefaultDisplayPreference,
} from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import InstallationRequest from '../../common/models/extension/InstallationRequest';
import InstallationResponse from '../../common/models/extension/InstallationResponse';
import CommentCreationResponse from '../../common/models/social/CommentCreationResponse';
import AsyncObjectStore from '../common/storage/AsyncObjectStore';
import AsyncSetStore from '../common/storage/AsyncSetStore';

function getCustomHeaders() {
	return {
		'X-Readup-Client': `web/extension@${window.reallyreadit.extension.config.version.extension}`,
	};
}

/**
 * An API for the event page to communicate with Readup's resource API.
 */
export default class ServerApi {
	public static alarms = {
		checkNotifications: 'ServerApi.checkNotifications',
		getBlacklist: 'ServerApi.getBlacklist',
	};
	// cached local storage
	private _displayedNotifications = new AsyncSetStore<
		string,
		DisplayedNotification
	>('displayedNotifications', (notification) => notification.id);
	private _displayPreference = new AsyncObjectStore<DisplayPreference | null>(
		'displayPreference',
		null
	);
	private _blacklist = new AsyncObjectStore<Cached<string[]>>('blacklist', {
		value: [],
		timestamp: 0,
		expirationTimespan: 0,
	});
	private _user = new AsyncObjectStore<UserAccount>('user', null);

	public async initializeAsyncStores() {
		await this._blacklist.initialized();
		await this._displayPreference.initialized();
		await this._user.initialized();
		await this._displayedNotifications.initialized();
	}

	// handlers
	private readonly _onDisplayPreferenceChanged: (
		preference: DisplayPreference
	) => void;
	private readonly _onUserSignedOut: () => void;
	private readonly _onUserUpdated: (user: UserAccount) => void;
	constructor(handlers: {
		onDisplayPreferenceChanged: (preference: DisplayPreference) => void;
		onUserSignedOut: () => void;
		onUserUpdated: (user: UserAccount) => void;
	}) {
		// alarms
		chrome.alarms.onAlarm.addListener((alarm) => {
			if (!this.isAuthenticated()) {
				return;
			}
			switch (alarm.name) {
				case ServerApi.alarms.checkNotifications:
					this.checkNotifications();
					break;
				case ServerApi.alarms.getBlacklist:
					this.checkBlacklistCache();
					break;
			}
		});
		// notifications
		if (chrome.notifications) {
			chrome.notifications.onClicked.addListener((id) => {
				chrome.tabs.create({
					url: createUrl(
						window.reallyreadit.extension.config.apiServer,
						'/Extension/Notification/' + id
					),
				});
			});
		}
		// handlers
		this._onDisplayPreferenceChanged = handlers.onDisplayPreferenceChanged;
		this._onUserSignedOut = handlers.onUserSignedOut;
		this._onUserUpdated = handlers.onUserUpdated;
	}

	private checkNotifications() {
		if (!chrome.notifications) {
			return;
		}
		chrome.notifications.getAll(async (chromeNotifications) => {
			const now = Date.now(),
				displayedNotificationExpiration = now - 2 * 60 * 1000,
				{ current: currentNotifications, expired: expiredNotifications } = (
					await this._displayedNotifications.getAll()
				).reduce<{
					current: DisplayedNotification[];
					expired: DisplayedNotification[];
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
						expired: [],
					}
				);
			await Promise.all(
				expiredNotifications.map(async (notification) => {
					await this._displayedNotifications.remove(notification.id);
				})
			);
			this.fetchJson<NotificationsQueryResult>({
				method: 'GET',
				path: '/Extension/Notifications',
				data: {
					ids: Object.keys(chromeNotifications).concat(
						currentNotifications
							.filter(
								(notification) => !(notification.id in chromeNotifications)
							)
							.map((notification) => notification.id)
					),
				},
			})
				.then(async (result) => {
					await Promise.all(
						result.cleared.map(async (id) => {
							chrome.notifications.clear(id);
							await this._displayedNotifications.remove(id);
						})
					);
					await Promise.all(
						result.created.map(async (notification) => {
							chrome.notifications.create(notification.id, {
								type: 'basic',
								iconUrl: '../icons/icon.svg',
								title: notification.title,
								message: notification.message,
								isClickable: true,
							});
							await this._displayedNotifications.set({
								id: notification.id,
								date: Date.now(),
							});
						})
					);
					const currentUser = await this.getUser();
					if (!areEqual(currentUser, result.user)) {
						await this._user.set(result.user);
						// don't broadcast on sign in order to avoid sending stale data
						if (currentUser) {
							console.log(`[ServerApi] user updated (notification check)`);
							this._onUserUpdated(result.user);
						}
					}
				})
				.catch(() => {});
		});
	}
	private async checkBlacklistCache() {
		if (isExpired(await this._blacklist.get())) {
			this.fetchJson<string[]>({ method: 'GET', path: '/Extension/Blacklist' })
				.then((rules) => this._blacklist.set(cache(rules, 719000)))
				.catch(() => {});
		}
	}
	private async fetchJson<T>(request: ReadupRequest) {
		const _this = this;
		return new Promise<T>((resolve, reject) => {
			const url = createUrl(
				window.reallyreadit.extension.config.apiServer,
				request.path
			);

			// Prepare request
			let req: Request;
			if (request.method === 'POST') {
				req = new Request(url, {
					method: 'POST',
					credentials: 'include',
					headers: {
						...getCustomHeaders(),
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(request.data),
				});
			} else {
				req = new Request(`${url}${createQueryString(request.data)}`, {
					credentials: 'include',
					headers: {
						...getCustomHeaders(),
					},
				});
			}

			// Send request
			fetch(req)
				// Parse response
				.then((response: Response) => {
					const contentType = response.headers.get('Content-Type');
					if (
						contentType?.startsWith('application/json') ||
						contentType?.startsWith('application/problem+json')
					) {
						return response.json().then((object) => ({
							response,
							responseText: undefined,
							responseObject: object,
						}));
					}
					return response.text().then((text) => ({
						response,
						responseObject: undefined,
						responseText: text,
					}));
				})
				// Process response
				.then(
					({
						response,
						responseText,
						responseObject,
					}: {
						response: Response;
						responseText?: string;
						responseObject?: any;
					}) => {
						if (response.status === 200) {
							if (responseObject) {
								resolve(responseObject);
							} else {
								resolve(null);
							}
						} else {
							if (response.status === 401) {
								console.log(
									`[ServerApi] user signed out (received 401 response from API server)`
								);
								_this.userSignedOut();
								_this._onUserSignedOut();
							}
							reject(
								responseObject || [
									'ServerApi fetch response. Status: ' +
										response.status +
										' Status text: ' +
										response.statusText +
										' Response text: ' +
										responseText,
								]
							);
						}
					}
				)
				.catch(() => {
					reject(['ServerApi fetch error']);
				});
		});
	}
	public registerPage(tabId: number, data: ParseResult) {
		return this.fetchJson<ArticleLookupResult>({
			method: 'POST',
			path: '/Extension/GetUserArticle',
			data,
			id: tabId,
		});
	}
	public getArticleDetails(slug: string) {
		return this.fetchJson<UserArticle>({
			method: 'GET',
			path: '/Articles/Details',
			data: { slug },
		});
	}
	public getComments(slug: string) {
		return this.fetchJson<CommentThread[]>({
			method: 'GET',
			path: '/Articles/ListComments',
			data: { slug },
		});
	}
	public postArticle(form: PostForm) {
		return this.fetchJson<Post>({
			method: 'POST',
			path: '/Social/Post',
			data: form,
		});
	}
	public postComment(form: CommentForm) {
		return this.fetchJson<CommentCreationResponse>({
			method: 'POST',
			path: '/Social/Comment',
			data: form,
		});
	}
	public postCommentAddendum(form: CommentAddendumForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentAddendum',
			data: form,
		});
	}
	public postCommentRevision(form: CommentRevisionForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentRevision',
			data: form,
		});
	}
	public deleteComment(form: CommentDeletionForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentDeletion',
			data: form,
		});
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		return this.fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/CommitReadState',
			data,
		});
	}
	public isAuthenticated() {
		return this.getUser() != null;
	}
	public async getUser() {
		return await this._user.get();
	}
	public async getBlacklist() {
		return (await this._blacklist.get()).value.map(
			(pattern) => new RegExp(pattern)
		);
	}
	public rateArticle(articleId: number, score: number) {
		return this.fetchJson<{
			article: UserArticle;
			rating: Rating;
		}>({
			method: 'POST',
			path: '/Articles/Rate',
			data: {
				articleId,
				score,
			},
		});
	}
	public reportArticleIssue(request: ArticleIssueReportRequest) {
		return this.fetchJson<void>({
			method: 'POST',
			path: '/Analytics/ArticleIssueReport',
			data: request,
		});
	}
	public requestTwitterBrowserLinkRequestToken() {
		return this.fetchJson<TwitterRequestToken>({
			method: 'POST',
			path: '/Auth/TwitterBrowserLinkRequest',
		});
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return this.fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/SetStarred',
			data: {
				articleId,
				isStarred,
			},
		});
	}
	public logExtensionInstallation(data: InstallationRequest) {
		return this.fetchJson<InstallationResponse>({
			method: 'POST',
			path: '/Extension/Install',
			data,
		});
	}
	public async userSignedIn(profile: WebAppUserProfile) {
		await this._user.set(profile.userAccount);
		await this._displayPreference.set(profile.displayPreference);
		this.checkNotifications();
	}
	public userSignedOut() {
		this._user.clear();
		this._displayPreference.clear();
		this._displayedNotifications.clear();
	}
	public async userUpdated(user: UserAccount) {
		await this._user.set(user || null);
	}

	public async getDisplayPreferenceFromCache() {
		return await this._displayPreference.get();
	}

	public async getDisplayPreference() {
		const storedPreference = await this._displayPreference.get();
		this.fetchJson<DisplayPreference | null>({
			method: 'GET',
			path: '/UserAccounts/DisplayPreference',
		})
			.then(async (preference) => {
				if (
					storedPreference != null &&
					preference != null &&
					areDisplayPreferencesEqual(await storedPreference, preference)
				) {
					return;
				}
				if (preference) {
					this.displayPreferenceChanged(preference);
				} else {
					this.changeDisplayPreference(
						(preference = getClientDefaultDisplayPreference())
					);
				}
				console.log(`[ServerApi] display preference changed`);
				this._onDisplayPreferenceChanged(preference);
			})
			.catch(() => {
				console.log(`[ServerApi] error fetching display preference`);
			});
		return storedPreference;
	}
	public async displayPreferenceChanged(preference: DisplayPreference) {
		await this._displayPreference.set(preference);
	}
	public async changeDisplayPreference(preference: DisplayPreference) {
		await this.displayPreferenceChanged(preference);
		return this.fetchJson<DisplayPreference>({
			method: 'POST',
			path: '/UserAccounts/DisplayPreference',
			data: preference,
		});
	}
}
