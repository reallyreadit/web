import ReaderContentScriptApi from './ReaderContentScriptApi';
import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import { createCommentThread } from '../../common/models/social/Post';
import { sessionIdCookieKey } from '../../common/cookies';
import {
	extensionInstalledQueryStringKey,
	extensionAuthQueryStringKey,
} from '../../common/routing/queryString';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import UserAccount from '../../common/models/UserAccount';
import { DisplayTheme } from '../../common/models/userAccounts/DisplayPreference';
import {
	ExtensionOptionKey,
	ExtensionOptions,
	extensionOptionsStorageQuery,
} from '../options-page/ExtensionOptions';

// NOTE: `window` does not exist in service workers.
// All window config references are replaced at compile time by Webpack's DefinePlugin

// browser action icon
function setIcon(state: {
	user: UserAccount | null;
}) {
	const placeholder = '{SIZE}';
	let pathTemplate = '/icons/';
	if (state.user) {
		pathTemplate += `icon-${placeholder}.png`;
	} else {
		pathTemplate += `icon-${placeholder}-warning.png`;
	}
	chrome.action.setIcon({
		path: [16, 24, 32, 40, 48].reduce<{ [key: string]: string }>(
			(paths, size) => {
				paths[size] = pathTemplate.replace(placeholder, size.toString());
				return paths;
			},
			{}
		),
	});
}

// browser action badge
const badgeApi = new BrowserActionBadgeApi();

// server
const serverApi = new ServerApi({
	onDisplayPreferenceChanged: async (preference) => {
		await readerContentScriptApi.displayPreferenceChanged(preference);
		await webAppApi.displayPreferenceChanged(preference);
	},
	onUserSignedOut: async () => {
		setIcon({
			user: null,
		});
		await readerContentScriptApi.userSignedOut();
	},
	onUserUpdated: async (user) => {
		setIcon({
			user,
		});
		await readerContentScriptApi.userUpdated(user);
		await webAppApi.userUpdated(user);
	},
});

