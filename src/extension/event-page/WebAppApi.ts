import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import Post from '../../common/models/social/Post';

function stringifyForLiteral(obj: {}) {
	return JSON
		.stringify(obj)
		.replace(/\\/g, '\\\\')
		.replace(/'/g, '\\\'');
}
function sendMessage(type: string, data: {} = null) {
	chrome.tabs.query(
		{},
		tabs => tabs
			.filter(tab => tab.url && new URL(tab.url).hostname === window.reallyreadit.extension.config.web.host)
			.forEach(tab => chrome.tabs.executeScript(
				tab.id,
				{ code: `window.postMessage('${stringifyForLiteral({ type, data })}', '*');` }
			))
	);
}
export default class WebAppApi {
	constructor(
		handlers: {
			onArticleUpdated: (event: ArticleUpdatedEvent) => void,
			onCommentPosted: (comment: CommentThread) => void,
			onNewReplyNotificationUpdated: (notification: NewReplyNotification) => void
		}
	) {
		chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'articleUpdated':
					handlers.onArticleUpdated(message.data);
					break;
				case 'commentPosted':
					handlers.onCommentPosted(message.data);
					break;
				case 'newReplyNotificationUpdated':
					handlers.onNewReplyNotificationUpdated(message.data);
					break;
				case 'ping':
					sendResponse(true);
					return true;
			}
			return false;
		});
	}
	public articlePosted(post: Post) {
		sendMessage('articlePosted', post);
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		sendMessage('articleUpdated', event);
	}
	public commentPosted(comment: CommentThread) {
		sendMessage('commentPosted', comment);
	}
	public extensionInstalled() {
		sendMessage('extensionInstalled');
	}
}