import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import Rating from '../../common/models/Rating';

function sendMessage<T>(tabId: number, type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.tabs.sendMessage(tabId, { type, data }, responseCallback);
}
export default class ContentScriptApi {
	constructor(handlers: {
		onRateArticle: (tabId: number, articleId: number, score: number) => Promise<Rating>,
		onRegisterContentScript: (tabId: number, url: string) => Promise<ContentScriptInitData>,
		onRegisterPage: (tabId: number, data: ParseResult) => Promise<ArticleLookupResult>,
		onCommitReadState: (tabId: number, commitData: ReadStateCommitData, isCompletionCommit: boolean) => Promise<UserArticle>,
		onUnregisterPage: (tabId: number) => void,
		onUnregisterContentScript: (tabId: number) => void,
		onLoadContentParser: (tabId: number) => void,
		onLoadUserInterface: (tabId: number) => void
	}) {
		// message
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
				switch (message.type) {
					case 'rateArticle':
						handlers
							.onRateArticle(sender.tab.id, message.data.articleId, message.data.score)
							.then(sendResponse);
						return true;
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
					case 'loadUserInterface':
						handlers.onLoadUserInterface(sender.tab.id);
						break;
				}
			}
			return undefined;
		});
	}
	public loadPage(tabId: number) {
		sendMessage(tabId, 'loadPage');
	}
	public unloadPage(tabId: number) {
		sendMessage(tabId, 'unloadPage');
	}
	public showOverlay(tabId: number, value: boolean) {
		sendMessage(tabId, 'showOverlay', value);
	}
	public updateHistoryState(tabId: number, url: string) {
		sendMessage(tabId, 'updateHistoryState', url);
	}
}