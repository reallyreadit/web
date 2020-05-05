import ReaderContentScriptApi from './ReaderContentScriptApi';
import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import { createCommentThread } from '../../common/models/social/Post';
import { extensionVersionCookieKey, extensionInstallationRedirectPathCookieKey, sessionIdCookieKey } from '../../common/cookies';
import { extensionInstalledQueryStringKey, extensionAuthQueryStringKey } from '../../common/routing/queryString';

// browser action icon
function setIcon(state: 'authenticated' | 'unauthenticated') {
	const placeholder = '{SIZE}';
	let pathTemplate = '/icons/';
	if (state === 'authenticated') {
		pathTemplate += `icon-${placeholder}.png`;
	} else {
		pathTemplate += `icon-${placeholder}-warning.png`;
	}
	chrome.browserAction.setIcon({
		path: [16, 24, 32, 40, 48].reduce<{ [key: string]: string }>(
			(paths, size) => {
				paths[size] = pathTemplate.replace(placeholder, size.toString());
				return paths;
			},
			{ }
		)
	});
}

// server
const serverApi = new ServerApi({
	onAuthenticationStatusChanged: isAuthenticated => {
		console.log('serverApi.onAuthenticationStatusChanged');
		// update icon
		setIcon(
			isAuthenticated ?
				'authenticated' :
				'unauthenticated'
		);
		// stop reading on sign out
		if (!isAuthenticated) {
			readerContentScriptApi.userSignedOut();
		}
	},
	onUserUpdated: user => {
		console.log('serverApi.onUserUpdated');
		webAppApi.userUpdated(user);
	}
});

