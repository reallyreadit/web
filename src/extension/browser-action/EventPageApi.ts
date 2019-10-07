import BrowserActionState from '../common/BrowserActionState';
import UserArticle from '../../common/models/UserArticle';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'eventPage', from: 'browserActionPage', type, data }, responseCallback);
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
			if (message.to === 'browserActionPage' && message.from === 'eventPage') {
				switch (message.type) {
					case 'pushState':
						handlers.onPushState(message.data);
						break;
				}
			}
		});
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
	public postArticle(form: PostForm) {
		return sendMessageAwaitingResponse<Post>('postArticle', form);
	}
	public setStarred(articleId: number, isStarred: boolean) {
		return sendMessageAwaitingResponse<UserArticle>('setStarred', { articleId, isStarred });
	}
	public toggleContentIdentificationDisplay(tabId: number) {
		sendMessage('toggleContentIdentificationDisplay', tabId);
	}
	public toggleReadStateDisplay(tabId: number) {
		sendMessage('toggleReadStateDisplay', tabId);
	}
}