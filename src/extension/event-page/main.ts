import ReaderContentScriptApi from './ReaderContentScriptApi';
import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import { createCommentThread } from '../../common/models/social/Post';
import { sessionIdCookieKey } from '../../common/cookies';
import {
	extensionInstalledQueryStringKey,
} from '../../common/routing/queryString';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import { DisplayTheme } from '../../common/models/userAccounts/DisplayPreference';
import {
	ExtensionOptions,
	extensionOptionsStorageQuery,
} from '../options-page/ExtensionOptions';

// NOTE: `window` does not exist in service workers.
// All window config references are replaced at compile time by Webpack's DefinePlugin

// browser action badge
const badgeApi = new BrowserActionBadgeApi();

// server
const serverApi = new ServerApi({
	onDisplayPreferenceChanged: async (preference) => {
		await readerContentScriptApi.displayPreferenceChanged(preference);
		await webAppApi.displayPreferenceChanged(preference);
	},
	onUserSignedOut: async () => {
		await readerContentScriptApi.userSignedOut();
	},
});

// reader content script
const readerContentScriptApi = new ReaderContentScriptApi({
	badgeApi,
	onGetDisplayPreference: () => {
		return serverApi.getDisplayPreference();
	},
	onGetDisplayPreferenceFromCache: () => {
		return serverApi.getDisplayPreferenceFromCache();
	},
	onGetExtensionOptions: () => {
		return chrome.storage.local.get(extensionOptionsStorageQuery) as Promise<ExtensionOptions>;
	},
	onGetUserAccountFromCache: () => {
		return serverApi.getUserFromCache();
	},
	onChangeDisplayPreference: async (preference) => {
		// update web app
		await webAppApi.displayPreferenceChanged(preference);
		// persist
		return serverApi.changeDisplayPreference(preference);
	},
	onGetUserArticle: (tabId, data) =>
		serverApi.getUserArticle(tabId, data).then(async (result) => {
			// update web app (article is automatically starred)
			await webAppApi.articleUpdated({
				article: result.userArticle,
				isCompletionCommit: false,
			});
			return result;
		}),
	onCommitReadState: (tabId, commitData, isCompletionCommit) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		return serverApi.commitReadState(tabId, commitData).then(async (article) => {
			// update web app
			await webAppApi.articleUpdated({
				article,
				isCompletionCommit,
			});
			// return result
			return article;
		});
	},
	onGetComments: (query) => serverApi.getComments(query),
	onPostArticle: (form) => {
		return serverApi.postArticle(form).then(async (post) => {
			await webAppApi.articlePosted(post);
			await webAppApi.articleUpdated({
				article: post.article,
				isCompletionCommit: false,
			});
			if (post.comment) {
				await webAppApi.commentPosted(createCommentThread(post));
			}
			return post;
		});
	},
	onPostComment: (form) => {
		return serverApi.postComment(form).then(async (result) => {
			await webAppApi.articleUpdated({
				article: result.article,
				isCompletionCommit: false,
			});
			await webAppApi.commentPosted(result.comment);
			return result;
		});
	},
	onPostCommentAddendum: (form) => {
		return serverApi.postCommentAddendum(form).then(async (comment) => {
			await webAppApi.commentUpdated(comment);
			return comment;
		});
	},
	onPostCommentRevision: (form) => {
		return serverApi.postCommentRevision(form).then(async (comment) => {
			await webAppApi.commentUpdated(comment);
			return comment;
		});
	},
	onReadArticle: async (tabId: number, slug: string) => {
		const article = await serverApi.getArticleDetails(slug);
		console.log('article info: ', article);
		const tab = await chrome.tabs.get(tabId);
		await openReaderInTab(tab, article.url);
	},
	onRequestTwitterBrowserLinkRequestToken: () => {
		return serverApi.requestTwitterBrowserLinkRequestToken();
	},
	onReportArticleIssue: (request) => {
		return serverApi.reportArticleIssue(request);
	},
	onSetStarred: (form) =>
		serverApi.setStarred(form.articleId, form.isStarred).then(async (article) => {
			await webAppApi.articleUpdated({
				article,
				isCompletionCommit: false,
			});
			return article;
		}),
	onDeleteComment: (form) => {
		return serverApi.deleteComment(form).then(async (comment) => {
			await webAppApi.commentUpdated(comment);
			return comment;
		});
	},
});

