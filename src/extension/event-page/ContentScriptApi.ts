import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../common/ReadStateCommitData';
import ParseResult from '../common/ParseResult';
import UserPage from '../../common/models/UserPage';

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
		onRegisterContentScript: (tabId: number, url: string) => Promise<ContentScriptInitData>,
		onRegisterPage: (tabId: number, data: ParseResult) => Promise<UserPage>,
		onCommitReadState: (tabId: number, commitData: ReadStateCommitData, isCompletionCommit: boolean) => void,
		onUnregisterPage: (tabId: number) => void,
		onUnregisterContentScript: (tabId: number) => void
	}) {
		// message
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
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
						handlers.onCommitReadState(sender.tab.id, message.data.commitData, message.data.isCompletionCommit);
						break;
					case 'unregisterPage':
						handlers.onUnregisterPage(sender.tab.id);
						break;
					case 'unregisterContentScript':
						handlers.onUnregisterContentScript(sender.tab.id);
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