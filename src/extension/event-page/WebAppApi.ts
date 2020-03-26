import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';
import ObjectStore from '../../common/webStorage/ObjectStore';
import { Message } from '../../common/MessagingContext';

export default class WebAppApi {
	private readonly _tabs = new ObjectStore<number[]>('webAppTabs', [], 'sessionStorage');
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
				if (message.to === 'eventPage' && message.from === 'webAppContentScript') {
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
						case 'registerPage':
							this.addTab(sender.tab.id);
							break;
						case 'unregisterPage':
							// sender.tab.id is undefined in Firefox
							// tab won't be removed until a messaging error occurs
							this.removeTab(sender.tab.id);
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
	private addTab(id: number) {
		const tabs = this._tabs.get();
		if (!tabs.includes(id)) {
			tabs.push(id);
			this._tabs.set(tabs);
		}
	}
	private broadcastMessage<T>(message: Message) {
		this._tabs
			.get()
			.forEach(
				tabId => {
					console.log(`[WebAppApi] sending ${message.type} message to tab # ${tabId}`);
					chrome.tabs.sendMessage(
						tabId,
						message,
						() => {
							if (chrome.runtime.lastError) {
								console.log(`[WebAppApi] error sending message to tab # ${tabId}`);
								this.removeTab(tabId);
							}
						}
					);
				}
			);
	}
	private removeTab(id: number) {
		const tabs = this._tabs.get();
		if (tabs.includes(id)) {
			tabs.splice(tabs.indexOf(id), 1);
			this._tabs.set(tabs);
		}
	}
	public articlePosted(post: Post) {
		this.broadcastMessage({
			type: 'articlePosted',
			data: post
		});
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		this.broadcastMessage({
			type: 'articleUpdated',
			data: event
		});
	}
	public commentPosted(comment: CommentThread) {
		this.broadcastMessage({
			type: 'commentPosted',
			data: comment
		});
	}
	public commentUpdated(comment: CommentThread) {
		this.broadcastMessage({
			type: 'commentUpdated',
			data: comment
		});
	}
	public injectContentScripts() {
		// some browsers do not allow querying whitelisted urls without 'tabs' permission
		chrome.tabs.query(
			{
				url: window.reallyreadit.extension.config.web.protocol + '://' + window.reallyreadit.extension.config.web.host + '/*',
				status: 'complete'
			},
			tabs => {
				if (chrome.runtime.lastError) {
					console.log('[WebAppApi] error querying tabs');
					return;
				}
				tabs.forEach(
					tab => {
						console.log('[WebAppApi] injecting content script into tab # ' + tab.id);
						chrome.tabs.executeScript(
							tab.id,
							{
								file: '/content-scripts/web-app/bundle.js'
							}
						);
					}
				);
			}
		);
	}
	public userUpdated(user: UserAccount) {
		this.broadcastMessage({
			type: 'userUpdated',
			data: user
		});
	}
}