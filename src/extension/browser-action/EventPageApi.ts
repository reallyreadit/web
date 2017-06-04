import ExtensionState from '../common/ExtensionState';

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
		return EventPageApi.sendMessage('ackNewReply');
	}
	public load() {
		return EventPageApi.sendMessage<ExtensionState>('load');
	}
}