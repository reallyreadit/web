import UserArticle from '../../common/models/UserArticle';
import ParseResult from '../../common/reading/ParseResult';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ReadupRequest from './Request';
import { createUrl } from '../../common/HttpEndpoint';
import { createQueryString } from '../../common/routing/queryString';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import CommentThread from '../../common/models/CommentThread';
import CommentForm from '../../common/models/social/CommentForm';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';
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
import InstallationRequest from '../../common/models/extension/InstallationRequest';
import InstallationResponse from '../../common/models/extension/InstallationResponse';
import CommentCreationResponse from '../../common/models/social/CommentCreationResponse';

function getCustomHeaders() {
	return {
		'X-Readup-Client': `web/extension@${window.reallyreadit.extension.config.version.extension}`,
	};
}

/**
 * An API for the event page to communicate with Readup's resource API.
 */
export default class ServerApi {
	// handlers
	private readonly _onDisplayPreferenceChanged: (
		preference: DisplayPreference
	) => void;
	private readonly _onUserSignedOut: () => void;
	constructor(handlers: {
		onDisplayPreferenceChanged: (preference: DisplayPreference) => void;
		onUserSignedOut: () => void;
	}) {
		// handlers
		this._onDisplayPreferenceChanged = handlers.onDisplayPreferenceChanged;
		this._onUserSignedOut = handlers.onUserSignedOut;
	}

	public async getDisplayPreferenceFromStorage() {
		const result = await chrome.storage.local.get('displayPreference');
		return result['displayPreference'] as DisplayPreference | null;
	}
	public async getUserFromStorage() {
		const result = await chrome.storage.local.get('user');
		return result['user'] as UserAccount | null;
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
	public async isAuthenticated() {
		const user = await this.getUser();
		return user != null;
	}
	public async getUser() {
		const result = await chrome.storage.local.get('user');
		return result['user'] as UserAccount | null;
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
	public async userSignedOut() {
		await chrome.storage.local.set({
			'user': null,
			'displayPreference': null,
		});
	}
	public async userUpdated(user: UserAccount) {
		await chrome.storage.local.set({ 'user': user || null });
	}

	public async getDisplayPreferenceFromCache() {
		return await this.getDisplayPreferenceFromStorage();
	}

	public async getDisplayPreference() {
		const storedPreference = await this.getDisplayPreferenceFromStorage();
		this.fetchJson<DisplayPreference | null>({
			method: 'GET',
			path: '/UserAccounts/DisplayPreference',
		})
			.then(async (preference) => {
				if (
					storedPreference != null &&
					preference != null &&
					areDisplayPreferencesEqual(storedPreference, preference)
				) {
					return;
				}
				if (preference) {
					await this.displayPreferenceChanged(preference);
				} else {
					await this.changeDisplayPreference(
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
		await chrome.storage.local.set({ 'displayPreference': preference });
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