// reader content script
const readerContentScriptApi = new ReaderContentScriptApi({
	badgeApi,
	onGetDisplayPreference: () => {
		return serverApi.getDisplayPreference();
	},
	onChangeDisplayPreference: async (preference) => {
		// update web app
		await webAppApi.displayPreferenceChanged(preference);
		// persist
		return serverApi.changeDisplayPreference(preference);
	},
	onRegisterPage: (tabId, data) =>
		serverApi.registerPage(tabId, data).then(async (result) => {
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
	onGetComments: (slug) => serverApi.getComments(slug),
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
		setIcon({
			user: profile.userAccount,
		});
		await serverApi.userSignedIn(profile);
	},
	onUserSignedOut: async () => {
		setIcon({
			user: null,
		});
		await serverApi.userSignedOut();
		await readerContentScriptApi.userSignedOut();
	},
	onUserUpdated: async (user) => {
		setIcon({
			user,
		});
		// update server cache
		await serverApi.userUpdated(user);
		// update readers
		await readerContentScriptApi.userUpdated(user);
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
	star: boolean = false
) {
	// TODO: sending the displayPreference became less important again, since trying
	// out the reader.html / dark-reader solution
	// maybe it's cleaner to just request these extra params via the eventPageApi like before
	const displayPreference = await serverApi.getDisplayPreferenceFromCache();
	const baseURL = chrome.runtime.getURL(
		`/${
			displayPreference.theme === DisplayTheme.Light
				? 'reader.html'
				: 'reader-dark.html'
		}`
	);
	const searchParams = new URLSearchParams({
		url: articleUrl,
		displayPreference: JSON.stringify(displayPreference),
		star: star.toString(),
	});
	const readerUrl = `${baseURL}?${searchParams}`;
	await chrome.tabs.update(tab.id, { url: readerUrl });
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
	// update icon
	setIcon({
		user: await serverApi.getUser(),
	});
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
// create alarms
chrome.alarms.getAll(chromeAlarms => {
	const
		registeredAlarms: { [key: string]: (number | null) } = {},
		allowedAlarms = {
			'updateContentParser': 120,
			[ServerApi.alarms.checkNotifications]: 2.5,
			[ServerApi.alarms.getBlacklist]: 120
		};
	let startTime = Date.now();
	for (const alarm of chromeAlarms) {
		registeredAlarms[alarm.name] = alarm.periodInMinutes;
	}
	if (!chrome.notifications) {
		delete allowedAlarms[ServerApi.alarms.checkNotifications];
	}
	for (const alarm in allowedAlarms) {
		const createAlarm = () => {
			chrome.alarms.create(alarm, {
				when: startTime,
				periodInMinutes: allowedAlarms[alarm],
			});
			startTime += 1000 * 60;
		};
		if (!(alarm in registeredAlarms)) {
			createAlarm();
		} else if (allowedAlarms[alarm] !== registeredAlarms[alarm]) {
			chrome.alarms.clear(alarm, createAlarm);
		}
	}
	for (const alarm in registeredAlarms) {
		if (!(alarm in allowedAlarms)) {
			chrome.alarms.clear(alarm, () => { });
		}
	}
});
chrome.runtime.onStartup.addListener(async () => {
	console.log('[EventPage] startup');
	// update icon
	setIcon({
		user: await serverApi.getUser(),
	});
	// initialize tabs
	await readerContentScriptApi.clearTabs();
	await webAppApi.clearTabs();
	await webAppApi.injectContentScripts();
});
chrome.action.onClicked.addListener(async (tab) => {
	// check if we're logged in
	const isAuthenticated = await serverApi.isAuthenticated();
	if (!isAuthenticated) {
		await chrome.tabs.create({
			url: createUrl(window.reallyreadit.extension.config.webServer, null, {
				[extensionAuthQueryStringKey]: null,
			}),
		});
		return;
	}
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
	// blacklisted
	const blacklist = await serverApi.getBlacklist();
	if (blacklist.some((regex) => regex.test(tab.url))) {
		await chrome.scripting.executeScript({
			target: {
				tabId: tab.id,
			},
			func: () => {
				// Note: don't use TS features like the ? operator here, or the ... operator.
				// TS transpiles these, but this function is executed in a different context
				// from the current context where it is defined.
				if (!(window.reallyreadit && window.reallyreadit.alertContentScript)) {
					window.reallyreadit = Object.assign(window.reallyreadit, {
						alertContentScript: {
							alertContent: 'No article detected on this web page.',
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
	}

	// open article, starring if that is the setting
	chrome.storage.local.get(
		extensionOptionsStorageQuery,
		async (options: ExtensionOptions) => {
			await openReaderInTab(
				tab,
				tab.url,
				options[ExtensionOptionKey.StarOnSave]
			);
		}
	);
});
chrome.runtime.onMessage.addListener((message, sender) => {
	if (
		message.from !== 'contentScriptInitializer' ||
		message.to !== 'eventPage'
	) {
		return;
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
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === 'updateContentParser') {
		const currentVersion = SemanticVersion.greatest(
			...[
				window.reallyreadit.extension.config.version.common.contentParser,
				(await chrome.storage.local.get('contentParserVersion'))[
					'contentParserVersion'
				],
			]
				.filter((string) => !!string)
				.map((versionString) => new SemanticVersion(versionString))
		);
		console.log(
			`chrome.alarms.onAlarm (updateContentParser: checking for new version. current version: ${currentVersion.toString()})`
		);
		fetch(
			createUrl(
				window.reallyreadit.extension.config.staticServer,
				'/extension/content-parser.txt'
			)
		)
			.then((res) => res.text())
			.then((text) => {
				const newVersionInfo = text
					.split('\n')
					.filter((line) => !!line)
					.map((fileName) => ({
						fileName,
						version: new SemanticVersion(fileName),
					}))
					.find((versionInfo) =>
						currentVersion.canUpgradeTo(versionInfo.version)
					);
				if (newVersionInfo) {
					console.log(
						`chrome.alarms.onAlarm (updateContentParser: updating to version: ${newVersionInfo.version.toString()})`
					);
					fetch(
						createUrl(
							window.reallyreadit.extension.config.staticServer,
							`/extension/content-parser/${newVersionInfo.fileName}`
						)
					)
						.then((res) => res.text())
						.then(async (text) => {
							await chrome.storage.local.set({ contentParserScript: text });
							await chrome.storage.local.set({
								contentParserVersion: newVersionInfo.version.toString(),
							});
						})
						.catch(() => {
							console.log(
								'chrome.alarms.onAlarm (updateContentParser: error updating to new version)'
							);
						});
				} else {
					console.log(
						'chrome.alarms.onAlarm (updateContentParser: no new version)'
					);
				}
			})
			.catch(() => {
				console.log(
					'chrome.alarms.onAlarm (updateContentParser: error checking for new version)'
				);
			});
	}
});
