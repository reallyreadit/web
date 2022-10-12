import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';
import ObjectStore from '../../common/webStorage/ObjectStore';
import { Message } from '../../common/MessagingContext';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';

/**
 * An API for the event page to communicate with Readup's web app tabs, if any are running.
 */
export default class WebAppApi {
	private readonly _tabs = new ObjectStore<number[]>('webAppTabs', [], 'localStorage');
	constructor(
		handlers: {
			onArticleUpdated: (event: ArticleUpdatedEvent) => void,
			onAuthServiceLinkCompleted: (response: AuthServiceBrowserLinkResponse) => void,
			onCommentPosted: (comment: CommentThread) => void,
			onCommentUpdated: (comment: CommentThread) => void,
			onDisplayPreferenceChanged: (preference: DisplayPreference) => void,
			onUserSignedIn: (profile: WebAppUserProfile) => void,
			onUserSignedOut: () => void,
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
						case 'authServiceLinkCompleted':
							handlers.onAuthServiceLinkCompleted(message.data);
							break;
						case 'commentPosted':
							handlers.onCommentPosted(message.data);
							break;
						case 'commentUpdated':
							handlers.onCommentUpdated(message.data);
							break;
						case 'displayPreferenceChanged':
							handlers.onDisplayPreferenceChanged(message.data);
							break;
						case 'registerPage':
							this.addTab(sender.tab.id);
							break;
						case 'unregisterPage':
							// sender.tab.id is undefined in Firefox
							// tab won't be removed until a messaging error occurs
							this.removeTab(sender.tab.id);
							break;
						case 'userSignedIn':
							handlers.onUserSignedIn(message.data);
							break;
						case 'userSignedOut':
							handlers.onUserSignedOut();
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
								console.log(`[WebAppApi] error sending message to tab # ${tabId}, message: ${chrome.runtime.lastError.message}`);
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
	public clearTabs() {
		this._tabs.clear();
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
	public displayPreferenceChanged(preference: DisplayPreference) {
		this.broadcastMessage({
			type: 'displayPreferenceChanged',
			data: preference
		});
	}

	/**
	 * Inject the content scripts in any running Readup web app tabs that will allow this event page to
	 * communicate with the web app.
	 */
	public injectContentScripts() {
		// some browsers do not allow querying whitelisted urls without 'tabs' permission
		const webAppBaseUrl = window.reallyreadit.extension.config.webServer.protocol + '://' + window.reallyreadit.extension.config.webServer.host + '/';
		chrome.tabs.query(
			{
				url: webAppBaseUrl + '*',
				status: 'complete'
			},
			tabs => {
				if (chrome.runtime.lastError) {
					console.log('[WebAppApi] error querying tabs');
					return;
				}
				tabs.forEach(
					tab => {
						// safari allows querying but returns all tabs with the url set to empty strings
						if (!tab.url?.startsWith(webAppBaseUrl)) {
							return;
						}
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