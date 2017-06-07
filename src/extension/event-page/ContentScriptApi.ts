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
		onCommitReadState: (tabId: number, data: ReadStateCommitData) => void,
		onUnregisterPage: (tabId: number) => void,
		onUnregisterContentScript: (tabId: number) => void
	}) {
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
						handlers.onCommitReadState(sender.tab.id, message.data);
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
	public updateHistoryState(tabId: number, url: string) {
		return ContentScriptApi.sendMessage<void>(tabId, 'updateHistoryState', url);
	}
}