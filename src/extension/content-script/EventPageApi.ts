import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import Rating from '../../common/models/Rating';
import CommentThread from '../../common/models/CommentThread';
import PostCommentForm from '../../common/models/PostCommentForm';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'eventPage', type, data }, responseCallback);
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
		onLoadPage: () => void,
		onUnloadPage: () => void,
		onShowOverlay: (value: boolean) => void,
		onHistoryStateUpdated: (url: string) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'articleUpdated':
					handlers.onArticleUpdated(message.data);
					break;
				case 'commentPosted':
					handlers.onCommentPosted(message.data);
					break;
				case 'loadPage':
					handlers.onLoadPage();
					break;
				case 'unloadPage':
					handlers.onUnloadPage();
					break;
				case 'showOverlay':
					handlers.onShowOverlay(message.data);
					break;
				case 'updateHistoryState':
					handlers.onHistoryStateUpdated(message.data);
					break;
			}
		});
	}
	public rateArticle(articleId: number, score: number) {
		return sendMessageAwaitingResponse<{ article: UserArticle, rating: Rating }>('rateArticle', { articleId, score });
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
	public postComment(form: PostCommentForm) {
		return sendMessageAwaitingResponse<{ article: UserArticle, comment: CommentThread }>('postComment', form);
	}
}