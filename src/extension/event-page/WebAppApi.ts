import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';
import { Message } from '../../common/MessagingContext';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import { ReadArticleReference } from '../../app/common/components/Root';

/**
 * An API for the event page to communicate with Readup's web app tabs, if any are running.
 */
export default class WebAppApi {
	constructor(handlers: {
		onArticleUpdated: (event: ArticleUpdatedEvent) => void;
		onAuthServiceLinkCompleted: (
			response: AuthServiceBrowserLinkResponse
		) => void;
		onCommentPosted: (comment: CommentThread) => void;
		onCommentUpdated: (comment: CommentThread) => void;
		onDisplayPreferenceChanged: (preference: DisplayPreference) => void;
		onReadArticle: (article: ReadArticleReference) => void;
		onUserSignedIn: (profile: WebAppUserProfile) => void;
		onUserSignedOut: () => void;
		onUserUpdated: (user: UserAccount) => void;
	}) {
		// listen for messages from content script
		chrome.runtime.onMessage.addListener((message, sender) => {
			if (
				message.to === 'eventPage' &&
				message.from === 'webAppContentScript'
			) {
				console.log(
					`[WebAppApi] received ${message.type} message from tab # ${sender.tab?.id}`
				);
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
					case 'readArticle':
						handlers.onReadArticle(message.data);
						break;
					case 'unregisterPage':
						// sender.tab is undefined in Firefox
						// tab won't be removed until a messaging error occurs
						this.removeTab(sender?.tab?.id);
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
		});
	}
	private async getTabIds() {
		const result = await chrome.storage.local.get('webAppTabs');
		return (result['webAppTabs'] || []) as number[];
	}
	private async setTabIds(tabIds: number[]) {
		await chrome.storage.local.set({ 'webAppTabs': tabIds });
	}
	private async addTab(id: number) {
		const tabIds = await this.getTabIds();
		if (!tabIds.includes(id)) {
			tabIds.push(id);
			await this.setTabIds(tabIds);
		}
	}
	private async broadcastMessage<T>(message: Message) {
		const tabIds = await this.getTabIds();
		for (const tabId of tabIds) {
			console.log(
				`[WebAppApi] sending ${message.type} message to tab # ${tabId}`
			);
			try {
				await chrome.tabs.sendMessage(tabId, message);
			} catch (ex) {
				console.log(
					`[WebAppApi] error sending message to tab # ${tabId}, message: ${ex}`
				);
				await this.removeTab(tabId);
			}
		}
	}
	private async removeTab(id: number) {
		const tabIds = await this.getTabIds();
		if (tabIds.includes(id)) {
			await this.setTabIds(tabIds.filter(existingId => existingId !== id));
		}
	}
	public async articlePosted(post: Post) {
		await this.broadcastMessage({
			type: 'articlePosted',
			data: post,
		});
	}
	public async articleUpdated(event: ArticleUpdatedEvent) {
		await this.broadcastMessage({
			type: 'articleUpdated',
			data: event,
		});
	}
	public async clearTabs() {
		await this.setTabIds([]);
	}
	public async commentPosted(comment: CommentThread) {
		await this.broadcastMessage({
			type: 'commentPosted',
			data: comment,
		});
	}
	public async commentUpdated(comment: CommentThread) {
		await this.broadcastMessage({
			type: 'commentUpdated',
			data: comment,
		});
	}
	public async displayPreferenceChanged(preference: DisplayPreference) {
		await this.broadcastMessage({
			type: 'displayPreferenceChanged',
			data: preference,
		});
	}

	/**
	 * Inject the content scripts in any running Readup web app tabs that will allow this event page to
	 * communicate with the web app.
	 */
	public async injectContentScripts() {
		// some browsers do not allow querying whitelisted urls without 'tabs' permission
		const webAppBaseUrl =
			window.reallyreadit.extension.config.webServer.protocol +
			'://' +
			window.reallyreadit.extension.config.webServer.host +
			'/';
		try {
			const tabs = await chrome.tabs.query({
				url: webAppBaseUrl + '*',
				status: 'complete',
			});
			for (const tab of tabs) {
				// safari allows querying but returns all tabs with the url set to empty strings
				if (!tab.url?.startsWith(webAppBaseUrl)) {
					return;
				}
				console.log(
					'[WebAppApi] injecting content script into tab # ' + tab.id
				);
				chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ['/content-scripts/web-app/bundle.js'],
				});
			}
		} catch {
			console.log('[WebAppApi] error querying tabs');
		}
	}
	public async userUpdated(user: UserAccount) {
		await this.broadcastMessage({
			type: 'userUpdated',
			data: user,
		});
	}
}
