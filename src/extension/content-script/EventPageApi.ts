import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import UserPage from '../../common/models/UserPage';

export default class EventPageApi {
	private static sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ to: 'eventPage', type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	constructor(handlers: {
		onLoadPage: () => void,
		onUnloadPage: () => void,
		onShowOverlay: (value: boolean) => void,
		onHistoryStateUpdated: (url: string) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
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
	public registerContentScript(location: Location) {
		return EventPageApi.sendMessage<ContentScriptInitData>('registerContentScript', location.toString());
	}
	public registerPage(data: ParseResult) {
		return EventPageApi.sendMessage<UserPage>('registerPage', data);
	}
	public commitReadState(commitData: ReadStateCommitData, isCompletionCommit: boolean) {
		return EventPageApi.sendMessage<void>('commitReadState', { commitData, isCompletionCommit });
	}
	public unregisterPage() {
		return EventPageApi.sendMessage<void>('unregisterPage');
	}
	public unregisterContentScript() {
		return EventPageApi.sendMessage<void>('unregisterContentScript');
	}
	public loadContentParser() {
		return EventPageApi.sendMessage<void>('loadContentParser');
	}
	public loadUserInterface() {
		return EventPageApi.sendMessage<void>('loadUserInterface');
	}
}