import HttpEndpoint, { createUrl } from '../common/HttpEndpoint';
import HttpMethod from '../common/HttpMethod';
import TwitterRequestToken from '../common/models/auth/TwitterRequestToken';
import CommentThread from '../common/models/CommentThread';
import InitializationRequest from '../common/models/embed/InitializationRequest';
import { InitializationResponse } from '../common/models/embed/InitializationResponse';
import ReadProgressRequest from '../common/models/embed/ReadProgressRequest';
import ReadProgressResponse from '../common/models/embed/ReadProgressResponse';
import CommentAddendumForm from '../common/models/social/CommentAddendumForm';
import CommentDeletionForm from '../common/models/social/CommentDeletionForm';
import CommentForm from '../common/models/social/CommentForm';
import CommentCreationResponse from '../common/models/social/CommentCreationResponse';
import CommentRevisionForm from '../common/models/social/CommentRevisionForm';
import Post from '../common/models/social/Post';
import PostForm from '../common/models/social/PostForm';
import SemanticVersion from '../common/SemanticVersion';
import UserAccountForm from '../common/models/userAccounts/UserAccountForm';
import WebAppUserProfile from '../common/models/userAccounts/WebAppUserProfile';
import AuthServiceAccountForm from '../common/models/userAccounts/AuthServiceAccountForm';
import PasswordResetRequestForm from '../common/models/userAccounts/PasswordResetRequestForm';
import SignInForm from '../common/models/userAccounts/SignInForm';

export default class ApiServer {
	private readonly _clientVersion: SemanticVersion;
	private readonly _endpoint: HttpEndpoint;
	constructor(
		{
			clientVersion,
			endpoint
		} : {
			clientVersion: SemanticVersion,
			endpoint: HttpEndpoint
		}
	) {
		this._clientVersion = clientVersion;
		this._endpoint = endpoint;
	}
	private fetch<T>(method: HttpMethod, path: string, data?: any) {
		let url: string;
		const options: RequestInit & { headers: Headers } = {
			credentials: 'include',
			headers: new Headers({
				'X-Readup-Client': 'web/embed@' + this._clientVersion.toString()
			}),
			method
		};
		switch (method) {
			case HttpMethod.Get:
				url = createUrl(this._endpoint, path, data);
				break;
			case HttpMethod.Post:
				url = createUrl(this._endpoint, path);
				if (data) {
					options.headers.append('Content-Type', 'application/json');
					options.body = JSON.stringify(data);
				}
				break;
		}
		return fetch(url, options)
			.then(
				res => {
					// asp.net sets content-type = "application/json; charset=utf-8"
					if (
						res.headers
							.get('content-type')
							?.includes('application/json')
					) {
						return res
							.json()
							.then(
								(json: T) => {
									if (!res.ok) {
										throw (json || []);
									}
									return json;
								}
							);
					}
					return undefined;
				}
			);
	}
	public createAuthServiceAccount(request: AuthServiceAccountForm) {
		return this.fetch<WebAppUserProfile>(HttpMethod.Post, '/UserAccounts/AuthServiceAccount', request);
	}
	public createUserAccount(request: UserAccountForm) {
		return this.fetch<WebAppUserProfile>(HttpMethod.Post, '/UserAccounts/CreateAccount', request);
	}
	public deleteComment(request: CommentDeletionForm) {
		return this.fetch<CommentThread>(HttpMethod.Post, '/Social/CommentDeletion', request);
	}
	public getComments(slug: string) {
		return this.fetch<CommentThread[]>(HttpMethod.Get, '/Articles/ListComments', { slug });
	}
	public initialize(request: InitializationRequest) {
		return this.fetch<InitializationResponse>(HttpMethod.Post, '/Embed/Initialization', request);
	}
	public postArticle(request: PostForm) {
		return this.fetch<Post>(HttpMethod.Post, '/Social/Post', request);
	}
	public postComment(request: CommentForm) {
		return this.fetch<CommentCreationResponse>(HttpMethod.Post, '/Social/Comment', request);
	}
	public postCommentAddendum(request: CommentAddendumForm) {
		return this.fetch<CommentThread>(HttpMethod.Post, '/Social/CommentAddendum', request);
	}
	public postCommentRevision(request: CommentRevisionForm) {
		return this.fetch<CommentThread>(HttpMethod.Post, '/Social/CommentRevision', request);
	}
	public requestPasswordReset(request: PasswordResetRequestForm) {
		return this.fetch<void>(HttpMethod.Post, '/UserAccounts/RequestPasswordReset', request);
	}
	public requestTwitterBrowserLinkRequestToken() {
		return this.fetch<TwitterRequestToken>(HttpMethod.Post, '/Auth/TwitterBrowserLinkRequest');
	}
	public signIn(request: SignInForm) {
		return this.fetch<WebAppUserProfile>(HttpMethod.Post, '/UserAccounts/SignIn', request);
	}
	public updateReadProgress(request: ReadProgressRequest) {
		return this.fetch<ReadProgressResponse>(HttpMethod.Post, '/Embed/ReadProgress', request);
	}
}