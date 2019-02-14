import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import Rating from '../../common/models/Rating';

export default class ContentScriptApi {
	private static sendMessage<T>(tabId: number, type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.tabs.sendMessage(tabId, { type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
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
						break;
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
		// history state
		chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
			if (details.transitionType === 'link') {
				console.log('chrome.webNavigation.onHistoryStateUpdated (tabId: ' + details.tabId + ', ' + details.url + ')');
				ContentScriptApi.sendMessage<void>(details.tabId, 'updateHistoryState', details.url);
			}
		});
	}
	public loadPage(tabId: number) {
		return ContentScriptApi.sendMessage<void>(tabId, 'loadPage');
	}
	public unloadPage(tabId: number) {
		return ContentScriptApi.sendMessage<void>(tabId, 'unloadPage');
	}
	public showOverlay(tabId: number, value: boolean) {
		return ContentScriptApi.sendMessage<void>(tabId, 'showOverlay', value);
	}
}