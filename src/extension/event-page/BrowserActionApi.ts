import BrowserActionState from '../common/BrowserActionState';
import UserArticle from '../../common/models/UserArticle';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'browserActionPage', type, data }, responseCallback);
}
export default class BrowserActionApi {
	constructor(handlers: {
		onActivateReaderMode: (tabId: number) => void,
		onDeactivateReaderMode: (tabId: number) => void,
		onLoad: () => Promise<BrowserActionState>,
		onAckNewReply: () => void,
		onSetStarred: (articleId: number, isStarred: boolean) => Promise<UserArticle>
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
				switch (message.type) {
					case 'activateReaderMode':
						handlers.onActivateReaderMode(message.data);
						break;
					case 'deactivateReaderMode':
						handlers.onDeactivateReaderMode(message.data);
						break;
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
	public pushState(state: BrowserActionState) {
		sendMessage('pushState', state);
	}
}