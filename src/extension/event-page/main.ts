import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadge from './BrowserActionBadge';
import ObjectStore from './ObjectStore';
import ContentScriptTab from './ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import RequestType from './RequestType';

console.log('loading main.ts...');

// server
const serverApi = new ServerApi({
	onAuthenticationStatusChanged: isAuthenticated => {
		console.log('serverApi.onAuthenticationStatusChanged');
		// update icon
		updateIcon();
		// signal content scripts
		if (isAuthenticated) {
			tabs.getAll().forEach(tab => contentScriptApi.loadPage(tab.id));
		} else {
			tabs.getAll().forEach(tab => contentScriptApi.unloadPage(tab.id));
		}
	},
	onRequestChanged: type => {
		if (type & (RequestType.FindSource | RequestType.GetUserArticle)) {
			console.log('serverApi.onRequestChanged');
			updateIcon();
		}
	},
	onCacheUpdated: () => {
		console.log('serverApi.onCacheUpdated');
		updateIcon();
	}
});

// tabs
const tabs = new ObjectStore<number, ContentScriptTab>('tabs', 'session', t => t.id);

// content script
const contentScriptApi = new ContentScriptApi({
	onRegisterContentScript: (tabId, url) => {
		console.log('contentScriptApi.onRegisterContentScript');
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		updateIcon();
		// return source and config
		return serverApi
			.findSource(tabId, new URL(url).hostname)
			.then(source => ({ source, config: serverApi.contentScriptConfig }));
	},
	onRegisterPage: (tabId, data) => {
		console.log('contentScriptApi.onRegisterPage');
		// get read state
		return serverApi
			.registerPage(tabId, data)
			.then(result => {
				// update tabs
				tabs.set({
					id: tabId,
					articleId: result.userArticle.id
				})
				// update icon
				updateIcon();
				// return page init data
				return result.userPage;
			});
	},
	onCommitReadState: (tabId, data) => {
		console.log('contentScriptApi.onCommitReadState');
		// commit read state
		serverApi.commitReadState(tabId, data);
	},
	onUnregisterPage: tabId => {
		console.log('contentScriptApi.onUnregisterPage');
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		updateIcon();
	},
	onUnregisterContentScript: tabId => {
		console.log('contentScriptApi.onUnregisterContentScript');
		// update tabs
		tabs.remove(tabId)
		// update icon
		updateIcon();
	}
});

// icon interface
const browserActionBadge = new BrowserActionBadge();
function updateIcon() {
	console.log('\tupdateIcon');
	serverApi
		.getAuthStatus()
		.then(isAuthenticated => {
			if (isAuthenticated) {
				getFocusedTab(chromeTab => {
					const tab = tabs.get(chromeTab.id);
					if (tab) {
						// get article and pending requests
						serverApi
							.getUserArticle(tab.articleId)
							.then(article => {
								const pendingRequests = serverApi.getRequests(tab);
								drawBrowserActionIcon(
									'signedIn',
									article ? article.percentComplete : 0,
									article && article.percentComplete >= serverApi.eventPageConfig.articleUnlockThreshold ? 'unlocked' : 'locked'
								);
								browserActionBadge.set(pendingRequests.some(r => !!(r.type & (RequestType.FindSource | RequestType.GetUserArticle))) ? 'loading' : article ? article.commentCount : null);
							});
					} else {
						// not one of our tabs
						drawBrowserActionIcon('signedIn', 0, 'locked');
						browserActionBadge.set();
					}
				});
			} else {
				// signed out
				drawBrowserActionIcon('signedOut', 0, 'locked');
				browserActionBadge.set();
			}
		});
}

// tab helpers
function getActiveTab(window: chrome.windows.Window) {
	return window.tabs.find(t => t.active);
}
function getFocusedWindow(callback: (window: chrome.windows.Window) => void) {
	chrome.windows.getLastFocused(
		{
			populate: true,
			windowTypes: ['normal']
		},
		callback
	);
}
function getFocusedTab(callback: (tab: chrome.tabs.Tab) => void) {
	getFocusedWindow(w => callback(getActiveTab(w)));
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('chrome.runtime.onInstalled');
	// clear storage
	serverApi.clearCache();
	tabs.clear();
	// update icon
	updateIcon();
});
chrome.tabs.onActivated.addListener(activeInfo => {
	console.log('chrome.tabs.onActivated (tabId: ' + activeInfo.tabId + ')');
	// update icon
	updateIcon();
});
chrome.windows.onFocusChanged.addListener(
	windowId => {
		if (windowId !== chrome.windows.WINDOW_ID_NONE) {
			console.log('chrome.windows.onFocusChanged (windowId: ' + windowId + ')');
			// update icon
			updateIcon();
		}
	},
	{ windowTypes: ['normal'] }
);