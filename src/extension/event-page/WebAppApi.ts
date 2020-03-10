import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';

function getWebAppTabs() {
	return new Promise<chrome.tabs.Tab[]>(
		resolve => {
			chrome.tabs.query(
				{
					url: window.reallyreadit.extension.config.web.protocol + '://' + window.reallyreadit.extension.config.web.host + '/*',
					status: 'complete'
				},
				resolve
			);
		}
	);
}
function sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
	getWebAppTabs()
		.then(
			tabs => {
				tabs.forEach(
					tab => {
						console.log(`[WebAppApi] sending ${type} message to tab # ${tab.id}`);
						chrome.tabs.sendMessage(
							tab.id,
							{
								type,
								data
							},
							responseCallback
						);
					}
				);
			}
		);
}
export default class WebAppApi {
	constructor(
		handlers: {
			onArticleUpdated: (event: ArticleUpdatedEvent) => void,
			onCommentPosted: (comment: CommentThread) => void,
			onCommentUpdated: (comment: CommentThread) => void,
			onUserUpdated: (user: UserAccount) => void
		}
	) {
		// listen for messages from content script
		chrome.runtime.onMessage.addListener(
			(message, sender) => {
				if (message.to === 'eventPage' && message.from === 'webApp') {
					console.log(`[WebAppApi] received ${message.type} message from tab # ${sender.tab?.id}`);
					switch (message.type) {
						case 'articleUpdated':
							handlers.onArticleUpdated(message.data);
							break;
						case 'commentPosted':
							handlers.onCommentPosted(message.data);
							break;
						case 'commentUpdated':
							handlers.onCommentUpdated(message.data);
							break;
						case 'userUpdated':
							handlers.onUserUpdated(message.data);
							break;
					}
				}
				return false;
			}
		);
	}
	private injectContentScript(tabId: number) {
		console.log('[WebAppApi] injecting content script into tab # ' + tabId);
		chrome.tabs.executeScript(
			tabId,
			{
				file: './web-app-content-script/bundle.js'
			}
		);
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
	public commentUpdated(comment: CommentThread) {
		sendMessage('commentUpdated', comment);
	}
	public injectContentScripts() {
		getWebAppTabs()
			.then(
				tabs => {
					tabs.forEach(
						tab => {
							this.injectContentScript(tab.id);
						}
					);
				}
			);
	}
	public userUpdated(user: UserAccount) {
		sendMessage('userUpdated', user);
	}
}