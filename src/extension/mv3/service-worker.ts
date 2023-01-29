import ReaderContentScriptApi from '../event-page/ReaderContentScriptApi';
import ServerApi from '../event-page/ServerApi';
import WebAppApi from '../event-page/WebAppApi';
import {createUrl} from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import {createCommentThread} from '../../common/models/social/Post';
import {sessionIdCookieKey} from '../../common/cookies';
import {extensionInstalledQueryStringKey,extensionAuthQueryStringKey} from '../../common/routing/queryString';
import BrowserActionBadgeApi from '../event-page/BrowserActionBadgeApi';
import UserAccount from '../../common/models/UserAccount';
import {DisplayTheme} from '../../common/models/userAccounts/DisplayPreference';

// NOTE: `window` does not exist in service workers.
// All window config references are replaced at compile time by Webpack's DefinePlugin

// browser action icon
function setIcon(
	state: {
		user: UserAccount | null
	}
) {
	const placeholder = '{SIZE}';
	let pathTemplate = '/icons/';
	if(state.user) {
		pathTemplate += `icon-${placeholder}.png`;
	} else {
		pathTemplate += `icon-${placeholder}-warning.png`;
	}
	chrome.action.setIcon({
		path: [16,24,32,40,48].reduce<{[key: string]: string}>(
			(paths,size) => {
				paths[size] = pathTemplate.replace(placeholder,size.toString());
				return paths;
			},
			{}
		)
	});
}

// browser action badge
const badgeApi = new BrowserActionBadgeApi();

// server
const serverApi = new ServerApi({
	onDisplayPreferenceChanged: preference => {
		readerContentScriptApi.displayPreferenceChanged(preference);
		webAppApi.displayPreferenceChanged(preference);
	},
	onUserSignedOut: () => {
		setIcon({
			user: null
		});
		readerContentScriptApi.userSignedOut();
	},
	onUserUpdated: user => {
		setIcon({
			user
		});
		readerContentScriptApi.userUpdated(user);
		webAppApi.userUpdated(user);
	}
});

// reader content script
const readerContentScriptApi = new ReaderContentScriptApi({
	badgeApi,
	onGetDisplayPreference: () => {
		return serverApi.getDisplayPreference();
	},
	onChangeDisplayPreference: preference => {
		// update web app
		webAppApi.displayPreferenceChanged(preference);
		// persist
		return serverApi.changeDisplayPreference(preference);
	},
	onRegisterPage: (tabId,data) => serverApi
		.registerPage(tabId,data)
		.then(
			result => {
				// update web app (article is automatically starred)
				webAppApi.articleUpdated({
					article: result.userArticle,
					isCompletionCommit: false
				});
				return result;
			}
		),
	onCommitReadState: (tabId,commitData,isCompletionCommit) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		return serverApi
			.commitReadState(tabId,commitData)
			.then(
				article => {
					// update web app
					webAppApi.articleUpdated({
						article,
						isCompletionCommit
					});
					// return result
					return article;
				}
			);
	},
	onGetComments: slug => serverApi.getComments(slug),
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
					if(post.comment) {
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
	onReadArticle: async (tabId: number,slug: string) => {
		const article = await serverApi.getArticleDetails(slug);
		console.log("article info: ",article)
		// note: a Promise on tabs.get is MV3 only
		const tab = await chrome.tabs.get(tabId);
		await openReaderInTab(tab,article.url)
	},
	onRequestTwitterBrowserLinkRequestToken: () => {
		return serverApi.requestTwitterBrowserLinkRequestToken();
	},
	onReportArticleIssue: request => {
		return serverApi.reportArticleIssue(request);
	},
	onSetStarred: form => serverApi
		.setStarred(form.articleId,form.isStarred)
		.then(
			article => {
				webAppApi.articleUpdated({
					article,
					isCompletionCommit: false
				});
				return article;
			}
		),
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
		// update readers
		readerContentScriptApi.articleUpdated(event);
	},
	onAuthServiceLinkCompleted: response => {
		// update readers
		readerContentScriptApi.authServiceLinkCompleted(response);
	},
	onDisplayPreferenceChanged: preference => {
		// update server cache
		serverApi.displayPreferenceChanged(preference);
		// update readers
		readerContentScriptApi.displayPreferenceChanged(preference);
	},
	onCommentPosted: comment => {
		// update readers
		readerContentScriptApi.commentPosted(comment);
	},
	onCommentUpdated: comment => {
		// update readers
		readerContentScriptApi.commentUpdated(comment);
	},
	onUserSignedIn: profile => {
		setIcon({
			user: profile.userAccount
		});
		serverApi.userSignedIn(profile);
	},
	onUserSignedOut: () => {
		setIcon({
			user: null
		});
		serverApi.userSignedOut();
		readerContentScriptApi.userSignedOut();
	},
	onUserUpdated: user => {
		setIcon({
			user
		});
		// update server cache
		serverApi.userUpdated(user);
		// update readers
		readerContentScriptApi.userUpdated(user);
	},
	onReadArticle: article => {
		openReaderInCurrentTab(article.url)
	}
});

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
	return new Promise((resolve,reject) => {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			},
			(tabs) => {
				resolve(tabs[0])
			}
		)
	})
}

