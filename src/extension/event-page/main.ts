import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import SetStore from '../../common/webStorage/SetStore';
import ContentScriptTab from '../common/ContentScriptTab';
import ContentScriptApi from './ContentScriptApi';
import ServerApi from './ServerApi';
import BrowserActionState from '../common/BrowserActionState';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import { createCommentThread } from '../../common/models/social/Post';
import { hasAlert } from '../../common/models/UserAccount';

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
		});
	},
	onUserUpdated: user => {
		console.log('serverApi.onUserUpdated');
		getState().then(state => {
			updateIcon(state);
		});
		webAppApi.userUpdated(user);
	}
});

// tabs
const tabs = new SetStore<number, ContentScriptTab>('tabs', t => t.id);

// content script
const contentScriptApi = new ContentScriptApi({
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
	onLoadContentParser: tabId => {
		try {
			if (
				new SemanticVersion(localStorage.getItem('contentParserVersion'))
					.compareTo(new SemanticVersion(window.reallyreadit.extension.config.contentParserVersion)) > 0
			) {
				console.log(`contentScriptApi.onLoadContentParser (loading content parser from localStorage, tabId: ${tabId})`);
				chrome.tabs.executeScript(tabId, { code: localStorage.getItem('contentParserScript') });
				return;
			}
		} catch {
			// fall back to bundled script
		}
		console.log(`contentScriptApi.onLoadContentParser (loading content parser from bundle, tabId: ${tabId})`);
		chrome.tabs.executeScript(tabId, { file: './content-script/content-parser/bundle.js' });
	},
	onGetComments: serverApi.getComments,
	onPostArticle: form => {
		return serverApi
			.postArticle(form)
			.then(
				post => {
					webAppApi.articlePosted(post);
					webAppApi.articleUpdated({
						article: post.article,
						isCompletionCommit: false
					});
					if (post.comment) {
						webAppApi.commentPosted(createCommentThread(post));
					}
					return post;
				}
			);
	},
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
	},
	onPostCommentAddendum: form => {
		return serverApi
			.postCommentAddendum(form)
			.then(
				comment => {
					webAppApi.commentUpdated(comment);
					return comment;
				}
			);
	},
	onPostCommentRevision: form => {
		return serverApi
			.postCommentRevision(form)
			.then(
				comment => {
					webAppApi.commentUpdated(comment);
					return comment;
				}
			);
	},
	onDeleteComment: form => {
		return serverApi
			.deleteComment(form)
			.then(
				comment => {
					webAppApi.commentUpdated(comment);
					return comment;
				}
			);
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
	onCommentUpdated: comment => {
		// update content script
		tabs
			.getAll()
			.filter(tab => tab.articleId === comment.articleId)
			.forEach(tab => {
				contentScriptApi.commentUpdated(tab.id, comment);
			});
	},
	onUserUpdated: user => {
		serverApi.updateUser(user);
		getState().then(state => {
			updateIcon(state);
		});
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
				user = serverApi.getUser();
			let activeTab: ContentScriptTab;
			if (isAuthenticated && focusedChromeTab && (activeTab = tabs.get(focusedChromeTab.id))) {
				return Promise.resolve({
					activeTab,
					article: serverApi.getUserArticle(activeTab.articleId),
					debug,
					isAuthenticated,
					isOnHomePage,
					url: focusedChromeTab.url,
					user
				});
			} else {
				return Promise.resolve({
					debug,
					isAuthenticated,
					isOnHomePage,
					url: focusedChromeTab ? focusedChromeTab.url : null,
					user
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
			drawBrowserActionIcon('signedIn', hasAlert(state.user));
			browserActionBadgeApi.set({
				isLoading: !!serverApi.getArticleLookupRequests(state.activeTab.id).length,
				value: state.article
			});
		} else {
			// not one of our tabs
			drawBrowserActionIcon('signedIn', hasAlert(state.user));
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
	console.log('[EventPage] installed, reason: ' + details.reason);
	// initialize settings
	localStorage.removeItem('parseMode');
	localStorage.removeItem('showOverlay');
	localStorage.removeItem('newReplyNotification');
	localStorage.setItem('debug', JSON.stringify(false));
	// clear storage
	tabs.clear();
	// update icon
	getState().then(updateIcon);
	// inject web app content script into open web app tabs
	// we have to do this on updates as well as initial installs
	// since content script extension contexts are invalidated
	// on updates
	webAppApi.injectContentScripts();
	// log new installations or old unrecorded ones
	if (
		details.reason === 'install' ||
		(
			details.reason === 'update' &&
			!localStorage.getItem('installationId')
		)
	) {
		chrome.runtime.getPlatformInfo(platformInfo => {
			serverApi
				.logExtensionInstallation(platformInfo)
				.then(result => {
					chrome.runtime.setUninstallURL(
						createUrl(window.reallyreadit.extension.config.web, '/extension/uninstall', { installationId: result.installationId })
					);
					localStorage.setItem('installationId', result.installationId);
				})
				.catch(
					error => {
						console.log('[EventPage] error logging installation')
						if (error) {
							console.log(error);
						}
					}
				);
		});
	}
	// create alarms
	chrome.alarms.create(
		'updateContentParser',
		{
			when: Date.now(),
			periodInMinutes: 120
		}
	);
	chrome.alarms.create(
		ServerApi.alarms.checkNotifications,
		{
			when: Date.now(),
			periodInMinutes: 2.5
		}
	);
	chrome.alarms.create(ServerApi.alarms.getSourceRules, {
		when: Date.now(),
		periodInMinutes: 120
	});
	// clean up old alarm
	chrome.alarms.clear('ServerApi.checkNewReplyNotification');
	// set cookie
	chrome.cookies.set({
		url: createUrl(window.reallyreadit.extension.config.web),
		domain: '.' + window.reallyreadit.extension.config.web.host,
		expirationDate: Date.now() + (365 * 24 * 60 * 60),
		httpOnly: true,
		name: 'extensionVersion',
		secure: window.reallyreadit.extension.config.web.protocol === 'https',
		value: window.reallyreadit.extension.config.version,
		path: '/',
		sameSite: 'no_restriction'
	});
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
chrome.alarms.onAlarm.addListener(
	alarm => {
		if (alarm.name === 'updateContentParser') {
			const currentVersion = SemanticVersion.greatest(
				...[
					window.reallyreadit.extension.config.contentParserVersion,
					localStorage.getItem('contentParserVersion')
				]
				.filter(string => !!string)
				.map(versionString => new SemanticVersion(versionString))
			);
			console.log(`chrome.alarms.onAlarm (updateContentParser: checking for new version. current version: ${currentVersion.toString()})`);
			fetch(createUrl(window.reallyreadit.extension.config.static, '/extension/content-parser.txt'))
				.then(res => res.text())
				.then(text => {
					const newVersionInfo = text
						.split('\n')
						.filter(line => !!line)
						.map(
							fileName => ({
								fileName,
								version: new SemanticVersion(fileName)
							})
						)
						.find(versionInfo => currentVersion.canUpgradeTo(versionInfo.version));
					if (newVersionInfo) {
						console.log(`chrome.alarms.onAlarm (updateContentParser: updating to version: ${newVersionInfo.version.toString()})`);
						fetch(createUrl(window.reallyreadit.extension.config.static, '/extension/content-parser/' + newVersionInfo.fileName))
							.then(res => res.text())
							.then(text => {
								localStorage.setItem('contentParserScript', text);
								localStorage.setItem('contentParserVersion', newVersionInfo.version.toString());
							})
							.catch(() => {
								console.log('chrome.alarms.onAlarm (updateContentParser: error updating to new version)');
							});
					} else {
						console.log('chrome.alarms.onAlarm (updateContentParser: no new version)');	
					}
				})
				.catch(() => {
					console.log('chrome.alarms.onAlarm (updateContentParser: error checking for new version)');
				});
		}
	}
);