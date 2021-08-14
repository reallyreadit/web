import UserArticle from '../../common/models/UserArticle';
import ParseResult from '../../common/reading/ParseResult';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import Request from './Request';
import { createUrl } from '../../common/HttpEndpoint';
import { createQueryString } from '../../common/routing/queryString';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import CommentThread from '../../common/models/CommentThread';
import CommentForm from '../../common/models/social/CommentForm';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import Rating from '../../common/models/Rating';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';
import TwitterRequestToken from '../../common/models/auth/TwitterRequestToken';
import ArticleIssueReportRequest from '../../common/models/analytics/ArticleIssueReportRequest';
import InstallationRequest from '../../common/models/extension/InstallationRequest';
import InstallationResponse from '../../common/models/extension/InstallationResponse';
import CommentCreationResponse from '../../common/models/social/CommentCreationResponse';

function addCustomHeaders(req: XMLHttpRequest, params: Request) {
	req.setRequestHeader('X-Readup-Client', `web/extension@${window.reallyreadit.extension.config.version.extension}`);
}
export default class ServerApi {
	public static alarms = {
		getBlacklist: 'ServerApi.getBlacklist'
	};
	private fetchJson<T>(request: Request) {
		return new Promise<T>((resolve, reject) => {
			const
				req = new XMLHttpRequest(),
				url = createUrl(window.reallyreadit.extension.config.apiServer, request.path);
			req.withCredentials = true;
			req.addEventListener('load', function () {
				const contentType = this.getResponseHeader('Content-Type');
				let object: any;
				if (
					contentType?.startsWith('application/json') ||
					contentType?.startsWith('application/problem+json')
				) {
					object = JSON.parse(this.responseText);
				}
				if (this.status === 200) {
					if (object) {
						resolve(object);
					} else {
						resolve();
					}
				} else {
					if (this.status === 401) {
						console.log(`[ServerApi] user signed out (received 401 response from API server)`);
					}
					reject(object || ['ServerApi XMLHttpRequest load event. Status: ' + this.status + ' Status text: ' + this.statusText + ' Response text: ' + this.responseText]);
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
	public registerPage(tabId: number, data: ParseResult) {
		return this.fetchJson<ArticleLookupResult>({
			method: 'POST',
			path: '/Extension/GetUserArticle',
			data,
			id: tabId
		});
	}
	public getComments(slug: string) {
		return this.fetchJson<CommentThread[]>({
			method: 'GET',
			path: '/Articles/ListComments',
			data: { slug }
		});
	}
	public postArticle(form: PostForm) {
		return this.fetchJson<Post>({
			method: 'POST',
			path: '/Social/Post',
			data: form
		});
	}
	public postComment(form: CommentForm) {
		return this.fetchJson<CommentCreationResponse>({
			method: 'POST',
			path: '/Social/Comment',
			data: form
		});
	}
	public postCommentAddendum(form: CommentAddendumForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentAddendum',
			data: form
		});
	}
	public postCommentRevision(form: CommentRevisionForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentRevision',
			data: form
		});
	}
	public deleteComment(form: CommentDeletionForm) {
		return this.fetchJson<CommentThread>({
			method: 'POST',
			path: '/Social/CommentDeletion',
			data: form
		});
	}
	public commitReadState(tabId: number, data: ReadStateCommitData) {
		return this.fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/CommitReadState',
			data
		});
	}
	public getBlacklist() {
		return [] as RegExp[];
	}
	public rateArticle(articleId: number, score: number) {
		return this.fetchJson<{
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
		return this.fetchJson<void>({
			method: 'POST',
			path: '/Analytics/ArticleIssueReport',
			data: request
		});
	}
	public requestTwitterBrowserLinkRequestToken() {
		return this.fetchJson<TwitterRequestToken>({
			method: 'POST',
			path: '/Auth/TwitterBrowserLinkRequest'
		});
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return this.fetchJson<UserArticle>({
			method: 'POST',
			path: '/Extension/SetStarred',
			data: {
				articleId,
				isStarred
			}
		});
	}
	public logExtensionInstallation(data: InstallationRequest) {
		return this.fetchJson<InstallationResponse>({
			method: 'POST',
			path: '/Extension/Install',
			data
		});
	}
}