import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import CommentThread from '../../common/models/CommentThread';
import CommentForm from '../../common/models/social/CommentForm';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';

function sendMessage<T>(tabId: number, type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.tabs.sendMessage(tabId, { type, data }, responseCallback);
}
export default class ContentScriptApi {
	constructor(handlers: {
		onRegisterPage: (tabId: number, data: ParseResult) => Promise<ArticleLookupResult>,
		onCommitReadState: (tabId: number, commitData: ReadStateCommitData, isCompletionCommit: boolean) => Promise<UserArticle>,
		onUnregisterPage: (tabId: number) => void,
		onLoadContentParser: (tabId: number) => void,
		onGetComments: (slug: string) => Promise<CommentThread[]>,
		onPostArticle: (form: PostForm) => Promise<Post>,
		onPostComment: (form: CommentForm) => Promise<{ article: UserArticle, comment: CommentThread }>,
		onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
		onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
		onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>
	}) {
		// message
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage' && message.from === 'contentScript') {
				switch (message.type) {
					case 'registerPage':
						handlers
							.onRegisterPage(sender.tab.id, message.data)
							.then(sendResponse);
						return true;
					case 'commitReadState':
						handlers
							.onCommitReadState(sender.tab.id, message.data.commitData, message.data.isCompletionCommit)
							.then(sendResponse);
						return true;
					case 'unregisterPage':
						handlers.onUnregisterPage(sender.tab.id);
						return true;
					case 'loadContentParser':
						handlers.onLoadContentParser(sender.tab.id);
						break;
					case 'getComments':
						handlers
							.onGetComments(message.data)
							.then(sendResponse);
						return true;
					case 'postArticle':
						handlers
							.onPostArticle(message.data)
							.then(sendResponse);
						return true;
					case 'postComment':
						handlers
							.onPostComment(message.data)
							.then(sendResponse);
						return true;
					case 'postCommentAddendum':
						handlers
							.onPostCommentAddendum(message.data)
							.then(sendResponse);
						return true;
					case 'postCommentRevision':
						handlers
							.onPostCommentRevision(message.data)
							.then(sendResponse);
						return true;
					case 'deleteComment':
						handlers
							.onDeleteComment(message.data)
							.then(sendResponse);
						return true;
				}
			}
			return undefined;
		});
	}
	public articleUpdated(tabId: number, event: ArticleUpdatedEvent) {
		sendMessage(tabId, 'articleUpdated', event);
	}
	public commentPosted(tabId: number, comment: CommentThread) {
		sendMessage(tabId, 'commentPosted', comment);
	}
	public commentUpdated(tabId: number, comment: CommentThread) {
		sendMessage(tabId, 'commentUpdated', comment);
	}
	public toggleContentIdentificationDisplay(tabId: number) {
		sendMessage(tabId, 'toggleContentIdentificationDisplay');
	}
	public toggleReadStateDisplay(tabId: number) {
		sendMessage(tabId, 'toggleReadStateDisplay');
	}
}