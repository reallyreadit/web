import icon from './icon';
import ObjectStore from './ObjectStore';
import Tab from './Tab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';

console.log('loading eventPage.ts...');

interface IconArticle {
	percentComplete: number,
	state: 'locked' | 'unlocked'
}

// server
const serverApi = new ServerApi();

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
var setIcon = (function () {
	var frameIndex = 0,
		frameCount = 5,
		animationInterval: number;
	return function (params: { article: IconArticle, commentCount: number | string }) {
		// set the icon
		if (params.hasOwnProperty('article')) {
			icon.setIcon(params.article || {});
		}
		// set the badge text
		if (typeof params.commentCount === 'number' || params.commentCount === '') {
			if (animationInterval !== undefined) {
				window.clearInterval(animationInterval);
				animationInterval = undefined;
				frameIndex = 0;
			}
			chrome.browserAction.setBadgeText({ text: params.commentCount.toString() });
		} else if (params.commentCount === 'loading' && animationInterval === undefined) {
			animationInterval = window.setInterval(function () {
				var text = '';
				for (var i = 0; i < frameCount - 1; i++) {
					if (i === frameIndex) {
						text += '.';
					} else {
						text += ' ';
					}
				}
				chrome.browserAction.setBadgeText({ text: text });
				frameIndex = ++frameIndex % frameCount;
			}, 150);
		}
	};
}());

// browser interface
// - utilities
function getActiveTab(window: chrome.windows.Window) {
	return window.tabs.filter(t => t.active)[0];
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
function updateIcon() {
	getFocusedTab(chromeTab => {
		console.log('\tupdateIcon (tabId: ' + chromeTab.id + ')');
		const tab = tabs.get(chromeTab.id);
		if (tab) {
			const article = serverApi.getArticle(tab.articleSlug),
				iconArticle: IconArticle = {
					percentComplete: article.percentComplete,
					state: article.percentComplete >= serverApi.eventPageOptions.articleUnlockThreshold ? 'unlocked' : 'locked' 
				};
			let iconCommentCount: number | string;
			if (article.commentCount) {
				iconCommentCount = article.commentCount;
			} else {
				iconCommentCount = 'loading';
			}
			setIcon({
				article: iconArticle,
				commentCount: iconCommentCount
			});
		} else {
			// set the default icon
			setIcon({
				article: null,
				commentCount: ''
			});
		}
	});
}
// - event handlers
var ignoreTabsOnActivated = false;
chrome.runtime.onInstalled.addListener(function (details) {
	console.log('chrome.runtime.onInstalled');
	// set the default icon
	setIcon({
		article: null,
		commentCount: ''
	});
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
	if (!ignoreTabsOnActivated) {
		console.log('chrome.tabs.onActivated (tabId: ' + activeInfo.tabId + ')');
		// update icon
		updateIcon();
	}
});
chrome.windows.onFocusChanged.addListener(
	function (windowId) {
		if (windowId !== chrome.windows.WINDOW_ID_NONE) {
			console.log('chrome.windows.onFocusChanged (windowId: ' + windowId + ')');
			// tabs.onActivated may not fire after this event so we need to handle
			// the call to updateIcon here and prevent tabs.onActivated from
			// executing if it does fire
			ignoreTabsOnActivated = true;
			chrome.windows.get(
				windowId,
				{
					populate: true,
				},
				function (window) {
					updateIcon();
					ignoreTabsOnActivated = false;
				}
			);
		}
	},
	{ windowTypes: ['normal'] }
);