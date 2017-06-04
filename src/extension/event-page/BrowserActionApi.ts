import ExtensionState from '../common/ExtensionState';

export default class BrowserActionApi {
	private static sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ to: 'browserActionPage', type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	constructor(handlers: {
		onLoad: () => Promise<ExtensionState>,
		onAckNewReply: () => void
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
				}
			}
			return false;
		});
	}
	public pushState(state: ExtensionState) {
		return BrowserActionApi.sendMessage('pushState', state);
	}
}