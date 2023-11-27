import ReadStateCommitData from '../../../common/reading/ReadStateCommitData';
import ParseResult from '../../../common/reading/ParseResult';
import ArticleLookupResult from '../../../common/models/ArticleLookupResult';
import UserArticle from '../../../common/models/UserArticle';
import CommentThread from '../../../common/models/CommentThread';
import CommentForm from '../../../common/models/social/CommentForm';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import PostForm from '../../../common/models/social/PostForm';
import Post from '../../../common/models/social/Post';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import { MessageResponse, isSuccessResponse, ResponseType } from '../../common/messaging';
import StarForm from '../../../common/models/articles/StarForm';
import { AuthServiceBrowserLinkResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import TwitterRequestToken from '../../../common/models/auth/TwitterRequestToken';
import UserAccount from '../../../common/models/UserAccount';
import WindowOpenRequest from '../../common/WindowOpenRequest';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';
import DisplayPreference from '../../../common/models/userAccounts/DisplayPreference';
import { ExtensionOptions } from '../../options-page/ExtensionOptions';
import CommentsQuery from '../../../common/models/social/CommentsQuery';

function sendMessage<T>(
	type: string,
	data?: {},
	responseCallback?: (response: MessageResponse<T>) => void
) {
	try {
		chrome.runtime.sendMessage(
			{
				to: 'eventPage',
				from: 'readerContentScript',
				type,
				data,
			},
			responseCallback
		);
	} catch (ex) {
		if (responseCallback) {
			responseCallback({
				error: 'Failed to send message.',
				type: ResponseType.Error
			});
		}
	}
}
function sendMessageAwaitingResponse<T>(type: string, data?: {}) {
	return new Promise<T>((resolve, reject) => {
		try {
			sendMessage<T>(type, data, (response) => {
				if (isSuccessResponse<T>(response)) {
					resolve(response.value);
				} else {
					reject(
						response != null
							? response.error
							: 'Something went wrong in the event page API'
					);
				}
			});
		} catch (ex) {
			reject('Failed to send message.');
		}
	});
}
/**
 * An API for content scripts to communicate to the extension's event (background) page.
 * The event page can itself communicate with Readup's API.
 *
 * Event pages are a deprecated concept in Chromium-based browsers:
 * https://developer.chrome.com/docs/extensions/mv2/background_pages/
 */
export default class EventPageApi {
	private _loadingAnimationInterval: number | null;
	/**
	 * Initializes the API with the given response handlers in the client script.
	 */
	constructor(handlers: {
		onArticleUpdated: (event: ArticleUpdatedEvent) => void;
		onAuthServiceLinkCompleted: (
			response: AuthServiceBrowserLinkResponse
		) => void;
		onCommentPosted: (comment: CommentThread) => void;
		onCommentUpdated: (comment: CommentThread) => void;
		onDisplayPreferenceChanged: (preference: DisplayPreference) => void;
		onUserSignedIn: () => void;
		onUserSignedOut: () => void;
		onUserUpdated: (user: UserAccount) => void;
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			// Don't answer messages from content scripts.
			// TODO: Explore full consequences of running this messaging service in a chrome-extension://... page instead of a regular http(s)://... web page and refactor as required.
			if (message.to) {
				// return true so that other handlers will have an opportunity to respond
				return true;
			}
			switch (message.type) {
				case 'articleUpdated':
					handlers.onArticleUpdated(message.data);
					break;
				case 'authServiceLinkCompleted':
					handlers.onAuthServiceLinkCompleted(message.data);
					break;
				case 'commentPosted':
					handlers.onCommentPosted(message.data);
					break;
				case 'commentUpdated':
					handlers.onCommentUpdated(message.data);
					break;
				case 'displayPreferenceChanged':
					handlers.onDisplayPreferenceChanged(message.data);
					break;
				case 'userSignedIn':
					handlers.onUserSignedIn();
					break;
				case 'userSignedOut':
					handlers.onUserSignedOut();
					break;
				case 'userUpdated':
					handlers.onUserUpdated(message.data);
					break;
			}
			// always send a response because the sender must use a callback in order to
			// check for runtime errors and an error will be triggered if the port is closed
			sendResponse();
			return false;
		});
	}
	public getDisplayPreference() {
		return sendMessageAwaitingResponse<DisplayPreference | null>(
			'getDisplayPreference'
		);
	}
	public getDisplayPreferenceFromCache() {
		return sendMessageAwaitingResponse<DisplayPreference | null>(
			'getDisplayPreferenceFromCache'
		);
	}
	public getExtensionOptions() {
		return sendMessageAwaitingResponse<ExtensionOptions>(
			'getExtensionOptions'
		);
	}
	public getUserAccountFromCache() {
		return sendMessageAwaitingResponse<UserAccount | null>(
			'getUserAccountFromCache'
		);
	}
	public changeDisplayPreference(preference: DisplayPreference) {
		return sendMessageAwaitingResponse<DisplayPreference>(
			'changeDisplayPreference',
			preference
		);
	}
	public startLoadingAnimation() {
		if (this._loadingAnimationInterval != null) {
			return;
		}
		let tick = 0;
		const rate = 150;
		this._loadingAnimationInterval = window.setInterval(() => {
			if (tick * rate > 1000 * 30) {
				this.stopLoadingAnimation();
				return;
			}
			sendMessage('loadingAnimationTick', ++tick);
		}, rate);
	}
	public stopLoadingAnimation() {
		if (this._loadingAnimationInterval == null) {
			return;
		}
		window.clearInterval(this._loadingAnimationInterval);
		this._loadingAnimationInterval = null;
		sendMessage('loadingAnimationTick', 0);
	}
	public registerPage() {
		return sendMessageAwaitingResponse('registerPage');
	}
	public getUserArticle(data: ParseResult) {
		return sendMessageAwaitingResponse<ArticleLookupResult>(
			'getUserArticle',
			data
		);
	}
	public commitReadState(
		commitData: ReadStateCommitData,
		isCompletionCommit: boolean
	) {
		return sendMessageAwaitingResponse<UserArticle>('commitReadState', {
			commitData,
			isCompletionCommit,
		});
	}
	public unregisterPage() {
		sendMessage('unregisterPage');
	}
	public closeWindow(id: number) {
		sendMessage('closeWindow', id);
	}
	public getComments(query: CommentsQuery) {
		return sendMessageAwaitingResponse<CommentThread[]>('getComments', query);
	}
	public hasWindowClosed(id: number) {
		return sendMessageAwaitingResponse<boolean>('hasWindowClosed', id);
	}
	public openWindow(request: WindowOpenRequest) {
		return sendMessageAwaitingResponse<number>('openWindow', request);
	}
	public postArticle(form: PostForm) {
		return sendMessageAwaitingResponse<Post>('postArticle', form);
	}
	public postComment(form: CommentForm) {
		return sendMessageAwaitingResponse<{
			article: UserArticle;
			comment: CommentThread;
		}>('postComment', form);
	}
	public postCommentAddendum(form: CommentAddendumForm) {
		return sendMessageAwaitingResponse<CommentThread>(
			'postCommentAddendum',
			form
		);
	}
	public postCommentRevision(form: CommentRevisionForm) {
		return sendMessageAwaitingResponse<CommentThread>(
			'postCommentRevision',
			form
		);
	}
	public readArticle(slug: string) {
		return sendMessage('readArticle', slug);
	}
	public reportArticleIssue(request: ArticleIssueReportRequest) {
		return sendMessageAwaitingResponse('reportArticleIssue', request);
	}
	public requestTwitterBrowserLinkRequestToken() {
		return sendMessageAwaitingResponse<TwitterRequestToken>(
			'requestTwitterBrowserLinkRequestToken'
		);
	}
	public setStarred(form: StarForm) {
		return sendMessageAwaitingResponse<UserArticle>('setStarred', form);
	}
	public deleteComment(form: CommentDeletionForm) {
		return sendMessageAwaitingResponse<CommentThread>(
			'postCommentDeletion',
			form
		);
	}
}
