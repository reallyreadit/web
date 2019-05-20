import BrowserActionState from '../common/BrowserActionState';
import UserArticle from '../../common/models/UserArticle';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'eventPage', type, data }, responseCallback);
}
function sendMessageAwaitingResponse<T>(type: string, data?: {}) {
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
		onPushState: (state: BrowserActionState) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'browserActionPage') {
				switch (message.type) {
					case 'pushState':
						handlers.onPushState(message.data);
						break;
				}
			}
		});
	}
	public ackNewReply() {
		sendMessage('ackNewReply');
	}
	public activateReaderMode(tabId: number) {
		sendMessage('activateReaderMode', tabId);
	}
	public deactivateReaderMode(tabId: number) {
		sendMessage('deactivateReaderMode', tabId);
	}
	public load() {
		return sendMessageAwaitingResponse<BrowserActionState>('load');
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return sendMessageAwaitingResponse<UserArticle>('setStarred', { articleId, isStarred });
	}
}