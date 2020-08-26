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
import { MessageResponse, isSuccessResponse } from '../../common/messaging';
import StarForm from '../../../common/models/articles/StarForm';
import { AuthServiceBrowserLinkResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import TwitterRequestToken from '../../../common/models/auth/TwitterRequestToken';
import UserAccount from '../../../common/models/UserAccount';
import WindowOpenRequest from '../../common/WindowOpenRequest';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';


function sendMessage<T>(type: string, data?: {}, responseCallback?: (response: MessageResponse<T>) => void) {
	chrome.runtime.sendMessage(
		{
			to: 'eventPage',
			from: 'readerContentScript',
			type,
			data
		},
		responseCallback
	);
}
function sendMessageAwaitingResponse<T>(type: string, data?: {}) {
	return new Promise<T>(
		(resolve, reject) => {
			try {
				sendMessage<T>(
					type,
					data,
					response => {
						if (isSuccessResponse<T>(response)) {
							resolve(response.value);
						} else {
							reject(response.error);
						}
					}
				);
			} catch (ex) {
				reject('Failed to send message.');
			}
		}
	);
}
export default class EventPageApi {
	constructor(handlers: {
		onArticleUpdated: (event: ArticleUpdatedEvent) => void,
		onAuthServiceLinkCompleted: (response: AuthServiceBrowserLinkResponse) => void,
		onCommentPosted: (comment: CommentThread) => void,
		onCommentUpdated: (comment: CommentThread) => void,
		onUserSignedOut: () => void,
		onUserUpdated: (user: UserAccount) => void
	}) {
		chrome.runtime.onMessage.addListener(
			(message, sender, sendResponse) => {
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
			}
		);
	}
	public registerPage(data: ParseResult) {
		return sendMessageAwaitingResponse<ArticleLookupResult>('registerPage', data);
	}
	public commitReadState(commitData: ReadStateCommitData, isCompletionCommit: boolean) {
		return sendMessageAwaitingResponse<UserArticle>('commitReadState', { commitData, isCompletionCommit });
	}
	public unregisterPage() {
		sendMessage('unregisterPage');
	}
	public loadContentParser() {
		sendMessage('loadContentParser');
	}
	public closeWindow(id: number) {
		sendMessage('closeWindow', id);
	}
	public getComments(slug: string) {
		return sendMessageAwaitingResponse<CommentThread[]>('getComments', slug);
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
		return sendMessageAwaitingResponse<{ article: UserArticle, comment: CommentThread }>('postComment', form);
	}
	public postCommentAddendum(form: CommentAddendumForm) {
		return sendMessageAwaitingResponse<CommentThread>('postCommentAddendum', form);
	}
	public postCommentRevision(form: CommentRevisionForm) {
		return sendMessageAwaitingResponse<CommentThread>('postCommentRevision', form);
	}
	public reportArticleIssue(request: ArticleIssueReportRequest) {
		return sendMessageAwaitingResponse('reportArticleIssue', request);
	}
	public requestTwitterBrowserLinkRequestToken() {
		return sendMessageAwaitingResponse<TwitterRequestToken>('requestTwitterBrowserLinkRequestToken');
	}
	public setStarred(form: StarForm) {
		return sendMessageAwaitingResponse<UserArticle>('setStarred', form);
	}
	public deleteComment(form: CommentDeletionForm) {
		return sendMessageAwaitingResponse<CommentThread>('postCommentDeletion', form);
	}
}