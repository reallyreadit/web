import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadge from './BrowserActionBadge';
import ObjectStore from './ObjectStore';
import Tab from './Tab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';

console.log('loading eventPage.ts...');

// server
const serverApi = new ServerApi({
	onAuthenticationChanged: isAuthenticated => {
		// update icon
		updateIcon();
		// signal content scripts

	},
	onArticleUpdated: () => updateIcon()
});

// tabs
const tabs = new ObjectStore<number, Tab>('tabs', 'session', t => t.id);

// content script
new ContentScriptApi({
	onFindSource: hostname => serverApi.findSource(hostname),
	onRegisterTab: (tabId, articleSlug) => {
		// update tabs store
		tabs.set({
			id: tabId,
			articleSlug
		});
		// update icon
		updateIcon();
	},
	onGetOptions: () => serverApi.contentScriptOptions,
	onCommit: data => {
		// commit
		const result = serverApi.commit(data);
		// update icon
		updateIcon();
		// return result
		return result;
	},
	onUnregisterTab: tabId => {
		// update tabs store
		tabs.remove(tabId)
		// update icon
		updateIcon();
	}
});

// icon interface
const browserActionBadge = new BrowserActionBadge();
function updateIcon() {
	if (serverApi.isAuthenticated) {
		getFocusedTab(chromeTab => {
			console.log('\tupdateIcon (tabId: ' + chromeTab.id + ')');
			const tab = tabs.get(chromeTab.id);
			if (tab) {
				const article = serverApi.getArticle(tab.articleSlug);
				drawBrowserActionIcon(
					'signedIn',
					article.percentComplete,
					article.percentComplete >= serverApi.eventPageOptions.articleUnlockThreshold ? 'unlocked' : 'locked'
				)
				browserActionBadge.set(typeof article.commentCount === 'number' ? article.commentCount : 'loading');
			} else {
				drawBrowserActionIcon('signedIn', 0, 'locked');
				browserActionBadge.set();
			}
		});
	} else {
		drawBrowserActionIcon('signedOut', 0, 'locked');
		browserActionBadge.set();
	}
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