import ObjectStore from '../../common/webStorage/ObjectStore';
import { Message } from '../../common/MessagingContext';

export default class WebAppApi {
	private readonly _tabs = new ObjectStore<number[]>('webAppTabs', [], 'localStorage');
	constructor() {
		// listen for messages from content script
		chrome.runtime.onMessage.addListener(
			(message, sender) => {
				if (message.to === 'eventPage' && message.from === 'webAppContentScript') {
					console.log(`[WebAppApi] received ${message.type} message from tab # ${sender.tab?.id}`);
					switch (message.type) {
						case 'registerPage':
							this.addTab(sender.tab.id);
							break;
						case 'unregisterPage':
							// sender.tab.id is undefined in Firefox
							// tab won't be removed until a messaging error occurs
							this.removeTab(sender.tab.id);
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
	private removeTab(id: number) {
		const tabs = this._tabs.get();
		if (tabs.includes(id)) {
			tabs.splice(tabs.indexOf(id), 1);
			this._tabs.set(tabs);
		}
	}
	public broadcastMessage<T>(message: Message) {
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
	public clearTabs() {
		this._tabs.clear();
	}
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
}