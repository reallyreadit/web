import ExtensionState from '../common/ExtensionState';

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
		onPushState: (state: ExtensionState) => void
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
	public load() {
		return sendMessageAwaitingResponse<ExtensionState>('load');
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return sendMessageAwaitingResponse('setStarred', { articleId, isStarred });
	}
}