// web app
const webAppApi = new WebAppApi({
	onArticleUpdated: async (event) => {
		// update readers
		await readerContentScriptApi.articleUpdated(event);
	},
	onAuthServiceLinkCompleted: async (response) => {
		// update readers
		await readerContentScriptApi.authServiceLinkCompleted(response);
	},
	onDisplayPreferenceChanged: async (preference) => {
		// update server cache
		await serverApi.displayPreferenceChanged(preference);
		// update readers
		await readerContentScriptApi.displayPreferenceChanged(preference);
	},
	onCommentPosted: async (comment) => {
		// update readers
		await readerContentScriptApi.commentPosted(comment);
	},
	onCommentUpdated: async (comment) => {
		// update readers
		await readerContentScriptApi.commentUpdated(comment);
	},
	onUserSignedIn: async (profile) => {
		// update server cache
		await serverApi.userUpdated(profile.userAccount);
		await serverApi.displayPreferenceChanged(profile.displayPreference);
		// update readers
		await readerContentScriptApi.userSignedIn();
	},
	onUserSignedOut: async () => {
		await serverApi.userSignedOut();
		await readerContentScriptApi.userSignedOut();
	},
	onUserUpdated: async (user) => {
		// get the existing cached user first so that we can compare it to the updated one and fire the correct event
		const cachedUser = await serverApi.getUserFromCache();
		// update server cache
		await serverApi.userUpdated(user);
		// update readers
		if (cachedUser != null && user != null && cachedUser.id === user.id) {
			await readerContentScriptApi.userUpdated(user);
		} else {
			if (cachedUser != null) {
				await readerContentScriptApi.userSignedOut();
			}
			if (user != null) {
				await readerContentScriptApi.userSignedIn();
			}
		}
	},
	onReadArticle: async (article) => {
		await openReaderInCurrentTab(article.url);
	},
});

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
	return new Promise((resolve, reject) => {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			(tabs) => {
				resolve(tabs[0]);
			}
		);
	});
}

async function openReaderInTab(
	tab: chrome.tabs.Tab,
	articleUrl: string,
) {
	const displayPreference = await serverApi.getDisplayPreferenceFromCache();
	const url = new URL(chrome.runtime.getURL('reader.html'));
	url.searchParams.append('url', articleUrl);
	if (displayPreference) {
		url.searchParams.append('theme', displayPreference.theme === DisplayTheme.Light ? 'light' : 'dark');
	}
	// As of Safari 16.6.1 navigating to an extension page destroys the tab's entire history with no ability to navigate backwards. As a workaround always open the reader in a new tab instead.
	if (url.protocol === 'safari-web-extension:') {
		await chrome.tabs.create({ url: url.toString() });
	} else {
		await chrome.tabs.update(tab.id, { url: url.toString() });
	}
}

