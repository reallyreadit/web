import Page from '../common/Page';
import ReadState from '../common/ReadState';
import icon from './icon';

console.log('eventPage.js');

interface UserArticlePage {
	urlId: string,
	number: number,
	readStateArray?: number[]
}
interface UserArticle {
	commentCount?: number,
	pages?: UserArticlePage[]
}
interface PageLink {
	url: string,
	number: number
}
interface Tab {
	id: number,
	urlId: string
}
interface IconArticle {
	percentComplete: number,
	state: 'locked' | 'unlocked'
}

// server interface
var pendingRequests: { urlId: string }[] = [];
function fetchUserArticle(urlId: string, callback: (userArticle: UserArticle) => void) {
	// check pending requests
	if (!pendingRequests.some(function (request) {
		return request.urlId === urlId;
	})) {
		// add request
		pendingRequests.push({
			urlId: urlId
		});
		// make request
		setTimeout(function () {
			// clear request
			pendingRequests.splice(pendingRequests.indexOf(pendingRequests.filter(function (request) {
				return request.urlId === urlId;
			})[0]), 1);
			// fire callback
			callback({
				commentCount: Math.floor(Math.random() * 99)
			});
			// update icon if the focused tab's urlId matches this urlId
			getFocusedTab(function (chromeTab) {
				var tabs = getStore('tabs'),
					tab = findTab(chromeTab.id, tabs);
				if (tab !== null && tab.urlId === urlId) {
					updateIcon(tab.id, tabs);
				}
			});
		}, Math.floor(Math.random() * 800) + 800);
	}
}

// local storage interface
interface StoreMap {
	userArticles: UserArticle[],
	tabs: Tab[]
}
function initializeStore(key: keyof StoreMap) {
	localStorage.setItem(key, JSON.stringify([]));
}
function getStore<K extends keyof StoreMap>(key: K) {
	return JSON.parse(localStorage.getItem(key)) as StoreMap[K];
}
function setStore<K extends keyof StoreMap>(key: K, values: StoreMap[K]) {
	localStorage.setItem(key, JSON.stringify(values));
}
// - user articles
function findUserArticle(urlId: string, userArticles: UserArticle[]) {
	userArticles = userArticles || getStore('userArticles');
	for (var i = 0; i < userArticles.length; i++) {
		for (var j = 0; j < userArticles[i].pages.length; j++) {
			if (userArticles[i].pages[j].urlId === urlId) {
				return userArticles[i];
			}
		}
	}
	return null;
}
function findUserArticlePage(urlId: string, userArticles: UserArticle[]) {
	userArticles = userArticles || getStore('userArticles');
	for (var i = 0; i < userArticles.length; i++) {
		for (var j = 0; j < userArticles[i].pages.length; j++) {
			if (userArticles[i].pages[j].urlId === urlId) {
				return userArticles[i].pages[j];
			}
		}
	}
	return null;
}
function addUserArticle(urlId: string, values: { pageNumber: number, pageLinks: PageLink[] }, userArticles: UserArticle[]) {
	var existingUserArticle = findUserArticle(urlId, userArticles);
	if (existingUserArticle === null) {
		var userArticle = {
			pages: [{
				urlId: urlId,
				number: values.pageNumber
			}]
		};
		if (values.pageLinks !== undefined) {
			userArticle.pages = userArticle.pages.concat(values.pageLinks
				.map(function (pageLink) {
					return {
						urlId: Page.getUrlId(pageLink.url),
						number: pageLink.number,
						readStateArray: undefined
					};
				})
				.filter(function (page) {
					return page.urlId !== urlId;
				})
			);
		}
		userArticles.push(userArticle);
	}
}
function commitUserArticlePageReadState(urlId: string, readStateArray: number[], userArticles: UserArticle[]) {
	var page = findUserArticlePage(urlId, userArticles);
	if (page !== null && (page.readStateArray === undefined || (new ReadState(readStateArray).getPercentComplete() > new ReadState(page.readStateArray).getPercentComplete()))) {
		page.readStateArray = readStateArray;
	}
}
function updateUserArticle(urlId: string) {
	fetchUserArticle(urlId, function (userArticle) {
		var userArticles = getStore('userArticles'), 
			localUserArticle = findUserArticle(urlId, userArticles);
		localUserArticle.commentCount = userArticle.commentCount;
		/*userArticle.pages.forEach(function (page) {
			var localPage = localUserArticle.pages.filter(function (localPage) {
				return localPage.urlId === page.urlId; 
			})[0];
			if (localPage !== undefined) {
				localPage.number = page.number;
				if (page.readStateArray !== undefined &&
					new ReadState(page.readStateArray).getPercentComplete() > new ReadState(localPage.readStateArray).getPercentComplete()) {
						localPage.readStateArray = page.readStateArray;
				}
			} else {
				localUserArticle.pages.push(page);
			}
		});
		localUserArticle.pages
			.filter(function (localPage) {
				return !userArticle.pages.some(function (page) {
					return page.urlId === localPage.urlId;
				});
			})
			.forEach(function (page) {
				localUserArticle.pages.splice(localUserArticle.pages.indexOf(page), 1);
			});*/
		setStore('userArticles', userArticles);
	});
}
// - tabs
function findTab(id: number, tabs: Tab[]) {
	tabs = tabs || getStore('tabs');
	for (var i = 0; i < tabs.length; i++) {
		if (tabs[i].id === id) {
			return tabs[i];
		}
	}
	return null;
}
function registerTab(id: number, urlId: string, tabs: Tab[]) {
	var tab = findTab(id, tabs);
	if (tab !== null) {
		tab.urlId = urlId;
	} else {
		tabs.push({
			id: id,
			urlId: urlId
		});
	}
}
function unregisterTab(id: number, tabs: Tab[]) {
	tabs.splice(tabs.indexOf(findTab(id, tabs)), 1);
}

