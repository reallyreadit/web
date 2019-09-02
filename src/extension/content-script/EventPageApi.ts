import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import CommentThread from '../../common/models/CommentThread';
import PostCommentForm from '../../common/models/PostCommentForm';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';

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
		onActivateReaderMode: () => void,
		onArticleUpdated: (event: ArticleUpdatedEvent) => void,
		onCommentPosted: (comment: CommentThread) => void,
		onDeactivateReaderMode: () => void,
		onLoadPage: () => void,
		onUnloadPage: () => void,
		onToggleContentIdentificationDisplay: () => void,
		onToggleReadStateDisplay: () => void,
		onHistoryStateUpdated: (url: string) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'activateReaderMode':
					handlers.onActivateReaderMode();
					break;
				case 'articleUpdated':
					handlers.onArticleUpdated(message.data);
					break;
				case 'commentPosted':
					handlers.onCommentPosted(message.data);
					break;
				case 'deactivateReaderMode':
					handlers.onDeactivateReaderMode();
					break;
				case 'loadPage':
					handlers.onLoadPage();
					break;
				case 'unloadPage':
					handlers.onUnloadPage();
					break;
				case 'toggleContentIdentificationDisplay':
					handlers.onToggleContentIdentificationDisplay();
					break;
				case 'toggleReadStateDisplay':
					handlers.onToggleReadStateDisplay();
					break;
				case 'updateHistoryState':
					handlers.onHistoryStateUpdated(message.data);
					break;
			}
		});
	}
	public registerContentScript(location: Location) {
		return sendMessageAwaitingResponse<ContentScriptInitData>('registerContentScript', location.toString());
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
	public unregisterContentScript() {
		sendMessage('unregisterContentScript');
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
	public postComment(form: PostCommentForm) {
		return sendMessageAwaitingResponse<{ article: UserArticle, comment: CommentThread }>('postComment', form);
	}
}