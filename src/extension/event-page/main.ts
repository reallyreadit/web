import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import ObjectStore from './ObjectStore';
import ContentScriptTab from './ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import RequestType from './RequestType';
import BrowserActionApi from './BrowserActionApi';
import UserArticle from '../common/UserArticle';

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
const tabs = new ObjectStore<number, ContentScriptTab>('tabs', 'local', t => t.id);

// browser action
new BrowserActionApi({
	onGetState: () => getState().then(state => ({
		isAuthenticated: state.isAuthenticated,
		userArticle: state.userArticle,
		showOverlay: JSON.parse(localStorage.getItem('showOverlay'))
	})),
	onUpdateShowOverlay: showOverlay => {
		// update settings
		localStorage.setItem('showOverlay', JSON.stringify(showOverlay));
		// update tabs
		tabs.getAll().forEach(tab => contentScriptApi.showOverlay(tab.id, showOverlay));
	}
});

// content script
const contentScriptApi = new ContentScriptApi({
	onRegisterContentScript: (tabId, url) => {
		console.log(`contentScriptApi.onRegisterContentScript (tabId: ${tabId})`);
		// update tabs
		tabs.set({ id: tabId });
		// update icon
		updateIcon();
		// return source and config
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
				updateIcon();
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
		updateIcon();
	},
	onUnregisterContentScript: tabId => {
		console.log(`contentScriptApi.onUnregisterContentScript (tabId: ${tabId})`);
		// update tabs
		tabs.remove(tabId)
		// update icon
		updateIcon();
	}
});

// query current state
function getState() {
	return Promise
		.all([
			serverApi.getAuthStatus(),
			new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.query({
				active: true,
				currentWindow: true
			}, result => resolve(result[0])))
		])
		.then<{
			isAuthenticated: boolean,
			focusedTab: ContentScriptTab,
			userArticle: UserArticle
		}>(values => {
			const isAuthenticated = values[0],
				  focusedChromeTab = values[1];
			let focusedTab: ContentScriptTab;
			if (isAuthenticated && focusedChromeTab && (focusedTab = tabs.get(focusedChromeTab.id))) {
				return new Promise(resolve => serverApi
					.getUserArticle(focusedTab.articleId)
					.then(userArticle => resolve({ isAuthenticated: true, focusedTab, userArticle })));
			} else {
				return Promise.resolve({ isAuthenticated });
			}
		});
}

// icon interface
const browserActionBadgeApi = new BrowserActionBadgeApi();
function updateIcon() {
	console.log('\tupdateIcon');
	getState().then(state => {
		if (state.isAuthenticated) {
			if (state.focusedTab) {
				// get pending requests
				const pendingRequests = serverApi.getRequests(state.focusedTab);
				drawBrowserActionIcon(
					'signedIn',
					state.userArticle ? state.userArticle.percentComplete : 0,
					state.userArticle && state.userArticle.percentComplete >= serverApi.eventPageConfig.articleUnlockThreshold ? 'unlocked' : 'locked'
				);
				browserActionBadgeApi.set(pendingRequests.some(r => !!(r.type & (RequestType.FindSource | RequestType.GetUserArticle))) ? 'loading' : state.userArticle ? state.userArticle.commentCount : null);
			} else {
				// not one of our tabs
				drawBrowserActionIcon('signedIn', 0, 'locked');
				browserActionBadgeApi.set();
			}
		} else {
			// signed out
			drawBrowserActionIcon('signedOut', 0, 'locked');
			browserActionBadgeApi.set();
		}
	});
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('chrome.runtime.onInstalled');
	// initialize settings
	localStorage.setItem('showOverlay', JSON.stringify(false));
	// clear storage
	serverApi.clearCache();
	tabs.clear();
	// update icon
	updateIcon();
});
chrome.runtime.onStartup.addListener(() => {
	console.log('chrome.tabs.onStartup');
	// clear tabs
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
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	if (details.transitionType === 'link') {
		console.log('chrome.webNavigation.onHistoryStateUpdated (tabId: ' + details.tabId + ', ' + details.url + ')');
		contentScriptApi.updateHistoryState(details.tabId, details.url);
	}
});
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => sendResponse(true));
chrome.runtime.onUpdateAvailable.addListener(chrome.runtime.reload);