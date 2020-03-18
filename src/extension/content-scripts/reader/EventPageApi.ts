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

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'eventPage', from: 'contentScript', type, data }, responseCallback);
}
function sendMessageAwaitingResponse<T>(type: string, data ?: {}) {
	return new Promise<T>((resolve, reject) => {
		try {
			sendMessage(type, data, resolve);
		} catch (ex) {
			reject();
		}
	});
}
export default class EventPageApi {
	constructor(handlers: {
		onArticleUpdated: (event: ArticleUpdatedEvent) => void,
		onCommentPosted: (comment: CommentThread) => void,
		onCommentUpdated: (comment: CommentThread) => void,
		onToggleContentIdentificationDisplay: () => void,
		onToggleReadStateDisplay: () => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'articleUpdated':
					handlers.onArticleUpdated(message.data);
					break;
				case 'commentPosted':
					handlers.onCommentPosted(message.data);
					break;
				case 'commentUpdated':
					handlers.onCommentUpdated(message.data);
					break;
				case 'toggleContentIdentificationDisplay':
					handlers.onToggleContentIdentificationDisplay();
					break;
				case 'toggleReadStateDisplay':
					handlers.onToggleReadStateDisplay();
					break;
			}
		});
	}
	public registerPage(data: ParseResult) {
		return sendMessageAwaitingResponse<ArticleLookupResult>('registerPage', data);
	}
	public commitReadState(commitData: ReadStateCommitData, isCompletionCommit: boolean) {
		return sendMessageAwaitingResponse<UserArticle>('commitReadState', { commitData, isCompletionCommit });
	}
	public unregisterPage() {
		return sendMessageAwaitingResponse<void>('unregisterPage');
	}
	public loadContentParser() {
		sendMessage('loadContentParser');
	}
	public getComments(slug: string) {
		return sendMessageAwaitingResponse<CommentThread[]>('getComments', slug);
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
	public deleteComment(form: CommentDeletionForm) {
		return sendMessageAwaitingResponse<CommentThread>('postCommentDeletion', form);
	}
}