async function openReaderInCurrentTab(articleUrl: string) {
	let currentTab = await getCurrentTab();
	if (currentTab) {
		openReaderInTab(currentTab, articleUrl);
	}
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(async (details) => {
	console.log(`[EventPage] installed, reason: ${details.reason}`);
	// ensure sameSite is set on sessionId and sessionKey cookies
	const cookieNames = [window.reallyreadit.extension.config.cookieName, sessionIdCookieKey];
	for (const cookieName of cookieNames) {
		const cookie = await chrome.cookies.get({
			url: createUrl(window.reallyreadit.extension.config.webServer),
			name: cookieName,
		});
		if (cookie?.sameSite === 'unspecified') {
			await chrome.cookies.set({
				url: createUrl(window.reallyreadit.extension.config.webServer),
				domain: cookie.domain,
				expirationDate: cookie.expirationDate,
				httpOnly: cookie.httpOnly,
				name: cookie.name,
				path: cookie.path,
				sameSite: 'no_restriction',
				secure: cookie.secure,
				storeId: cookie.storeId,
				value: cookie.value,
			});
		}
	}
	// initialize settings
	await chrome.storage.local.set({ debug: JSON.stringify(false) });
	// inject web app content script into open web app tabs
	// we have to do this on updates as well as initial installs
	// since content script extension contexts are invalidated
	// on updates
	await readerContentScriptApi.clearTabs();
	await webAppApi.clearTabs();
	await webAppApi.injectContentScripts();
	// log all installations
	// safari doesn't allow us to get or set cookies prior to user granting access
	// in fact chrome.cookies.* api calls take 30+s to time out with no results
	// so we need to rely on the api server to get and set them for us
	const platformInfo = await chrome.runtime.getPlatformInfo();
	try {
		const response = await serverApi.logExtensionInstallation({
			arch: platformInfo.arch,
			installationId: (await chrome.storage.local.get('installationId'))[
				'installationId'
			],
			os: platformInfo.os,
		});
		if (details.reason === 'install') {
			await chrome.tabs.create({
				url: createUrl(
					window.reallyreadit.extension.config.webServer,
					response.redirectPath,
					{
						[extensionInstalledQueryStringKey]: null,
					}
				),
			});
		}
		if (!response.installationId) {
			return;
		}
		chrome.runtime.setUninstallURL(
			createUrl(
				window.reallyreadit.extension.config.webServer,
				'/extension/uninstall',
				{
					installationId: response.installationId,
				}
			)
		);
		await chrome.storage.local.set({
			installationId: response.installationId,
		});
	} catch (error) {
		console.log('[EventPage] error logging installation');
		if (error) {
			console.log(error);
		}
	}
});
chrome.runtime.onStartup.addListener(async () => {
	console.log('[EventPage] startup');
	// initialize tabs
	await readerContentScriptApi.clearTabs();
	await webAppApi.clearTabs();
	await webAppApi.injectContentScripts();
});
chrome.action.onClicked.addListener(async (tab) => {
	// check which type of page we're looking at
	if (!tab.url) {
		return;
	}

	// from a reader tab
	if (tab.url.startsWith(`chrome-extension://${chrome.runtime.id}/reader`)) {
		await chrome.tabs.goBack(tab.id);
		return;
	}

	// web app
	if (
		tab.url.startsWith(
			createUrl(window.reallyreadit.extension.config.webServer)
		)
	) {
		await chrome.scripting.executeScript({
			target: {
				tabId: tab.id,
			},
			func: () => {
				// Note: don't use TS features like the ? operator here, or the ... operator.
				// TS transpiles these, but this function is executed in a different context
				// from the current context where it is defined.
				// `window` doesn't exist in the service worker, but this is run in the
				// content script context of the tab.
				// rome-ignore lint/complexity/useOptionalChain: <explanation>
				if (!(window.reallyreadit && window.reallyreadit.alertContentScript)) {
					window.reallyreadit = Object.assign(window.reallyreadit, {
						alertContentScript: {
							alertContent:
								"Press the Readup button when you're on an article web page.",
						},
					});
					chrome.runtime.sendMessage({
						from: 'contentScriptInitializer',
						to: 'eventPage',
						type: 'injectAlert',
					});
				} else if (!window.reallyreadit.alertContentScript.isActive) {
					window.reallyreadit.alertContentScript.display();
				}
			},
		});
		return;
	}

	// open article, starring if that is the setting
	await openReaderInTab(
		tab,
		tab.url,
	);
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (
		message.from !== 'contentScriptInitializer' ||
		message.to !== 'eventPage'
	) {
		// return true so that other handlers will have an opportunity to respond
		return true;
	}
	switch (message.type) {
		case 'injectAlert':
			chrome.scripting.executeScript({
				target: {
					tabId: sender.tab.id,
				},
				files: ['/content-scripts/alert/bundle.js'],
			});
			break;
		case 'injectReader':
			chrome.scripting.executeScript({
				target: {
					tabId: sender.tab.id,
				},
				files: ['/content-scripts/reader/bundle.js'],
			});
			break;
	}
	// always send a response because the sender must use a callback in order to
	// check for runtime errors and an error will be triggered if the port is closed
	sendResponse();
	return false;
});