// reader content script
const readerContentScriptApi = new ReaderContentScriptApi({
	onRegisterPage: (tabId, data) => serverApi
		.registerPage(tabId, data)
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
	onCommitReadState: (tabId, commitData, isCompletionCommit) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		return serverApi
			.commitReadState(tabId, commitData)
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
		chrome.tabs.executeScript(tabId, { file: '/content-scripts/reader/content-parser/bundle.js' });
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
	onRequestTwitterBrowserLinkRequestToken: () => {
		return serverApi.requestTwitterBrowserLinkRequestToken();
	},
	onReportArticleIssue: request => {
		return serverApi.reportArticleIssue(request);
	},
	onSetStarred: form => serverApi
		.setStarred(form.articleId, form.isStarred)
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
	onCommentPosted: comment => {
		// update readers
		readerContentScriptApi.commentPosted(comment);
	},
	onCommentUpdated: comment => {
		// update readers
		readerContentScriptApi.commentUpdated(comment);
	},
	onUserUpdated: user => {
		// update server cache
		serverApi.updateUser(user);
		// update readers
		readerContentScriptApi.userUpdated(user);
	}
});

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('[EventPage] installed, reason: ' + details.reason);
	// ensure sameSite is set on sessionId and sessionKey cookies
	[window.reallyreadit.extension.config.cookieName, sessionIdCookieKey].forEach(
		cookieName => {
			chrome.cookies.get(
				{
					url: createUrl(window.reallyreadit.extension.config.web),
					name: cookieName
				},
				cookie => {
					if (cookie?.sameSite === 'unspecified') {
						chrome.cookies.set({
							url: createUrl(window.reallyreadit.extension.config.web),
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
	localStorage.removeItem('parseMode');
	localStorage.removeItem('showOverlay');
	localStorage.removeItem('newReplyNotification');
	localStorage.removeItem('sourceRules');
	localStorage.removeItem('articles');
	localStorage.removeItem('tabs');
	localStorage.setItem('debug', JSON.stringify(false));
	// update icon
	serverApi
		.getAuthStatus()
		.then(
			isAuthenticated => {
				setIcon(
					isAuthenticated ?
						'authenticated' :
						'unauthenticated'
				);
			}
		);
	// inject web app content script into open web app tabs
	// we have to do this on updates as well as initial installs
	// since content script extension contexts are invalidated
	// on updates
	readerContentScriptApi.clearTabs();
	webAppApi.clearTabs();
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
	chrome.alarms.create(
		ServerApi.alarms.getBlacklist,
		{
			when: Date.now(),
			periodInMinutes: 120
		}
	);
	// clean up old alarm
	chrome.alarms.clear('ServerApi.checkNewReplyNotification');
	// set cookie and open new tab on new install
	chrome.cookies.set(
		{
			url: createUrl(window.reallyreadit.extension.config.web),
			domain: '.' + window.reallyreadit.extension.config.web.host,
			expirationDate: (Date.now() + (365 * 24 * 60 * 60 * 1000)) / 1000,
			name: extensionVersionCookieKey,
			secure: window.reallyreadit.extension.config.web.protocol === 'https',
			value: window.reallyreadit.extension.config.version,
			path: '/',
			sameSite: 'no_restriction'
		},
		() => {
			if (details.reason === 'install') {
				chrome.cookies.get(
					{
						url: createUrl(window.reallyreadit.extension.config.web),
						name: extensionInstallationRedirectPathCookieKey,
					},
					cookie => {
						chrome.tabs.create({
							url: createUrl(
								window.reallyreadit.extension.config.web,
								cookie?.value,
								{
									[extensionInstalledQueryStringKey]: null
								}
							)
						});
					}
				);
			}
		}
	);
});
chrome.runtime.onStartup.addListener(
	() => {
		console.log('[EventPage] startup');
		// update icon
		serverApi
			.getAuthStatus()
			.then(
				isAuthenticated => {
					setIcon(
						isAuthenticated ?
							'authenticated' :
							'unauthenticated'
					);
				}
			);
		// initialize tabs
		readerContentScriptApi.clearTabs();
		webAppApi.clearTabs();
		webAppApi.injectContentScripts();
	}
);
chrome.browserAction.onClicked.addListener(
	tab => {
		// check if we're logged in
		serverApi
			.getAuthStatus()
			.then(
				isAuthenticated => {
					if (!isAuthenticated) {
						chrome.tabs.create({
							url: createUrl(
								window.reallyreadit.extension.config.web,
								null,
								{ 
									[extensionAuthQueryStringKey]: null
								}
							)
						});
						return;
					}
					// check which type of page we're looking at
					if (!tab.url) {
						return;
					}
					// web app
					if (tab.url.startsWith(createUrl(window.reallyreadit.extension.config.web))) {
						chrome.tabs.executeScript(
							tab.id,
							{
								code: "if (!window.reallyreadit?.alertContentScript) { window.reallyreadit = { ...window.reallyreadit, alertContentScript: { alertContent: 'Press the Readup button when you\\'re on an article web page.' } }; chrome.runtime.sendMessage({ from: 'contentScriptInitializer', to: 'eventPage', type: 'injectAlert' }); } else if (!window.reallyreadit.alertContentScript.isActive) { window.reallyreadit.alertContentScript.display(); }"
							}
						);
						return;
					}
					// blacklisted
					const blacklist = serverApi.getBlacklist();
					if (
						blacklist.some(
							regex => regex.test(tab.url)
						)
					) {
						chrome.tabs.executeScript(
							tab.id,
							{
								code: "if (!window.reallyreadit?.alertContentScript) { window.reallyreadit = { ...window.reallyreadit, alertContentScript: { alertContent: 'No article detected on this web page.' } }; chrome.runtime.sendMessage({ from: 'contentScriptInitializer', to: 'eventPage', type: 'injectAlert' }); } else if (!window.reallyreadit.alertContentScript.isActive) { window.reallyreadit.alertContentScript.display(); }"
							}
						);
						return;
					}
					// article
					chrome.tabs.executeScript(
						tab.id,
						{
							code: "if (!window.reallyreadit?.readerContentScript) { window.reallyreadit = { ...window.reallyreadit, readerContentScript: { } }; chrome.runtime.sendMessage({ from: 'contentScriptInitializer', to: 'eventPage', type: 'injectReader' }); }"
						}
					);
				}
			);
	}
);
chrome.runtime.onMessage.addListener(
	(message, sender) => {
		if (message.from !== 'contentScriptInitializer' || message.to !== 'eventPage') {
			return;
		}
		switch (message.type) {
			case 'injectAlert':
				chrome.tabs.executeScript(
					sender.tab.id,
					{
						file: '/content-scripts/alert/bundle.js'
					}
				);
				return;
			case 'injectReader':
				chrome.tabs.executeScript(
					sender.tab.id,
					{
						file: '/content-scripts/reader/bundle.js'
					}
				);
				return;
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