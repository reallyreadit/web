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

function sendMessage<T>(tabId: number, type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.tabs.sendMessage(tabId, { type, data }, responseCallback);
}
export default class ContentScriptApi {
	constructor(handlers: {
		onRegisterContentScript: (tabId: number, url: string) => Promise<ContentScriptInitData>,
		onRegisterPage: (tabId: number, data: ParseResult) => Promise<ArticleLookupResult>,
		onCommitReadState: (tabId: number, commitData: ReadStateCommitData, isCompletionCommit: boolean) => Promise<UserArticle>,
		onUnregisterPage: (tabId: number) => void,
		onUnregisterContentScript: (tabId: number) => void,
		onLoadContentParser: (tabId: number) => void,
		onGetComments: (slug: string) => Promise<CommentThread[]>,
		onPostArticle: (form: PostForm) => Promise<Post>,
		onPostComment: (form: PostCommentForm) => Promise<{ article: UserArticle, comment: CommentThread }>
	}) {
		// message
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage' && message.from === 'contentScript') {
				switch (message.type) {
					case 'registerContentScript':
						handlers
							.onRegisterContentScript(sender.tab.id, message.data)
							.then(sendResponse)
						return true;
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
					case 'unregisterContentScript':
						handlers.onUnregisterContentScript(sender.tab.id);
						break;
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
				}
			}
			return undefined;
		});
	}
	public activateReaderMode(tabId: number) {
		sendMessage(tabId, 'activateReaderMode');
	}
	public articleUpdated(tabId: number, event: ArticleUpdatedEvent) {
		sendMessage(tabId, 'articleUpdated', event);
	}
	public commentPosted(tabId: number, comment: CommentThread) {
		sendMessage(tabId, 'commentPosted', comment);
	}
	public deactivateReaderMode(tabId: number) {
		sendMessage(tabId, 'deactivateReaderMode');
	}
	public loadPage(tabId: number) {
		sendMessage(tabId, 'loadPage');
	}
	public unloadPage(tabId: number) {
		sendMessage(tabId, 'unloadPage');
	}
	public toggleContentIdentificationDisplay(tabId: number) {
		sendMessage(tabId, 'toggleContentIdentificationDisplay');
	}
	public toggleReadStateDisplay(tabId: number) {
		sendMessage(tabId, 'toggleReadStateDisplay');
	}
	public updateHistoryState(tabId: number, url: string) {
		sendMessage(tabId, 'updateHistoryState', url);
	}
}