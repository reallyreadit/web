import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import SetStore from '../../common/webStorage/SetStore';
import ContentScriptTab from '../common/ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import BrowserActionApi from './BrowserActionApi';
import BrowserActionState from '../common/BrowserActionState';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';

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
	onActivateReaderMode: tabId => {
		contentScriptApi.activateReaderMode(tabId);
		tabs.set({
			...tabs.get(tabId),
			isReaderModeActivated: true
		});
	},
	onDeactivateReaderMode: tabId => {
		contentScriptApi.deactivateReaderMode(tabId);
		tabs.set({
			...tabs.get(tabId),
			isReaderModeActivated: false
		});
	},
	onLoad: () => getState(),
	onAckNewReply: () => serverApi.ackNewReply(),
	onSetStarred: (articleId, isStarred) => serverApi
		.setStarred(articleId, isStarred)
		.then(article => {
			webAppApi.articleUpdated({ article, isCompletionCommit: false });
			return article;
		}),
	onToggleContentIdentificationDisplay: tabId => {
		contentScriptApi.toggleContentIdentificationDisplay(tabId);
	},
	onToggleReadStateDisplay: tabId => {
		contentScriptApi.toggleReadStateDisplay(tabId);
	}
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
		tabs.set({
			articleId: null,
			id: tabId,
			isReaderModeActivated: false
		});
		// update icon
		getState().then(updateIcon);
		// return config
		return serverApi
			.getAuthStatus()
			.then(
				isAuthenticated => ({
					loadPage: isAuthenticated,
					sourceRules: serverApi.getSourceRules(new URL(url).hostname)
				})
			);
	},
	onRegisterPage: (tabId, data) => {
		console.log(`contentScriptApi.onRegisterPage (tabId: ${tabId})`);
		// get read state
		return serverApi
			.registerPage(tabId, data)
			.then(result => {
				// update tabs
				tabs.set({
					articleId: result.userArticle.id,
					id: tabId,
					isReaderModeActivated: false
				});
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
		tabs.set({
			articleId: null,
			id: tabId,
			isReaderModeActivated: false
		});
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
function getState(): Promise<BrowserActionState> {
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
			const
				debug = JSON.parse(localStorage.getItem('debug')) as boolean,
				focusedChromeTab = result[0],
				isAuthenticated = result[1],
				isOnHomePage = focusedChromeTab && focusedChromeTab.url && new URL(focusedChromeTab.url).hostname === window.reallyreadit.extension.config.web.host,
				showNewReplyIndicator = serverApi.hasNewReply();
			let activeTab: ContentScriptTab;
			if (isAuthenticated && focusedChromeTab && (activeTab = tabs.get(focusedChromeTab.id))) {
				return Promise.resolve({
					activeTab,
					article: serverApi.getUserArticle(activeTab.articleId),
					debug,
					isAuthenticated,
					isOnHomePage,
					showNewReplyIndicator,
					url: focusedChromeTab.url
				});
			} else {
				return Promise.resolve({
					debug,
					isAuthenticated,
					isOnHomePage,
					showNewReplyIndicator,
					url: focusedChromeTab.url
				});
			}
		});
}

// icon interface
const browserActionBadgeApi = new BrowserActionBadgeApi();
function updateIcon(state: BrowserActionState) {
	console.log('\tupdateIcon');
	if (state.isAuthenticated) {
		if (state.activeTab) {
			// content script tab
			drawBrowserActionIcon(
				'signedIn',
				state.showNewReplyIndicator
			);
			browserActionBadgeApi.set({
				isLoading: !!serverApi.getArticleLookupRequests(state.activeTab.id).length,
				value: state.article
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
	localStorage.removeItem('parseMode');
	localStorage.removeItem('showOverlay');
	localStorage.setItem('debug', JSON.stringify(true));
	// clear storage
	tabs.clear();
	// update icon
	getState().then(updateIcon);
	// message rrit tabs
	webAppApi.extensionInstalled();
	// log new installations or old unrecorded ones
	if (
		details.reason === 'install' ||
		(
			details.reason === 'update' &&
			!localStorage.getItem('installationId')
		)
	) {
		console.log('chrome.runtime.onInstalled (new installation)')
		chrome.runtime.getPlatformInfo(platformInfo => {
			serverApi
				.logExtensionInstallation(platformInfo)
				.then(result => {
					chrome.runtime.setUninstallURL(
						createUrl(window.reallyreadit.extension.config.web, '/extension/uninstall', { installationId: result.installationId })
					);
					localStorage.setItem('installationId', result.installationId);
				})
				.catch(() => {
					console.log('chrome.runtime.onInstalled (error logging installation)')
				});
		});
	}
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