async function openReaderInTab(tab: chrome.tabs.Tab,articleUrl: string) {
	// TODO: sending the displayPreference became less important again, since trying
	// out the reader.html / dark-reader solution
	// maybe it's cleaner to just request these extra params via the eventPageApi like before
	const displayPreference = await serverApi.getDisplayPreferenceFromCache()
	const baseURL = chrome.runtime.getURL(`/${displayPreference.theme === DisplayTheme.Light ? 'reader.html' : 'reader-dark.html'}`);
	const searchParams = new URLSearchParams({
		url: articleUrl,
		displayPreference: JSON.stringify(displayPreference)
	});
	const readerUrl = `${baseURL}?${searchParams}`
	chrome.tabs.update(tab.id,{url: readerUrl})
}

async function openReaderInCurrentTab(articleUrl: string) {
	let currentTab = await getCurrentTab()
	if(currentTab) {
		openReaderInTab(currentTab,articleUrl)
	}
}

// chrome event handlers
chrome.runtime.onInstalled.addListener(async (details) => {
	console.log('[EventPage] installed, reason: ' + details.reason);
	// ensure sameSite is set on sessionId and sessionKey cookies
	[window.reallyreadit.extension.config.cookieName,sessionIdCookieKey].forEach(
		cookieName => {
			chrome.cookies.get(
				{
					url: createUrl(window.reallyreadit.extension.config.webServer),
					name: cookieName
				},
				cookie => {
					if(cookie?.sameSite === 'unspecified') {
						chrome.cookies.set({
							url: createUrl(window.reallyreadit.extension.config.webServer),
							domain: cookie.domain,
							expirationDate: cookie.expirationDate,
							httpOnly: cookie.httpOnly,
							name: cookie.name,
							path: cookie.path,
							sameSite: 'no_restriction',
							secure: cookie.secure,
							storeId: cookie.storeId,
							value: cookie.value
						});
					}
				}
			);
		}
	);
	// initialize settings
	('parseMode');
	await chrome.storage.local.remove([
		'showOverlay',
		'newReplyNotification',
		'sourceRules',
		'articles',
		'tabs'
	]);
	await chrome.storage.local.set({'debug': JSON.stringify(false)});
	// update icon
	setIcon({
		user: await serverApi.getUser()
	});
	// inject web app content script into open web app tabs
	// we have to do this on updates as well as initial installs
	// since content script extension contexts are invalidated
	// on updates
	readerContentScriptApi.clearTabs();
	webAppApi.clearTabs();
	webAppApi.injectContentScripts();
	// log all installations
	// safari doesn't allow us to get or set cookies prior to user granting access
	// in fact chrome.cookies.* api calls take 30+s to time out with no results
	// so we need to rely on the api server to get and set them for us
	chrome.runtime.getPlatformInfo(
		async (platformInfo) => {
			if(details.reason === 'install') {
				badgeApi.setLoading();
			}

			serverApi
				.logExtensionInstallation({
					arch: platformInfo.arch,
					installationId: (await chrome.storage.local.get('installationId'))['installationId'],
					os: platformInfo.os
				})
				.then(
					async (response) => {
						if(details.reason === 'install') {
							chrome.tabs.create({
								url: createUrl(
									window.reallyreadit.extension.config.webServer,
									response.redirectPath,
									{
										[extensionInstalledQueryStringKey]: null
									}
								)
							});
						}
						if(!response.installationId) {
							return;
						}
						chrome.runtime.setUninstallURL(
							createUrl(
								window.reallyreadit.extension.config.webServer,
								'/extension/uninstall',
								{
									installationId: response.installationId
								}
							)
						);
						await chrome.storage.local.set({'installationId': response.installationId});
					}
				)
				.catch(
					error => {
						console.log('[EventPage] error logging installation');
						if(error) {
							console.log(error);
						}
					}
				)
				.finally(
					() => {
						badgeApi.setDefault();
					}
				);
		}
	);
	// create alarms
	chrome.alarms.create(
		'updateContentParser',
		{
			when: Date.now(),
			periodInMinutes: 120
		}
	);
	if(chrome.notifications) {
		chrome.alarms.create(
			ServerApi.alarms.checkNotifications,
			{
				when: Date.now(),
				periodInMinutes: 2.5
			}
		);
	}
	chrome.alarms.create(
		ServerApi.alarms.getBlacklist,
		{
			when: Date.now(),
			periodInMinutes: 120
		}
	);
	// clean up old alarm
	chrome.alarms.clear('ServerApi.checkNewReplyNotification');
});
chrome.runtime.onStartup.addListener(
	async () => {
		console.log('[EventPage] startup');
		// update icon
		setIcon({
			user: await serverApi.getUser()
		});
		// initialize tabs
		readerContentScriptApi.clearTabs();
		webAppApi.clearTabs();
		webAppApi.injectContentScripts();
	}
);
chrome.action.onClicked.addListener(
	async (tab) => {
		// check if we're logged in
		if(!serverApi.isAuthenticated()) {
			chrome.tabs.create({
				url: createUrl(
					window.reallyreadit.extension.config.webServer,
					null,
					{
						[extensionAuthQueryStringKey]: null
					}
				)
			});
			return;
		}
		// check which type of page we're looking at
		if(!tab.url) {
			return;
		}

		// from a reader tab
		if(tab.url.startsWith(`chrome-extension://${chrome.runtime.id}/reader`)) {
			chrome.tabs.goBack(tab.id)
			return;
		}

		// web app
		if(tab.url.startsWith(createUrl(window.reallyreadit.extension.config.webServer))) {
			chrome.scripting.executeScript({
				target: {
					tabId: tab.id
				},
				func: () => {
					// Note: don't use TS features like the ? operator here, or the ... operator.
					// TS transpiles these, but this function is executed in a different context
					// from the current context where it is defined.
					// `window` doesn't exist in the service worker, but this is run in the
					// content script context of the tab.
					if(!(window.reallyreadit && window.reallyreadit.alertContentScript)) {
						window.reallyreadit = Object.assign(
							window.reallyreadit,
							{
								alertContentScript: {alertContent: 'Press the Readup button when you\'re on an article web page.'}
							});
						chrome.runtime.sendMessage({from: 'contentScriptInitializer',to: 'eventPage',type: 'injectAlert'});
					} else if(!window.reallyreadit.alertContentScript.isActive) {
						window.reallyreadit.alertContentScript.display();
					}
				}
			});
			return;
		}
		// blacklisted
		const blacklist = await serverApi.getBlacklist();
		if(
			blacklist.some(
				regex => regex.test(tab.url)
			)
		) {
			chrome.scripting.executeScript({
				target: {
					tabId: tab.id
				},
				func: () => {
					// Note: don't use TS features like the ? operator here, or the ... operator.
					// TS transpiles these, but this function is executed in a different context
					// from the current context where it is defined.
					if(!(window.reallyreadit && window.reallyreadit.alertContentScript)) {
						window.reallyreadit = Object.assign(
							window.reallyreadit,
							{
								alertContentScript: {
									alertContent: 'No article detected on this web page.'
								}
							});
						chrome.runtime.sendMessage({
							from: 'contentScriptInitializer',
							to: 'eventPage',
							type: 'injectAlert'
						});
					} else if(!window.reallyreadit.alertContentScript.isActive) {
						window.reallyreadit.alertContentScript.display();
					}
				}
			});
		}

		// open article
		await openReaderInTab(tab,tab.url)
	}
);
chrome.runtime.onMessage.addListener(
	(message,sender) => {
		if(message.from !== 'contentScriptInitializer' || message.to !== 'eventPage') {
			return;
		}
		switch(message.type) {
			case 'injectAlert':
				chrome.scripting.executeScript({
					target: {
						tabId: sender.tab.id,
					},
					files: ['/content-scripts/alert/bundle.js']
				});
				return;
			case 'injectReader':
				chrome.scripting.executeScript({
					target: {
						tabId: sender.tab.id,
					},
					files: ['/content-scripts/reader/bundle.js']
				});
				return;
		}
	}
);
chrome.alarms.onAlarm.addListener(
	async (alarm) => {
		if(alarm.name === 'updateContentParser') {
			const currentVersion = SemanticVersion.greatest(
				...[
					window.reallyreadit.extension.config.version.common.contentParser,
					(await chrome.storage.local.get('contentParserVersion'))['contentParserVersion']
				]
					.filter(string => !!string)
					.map(versionString => new SemanticVersion(versionString))
			);
			console.log(`chrome.alarms.onAlarm (updateContentParser: checking for new version. current version: ${currentVersion.toString()})`);
			fetch(createUrl(window.reallyreadit.extension.config.staticServer,'/extension/content-parser.txt'))
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
					if(newVersionInfo) {
						console.log(`chrome.alarms.onAlarm (updateContentParser: updating to version: ${newVersionInfo.version.toString()})`);
						fetch(createUrl(window.reallyreadit.extension.config.staticServer,'/extension/content-parser/' + newVersionInfo.fileName))
							.then(res => res.text())
							.then(async (text) => {
								await chrome.storage.local.set({'contentParserScript': text});
								await chrome.storage.local.set({'contentParserVersion': newVersionInfo.version.toString()});
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