// options
var options = {
	// percentage of words that must be read before a user can comment
	articleUnlockThreshold: 90,
	// options for reader.js
	readerOptions: {
		// number of milliseconds it takes to read a word
		wordReadRate: 100,
		// number of milliseconds between block offset updates (in case an ad or other element
		// expands/collapses and shifts page content)
		pageOffsetUpdateRate: 2000,
		readStateCommitRate: 2000,
		urlCheckRate: 2500
	}
};

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
	for (var i = 0; i < window.tabs.length; i++) {
		if (window.tabs[i].active) {
			return window.tabs[i];
		}
	}
	return null;
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
	getFocusedWindow(function (window) {
		callback(getActiveTab(window));
	});
}
function updateIcon(tabId: number, tabs?: Tab[], userArticles?: UserArticle[]) {
	console.log('\tupdateIcon (tabId: ' + tabId + ')');
	var tab = findTab(tabId, tabs);
	if (tab !== null) {
		var userArticle = findUserArticle(tab.urlId, userArticles),
			iconArticle: IconArticle, iconCommentCount;
		if (userArticle.pages.some(function (page) {
			return page.readStateArray !== undefined;
		})) {
			var percentComplete = new ReadState(
					userArticle.pages
						.filter(function (page) {
							return page.readStateArray !== undefined;
						})
						.map(function (page) {
							return new ReadState(page.readStateArray);
						})
				).getPercentComplete();
			iconArticle = {
				percentComplete: percentComplete,
				state: percentComplete >= options.articleUnlockThreshold ? 'unlocked' : 'locked' 
			};
		} else {
			iconArticle = null;
		}
		if (pendingRequests.some(function (request) {
			return request.urlId === tab.urlId; 
		})) {
			iconCommentCount = 'loading';
		} else {
			iconCommentCount = userArticle.commentCount;
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
	// set up the local storage
	initializeStore('userArticles');
	initializeStore('tabs');
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
	if (!ignoreTabsOnActivated) {
		console.log('chrome.tabs.onActivated (tabId: ' + activeInfo.tabId + ')');
		// update icon
		updateIcon(activeInfo.tabId);
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
					updateIcon(getActiveTab(window).id);
					ignoreTabsOnActivated = false;
				}
			);
		}
	},
	{ windowTypes: ['normal'] }
);

// reader interface
// - event handlers
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	switch (request.command) {
		case 'registerTab':
			// update tabs store
			var tabs = getStore('tabs');
			registerTab(sender.tab.id, request.data.urlId, tabs);
			setStore('tabs', tabs);
			// check for user article page
			var userArticles = getStore('userArticles'),
				page = findUserArticlePage(request.data.urlId, userArticles),
				readStateArray;
			if (page === null) {
				// add new user article
				addUserArticle(
					request.data.urlId,
					{
						pageNumber: request.data.pageNumber,
						pageLinks: request.data.pageLinks
					},
					userArticles
				);
				setStore('userArticles', userArticles);
				// update article from server
				updateUserArticle(request.data.urlId);
			} else {
				// return read state array
				readStateArray = page.readStateArray;
			}
			// update icon if this tab is focused
			getFocusedTab(function (tab) {
				if (tab.id === sender.tab.id) {
					updateIcon(tab.id, tabs, userArticles);
				}
			});
			// return page data and reader options
			callback(
				{
					pageData: {
						urlId: request.data.urlId,
						readStateArray: readStateArray
					},
					options: options.readerOptions
				}
			);
			break;
		case 'unregisterTab':
			// remove tab
			var tabs = getStore('tabs');
			unregisterTab(sender.tab.id, tabs);
			setStore('tabs', tabs);
			// commit read state
			var userArticles = getStore('userArticles');
			commitUserArticlePageReadState(request.data.urlId, request.data.readStateArray, userArticles);
			setStore('userArticles', userArticles);
			break;
		case 'commitReadState':
			// commit read state
			var userArticles = getStore('userArticles');
			commitUserArticlePageReadState(request.data.urlId, request.data.readStateArray, userArticles);
			setStore('userArticles', userArticles);
			// update icon if this tab is focused
			getFocusedTab(function (tab) {
				if (tab.id === sender.tab.id) {
					updateIcon(tab.id, tabs, userArticles);
				}
			});
			break;
	}
});