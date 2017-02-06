import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadge from './BrowserActionBadge';
import ObjectStore from './ObjectStore';
import ContentScriptTab from './ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';

console.log('loading eventPage.ts...');

// server
const serverApi = new ServerApi({
	onAuthenticationStatusChanged: isAuthenticated => {
		// update icon
		updateIcon();
		// signal content scripts
		if (isAuthenticated) {
			tabs.getAll().forEach(tab => contentScriptApi.reinitialize(tab.id));
		} else {
			tabs.getAll().forEach(tab => contentScriptApi.terminate(tab.id));
		}
	},
	onRequestChanged: updateIcon,
	onCacheUpdated: updateIcon
});

// tabs
const tabs = new ObjectStore<number, ContentScriptTab>('tabs', 'session', t => t.id);

// content script
const contentScriptApi = new ContentScriptApi({
	onRegisterContentScript: (tabId, url) => {
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		updateIcon();
		// return source and options
		return serverApi
			.findSource(tabId, new URL(url).hostname)
			.then(source => ({ source, options: serverApi.contentScriptOptions }));
	},
	onRegisterPage: (tabId, data) => {
		// get read state
		return serverApi
			.getUserArticle(tabId, data)
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
	onCommitReadState: data => {
		// commit read state
		serverApi.commitReadState(data);
	},
	onUnregisterContentScript: tabId => {
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
							.getUserArticleFromCache(tab.articleId)
							.then(article => {
								const pendingRequests = serverApi.getRequests(tab);
								drawBrowserActionIcon(
									'signedIn',
									article ? article.percentComplete : 0,
									article && article.percentComplete >= serverApi.eventPageOptions.articleUnlockThreshold ? 'unlocked' : 'locked'
								);
								browserActionBadge.set(pendingRequests.some(r => r.type === 'FindSource' || r.type === 'GetUserArticle') ? 'loading' : article ? article.commentCount : null);
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