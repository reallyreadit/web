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
		onReinitialize: () => void,
		onTerminate: () => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'reinitialize':
					handlers.onReinitialize();
					break;
				case 'terminate':
					handlers.onTerminate();
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
	public unregisterContentScript() {
		return EventPageApi.sendMessage<void>('unregisterContentScript');
	}
}