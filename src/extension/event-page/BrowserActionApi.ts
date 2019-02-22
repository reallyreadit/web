import ExtensionState from '../common/ExtensionState';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'browserActionPage', type, data }, responseCallback);
}
export default class BrowserActionApi {
	constructor(handlers: {
		onLoad: () => Promise<ExtensionState>,
		onAckNewReply: () => void,
		onSetStarred: (articleId: number, isStarred: boolean) => Promise<void>
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
				switch (message.type) {
					case 'load':
						handlers
							.onLoad()
							.then(sendResponse);
						return true;
					case 'ackNewReply':
						handlers.onAckNewReply();
						break;
					case 'setStarred':
						handlers
							.onSetStarred(message.data.articleId, message.data.isStarred)
							.then(sendResponse);
						return true;
				}
			}
			return false;
		});
	}
	public pushState(state: ExtensionState) {
		sendMessage('pushState', state);
	}
}