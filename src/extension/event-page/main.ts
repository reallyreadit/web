import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import SetStore from './SetStore';
import ContentScriptTab from '../common/ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import RequestType from './RequestType';
import BrowserActionApi from './BrowserActionApi';
import ExtensionState from '../common/ExtensionState';

console.log('loading main.ts...');

// server
const serverApi = new ServerApi({
	onAuthenticationStatusChanged: isAuthenticated => {
		console.log('serverApi.onAuthenticationStatusChanged');
		// update icon
		getState().then(updateIcon);
		// signal content scripts
		if (isAuthenticated) {
			tabs.getAll().forEach(tab => contentScriptApi.loadPage(tab.id));
		} else {
			tabs.getAll().forEach(tab => contentScriptApi.unloadPage(tab.id));
		}
	},
	onRequestChanged: type => {
		if (type & (RequestType.FindSource | RequestType.FindUserArticle)) {
			console.log('serverApi.onRequestChanged');
			getState().then(updateIcon);
		}
	},
	onCacheUpdated: () => {
		console.log('serverApi.onCacheUpdated');
		getState().then(state => {
			updateIcon(state);
			browserActionApi.pushState(state);
		});
	}
});

// tabs
const tabs = new SetStore<number, ContentScriptTab>('tabs', 'local', t => t.id);

// browser action
const browserActionApi = new BrowserActionApi({
	onLoad: () => {
		serverApi.checkNewReplyNotification();
		return getState();
	},
	onAckNewReply: () => serverApi.ackNewReply()
});

// content script
const contentScriptApi = new ContentScriptApi({
	onRegisterContentScript: (tabId, url) => {
		console.log(`contentScriptApi.onRegisterContentScript (tabId: ${tabId})`);
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		getState().then(updateIcon);
		// return config
		return serverApi
			.getAuthStatus()
			.then(isAuthenticated => ({
				config: serverApi.contentScriptConfig,
				showOverlay: JSON.parse(localStorage.getItem('showOverlay')),
				loadPage: isAuthenticated
			}));
	},
	onRegisterPage: (tabId, data) => {
		console.log(`contentScriptApi.onRegisterPage (tabId: ${tabId})`);
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
				getState().then(updateIcon);
				// return page init data
				return result.userPage;
			});
	},
	onCommitReadState: (tabId, data) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		serverApi.commitReadState(tabId, data);
	},
	onUnregisterPage: tabId => {
		console.log(`contentScriptApi.onUnregisterPage (tabId: ${tabId})`);
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		getState().then(updateIcon);
	},
	onUnregisterContentScript: tabId => {
		console.log(`contentScriptApi.onUnregisterContentScript (tabId: ${tabId})`);
		// update tabs
		tabs.remove(tabId)
		// update icon
		getState().then(updateIcon);
	}
});

// query current state
function getState() {
	return Promise.all<chrome.tabs.Tab, boolean>([
			new Promise<chrome.tabs.Tab>(resolve => {
				chrome.tabs.query({
					active: true,
					currentWindow: true
				}, result => resolve(result[0]))
			}),
			serverApi.getAuthStatus()
		])
		.then(result => {
			const focusedChromeTab = result[0],
				isAuthenticated = result[1],
				isOnHomePage = focusedChromeTab && focusedChromeTab.url && new URL(focusedChromeTab.url).hostname === config.web.host,
				showNewReplyIndicator = serverApi.hasNewReply();
			let focusedTab: ContentScriptTab;
			if (isAuthenticated && focusedChromeTab && (focusedTab = tabs.get(focusedChromeTab.id))) {
				return Promise.resolve({
					isAuthenticated,
					isOnHomePage,
					showNewReplyIndicator,
					focusedTab,
					userArticle: serverApi.getUserArticle(focusedTab.articleId)
				});
			} else {
				return Promise.resolve({ isAuthenticated, isOnHomePage, showNewReplyIndicator });
			}
		});
}

// icon interface
const browserActionBadgeApi = new BrowserActionBadgeApi();
function updateIcon(state: ExtensionState) {
	console.log('\tupdateIcon');
	if (state.isAuthenticated) {
		if (state.focusedTab) {
			// get pending requests
			const pendingRequests = serverApi.getRequests(state.focusedTab);
			drawBrowserActionIcon(
				'signedIn',
				state.userArticle ? state.userArticle.percentComplete : 0,
				state.userArticle && state.userArticle.percentComplete >= serverApi.eventPageConfig.articleUnlockThreshold ? 'unlocked' : 'locked',
				state.showNewReplyIndicator
			);
			browserActionBadgeApi.set(pendingRequests.some(r => !!(r.type & (RequestType.FindSource | RequestType.FindUserArticle))) ? 'loading' : state.userArticle ? state.userArticle.commentCount : null);
		} else {
			// not one of our tabs
			drawBrowserActionIcon('signedIn', 0, 'locked', state.showNewReplyIndicator);
			browserActionBadgeApi.set();
		}
	} else {
		// signed out
		drawBrowserActionIcon('signedOut', 0, 'locked', false);
		browserActionBadgeApi.set();
	}
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('chrome.runtime.onInstalled');
	// initialize settings
	localStorage.setItem('showOverlay', JSON.stringify(false));
	// clear storage
	tabs.clear();
	// update icon
	getState().then(updateIcon);
});
chrome.runtime.onStartup.addListener(() => {
	console.log('chrome.tabs.onStartup');
	// clear tabs
	tabs.clear();
	// update icon
	getState().then(updateIcon);
});
chrome.tabs.onActivated.addListener(activeInfo => {
	console.log('chrome.tabs.onActivated (tabId: ' + activeInfo.tabId + ')');
	// update icon
	getState().then(updateIcon);
});
chrome.windows.onFocusChanged.addListener(
	windowId => {
		if (windowId !== chrome.windows.WINDOW_ID_NONE) {
			console.log('chrome.windows.onFocusChanged (windowId: ' + windowId + ')');
			// update icon
			getState().then(updateIcon);
		}
	},
	{ windowTypes: ['normal'] }
);
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	if (details.transitionType === 'link') {
		console.log('chrome.webNavigation.onHistoryStateUpdated (tabId: ' + details.tabId + ', ' + details.url + ')');
		contentScriptApi.updateHistoryState(details.tabId, details.url);
	}
});
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => sendResponse(true));