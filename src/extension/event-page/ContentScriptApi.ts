import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../common/ReadStateCommitData';
import PageInfo from '../common/PageInfo';
import UserPage from '../common/UserPage';

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
		onRegisterPage: (tabId: number, data: PageInfo) => Promise<UserPage>,
		onCommitReadState: (data: ReadStateCommitData) => void,
		onUnregisterContentScript: (tabId: number) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'registerContentScript':
					handlers
						.onRegisterContentScript(sender.tab.id, message.data)
						.then(sendResponse);
					return true;
				case 'registerPage':
					handlers
						.onRegisterPage(sender.tab.id, message.data)
						.then(sendResponse);
					return true;
				case 'commitReadState':
					handlers.onCommitReadState(message.data);
					break;
				case 'unregisterContentScript':
					handlers.onUnregisterContentScript(sender.tab.id);
					break;
			}
			return undefined;
		});
	}
	public reinitialize(tabId: number) {
		return ContentScriptApi.sendMessage<void>(tabId, 'reinitialize');
	}
	public terminate(tabId: number) {
		return ContentScriptApi.sendMessage<void>(tabId, 'terminate');
	}
}