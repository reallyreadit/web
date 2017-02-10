import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../common/ReadStateCommitData';
import PageInfo from '../common/PageInfo';
import UserPage from '../common/UserPage';

export default class EventPageApi {
	private static sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	constructor(handlers: {
		onLoadPage: () => void,
		onUnloadPage: () => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'loadPage':
					handlers.onLoadPage();
					break;
				case 'unloadPage':
					handlers.onUnloadPage();
					break;
			}
		});
	}
	public registerContentScript(location: Location) {
		return EventPageApi.sendMessage<ContentScriptInitData>('registerContentScript', location.toString());
	}
	public registerPage(data: PageInfo) {
		return EventPageApi.sendMessage<UserPage>('registerPage', data);
	}
	public commitReadState(data: ReadStateCommitData) {
		return EventPageApi.sendMessage<void>('commitReadState', data);
	}
	public unregisterPage() {
		return EventPageApi.sendMessage<void>('unregisterPage');
	}
	public unregisterContentScript() {
		return EventPageApi.sendMessage<void>('unregisterContentScript');
	}
}