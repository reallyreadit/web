import BrowserActionState from '../common/BrowserActionState';
import UserArticle from '../../common/models/UserArticle';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';

function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	chrome.runtime.sendMessage({ to: 'browserActionPage', from: 'eventPage', type, data }, responseCallback);
}
export default class BrowserActionApi {
	constructor(handlers: {
		onActivateReaderMode: (tabId: number) => void,
		onDeactivateReaderMode: (tabId: number) => void,
		onLoad: () => Promise<BrowserActionState>,
		onAckNewReply: () => void,
		onPostArticle: (form: PostForm) => Promise<Post>,
		onSetStarred: (articleId: number, isStarred: boolean) => Promise<UserArticle>,
		onToggleContentIdentificationDisplay: (tabId: number) => void,
		onToggleReadStateDisplay: (tabId: number) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage' && message.from === 'browserActionPage') {
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
					case 'postArticle':
						handlers
							.onPostArticle(message.data)
							.then(sendResponse);
						return true;
					case 'setStarred':
						handlers
							.onSetStarred(message.data.articleId, message.data.isStarred)
							.then(sendResponse);
						return true;
					case 'toggleContentIdentificationDisplay':
						handlers.onToggleContentIdentificationDisplay(message.data);
						break;
					case 'toggleReadStateDisplay':
						handlers.onToggleReadStateDisplay(message.data);
						break;
				}
			}
			return false;
		});
	}
	public pushState(state: BrowserActionState) {
		sendMessage('pushState', state);
	}
}