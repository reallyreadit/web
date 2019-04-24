import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import SetStore from '../../common/webStorage/SetStore';
import ContentScriptTab from '../common/ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import BrowserActionApi from './BrowserActionApi';
import ExtensionState from '../common/ExtensionState';
import WebAppApi from './WebAppApi';

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
	onArticleLookupRequestChanged: () => {
		console.log('serverApi.onArticleLookupRequestChanged');
		getState().then(updateIcon);
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
const tabs = new SetStore<number, ContentScriptTab>('tabs', t => t.id);

// browser action
const browserActionApi = new BrowserActionApi({
	onLoad: () => getState(),
	onAckNewReply: () => serverApi.ackNewReply(),
	onSetStarred: (articleId, isStarred) => serverApi
		.setStarred(articleId, isStarred)
		.then(article => {
			if (article) {
				webAppApi.articleUpdated({ article, isCompletionCommit: false });
			}
		})
});

// content script
const contentScriptApi = new ContentScriptApi({
	onRateArticle: (tabId, articleId, score) => serverApi
		.rateArticle(articleId, score)
		.then(result => {
			webAppApi.articleUpdated({
				article: result.article,
				isCompletionCommit: false
			});
			return result;
		}),
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
				loadPage: isAuthenticated,
				parseMode: JSON.parse(localStorage.getItem('parseMode')),
				showOverlay: JSON.parse(localStorage.getItem('showOverlay')),
				sourceRules: serverApi.getSourceRules(new URL(url).hostname)
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
				return result;
			});
	},
	onCommitReadState: (tabId, commitData, isCompletionCommit) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		return serverApi
			.commitReadState(tabId, commitData)
			.then(article => {
				if (article) {
					webAppApi.articleUpdated({ article, isCompletionCommit });
				}
				return article;
			});
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
	},
	onLoadContentParser: tabId => {
		chrome.tabs.executeScript(tabId, { file: './content-script/content-parser/bundle.js' });
	},
	onGetComments: serverApi.getComments,
	onPostComment: form => {
		return serverApi
			.postComment(form)
			.then(result => {
				webAppApi.articleUpdated({
					article: result.article,
					isCompletionCommit: false
				});
				webAppApi.commentPosted(result.comment);
				return result;
			});
	}
});

// web app
const webAppApi = new WebAppApi({
	onArticleUpdated: event => {
		// update browser action
		serverApi.cacheArticle(event.article);
		// update content script
		tabs
			.getAll()
			.filter(tab => tab.articleId === event.article.id)
			.forEach(tab => {
				contentScriptApi.articleUpdated(tab.id, event);
			});
	},
	onCommentPosted: comment => {
		// update content script
		tabs
			.getAll()
			.filter(tab => tab.articleId === comment.articleId)
			.forEach(tab => {
				contentScriptApi.commentPosted(tab.id, comment);
			});
	},
	onNewReplyNotificationUpdated: notification => {
		// process
		serverApi.processNewReplyNotification(notification);
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
				isOnHomePage = focusedChromeTab && focusedChromeTab.url && new URL(focusedChromeTab.url).hostname === window.reallyreadit.extension.config.web.host,
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
			// content script tab
			drawBrowserActionIcon(
				'signedIn',
				state.showNewReplyIndicator
			);
			browserActionBadgeApi.set({
				isLoading: !!serverApi.getArticleLookupRequests(state.focusedTab.id).length,
				value: state.userArticle
			});
		} else {
			// not one of our tabs
			drawBrowserActionIcon('signedIn', state.showNewReplyIndicator);
			browserActionBadgeApi.set();
		}
	} else {
		// signed out
		drawBrowserActionIcon('signedOut', false);
		browserActionBadgeApi.set();
	}
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('chrome.runtime.onInstalled');
	// initialize settings
	localStorage.setItem('parseMode', JSON.stringify('analyze'));
	localStorage.setItem('showOverlay', JSON.stringify(false));
	// clear storage
	tabs.clear();
	// update icon
	getState().then(updateIcon);
	// message rrit tabs
	webAppApi.extensionInstalled();
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
	}
);
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	if (details.transitionType === 'link' && tabs.get(details.tabId)) {
		console.log('chrome.webNavigation.onHistoryStateUpdated (tabId: ' + details.tabId + ', ' + details.url + ')');
		contentScriptApi.updateHistoryState(details.tabId, details.url);
	}
});