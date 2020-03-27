import drawBrowserActionIcon from './drawBrowserActionIcon';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import SetStore from '../../common/webStorage/SetStore';
import ReaderContentScriptTab from './ReaderContentScriptTab';
import ReaderContentScriptApi from './ReaderContentScriptApi';
import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import { createCommentThread } from '../../common/models/social/Post';

// server
const serverApi = new ServerApi({
	onAuthenticationStatusChanged: isAuthenticated => {
		console.log('serverApi.onAuthenticationStatusChanged');
		// update icon
		drawBrowserActionIcon(
			isAuthenticated ?
				'signedIn' :
				'signedOut'
		);
		// stop reading on sign out
		if (!isAuthenticated) {
			tabs
				.getAll()
				.forEach(
					tab => {
						// update bai badges
						browserActionBadgeApi.setDefault(tab.id);
						// message content script
						readerContentScriptApi.userSignedOut(tab.id);
					}
				);
			tabs.clear();
		}
	},
	onUserUpdated: user => {
		console.log('serverApi.onUserUpdated');
		webAppApi.userUpdated(user);
	}
});

// tabs
const tabs = new SetStore<number, ReaderContentScriptTab>('readerTabs', t => t.id, 'sessionStorage');

// reader content script
const readerContentScriptApi = new ReaderContentScriptApi({
	onRegisterPage: (tabId, data) => {
		console.log(`contentScriptApi.onRegisterPage (tabId: ${tabId})`);
		// update tabs
		tabs.set({
			articleId: null,
			id: tabId
		});
		// update bai badges
		browserActionBadgeApi.setLoading(tabId);
		// get read state
		return serverApi
			.registerPage(tabId, data)
			.then(
				result => {
					// update tabs
					tabs.set({
						articleId: result.userArticle.id,
						id: tabId
					});
					// update bai badges
					tabs
						.getAll()
						.forEach(
							tab => {
								if (tab.articleId === result.userArticle.id) {
									browserActionBadgeApi.setReading(tab.id, result.userArticle);
								}
							}
						);
					// return result
					return result;
				}
			)
			.catch(
				error => {
					browserActionBadgeApi.setDefault(tabId);
					throw error;
				}
			);
	},
	onCommitReadState: (tabId, commitData, isCompletionCommit) => {
		console.log(`contentScriptApi.onCommitReadState (tabId: ${tabId})`);
		// commit read state
		return serverApi
			.commitReadState(tabId, commitData)
			.then(
				article => {
					// update bai badges
					tabs
						.getAll()
						.forEach(
							tab => {
								if (tab.articleId === article.id) {
									browserActionBadgeApi.setReading(tab.id, article);
								}
							}
						);
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
	onUnregisterPage: tabId => {
		console.log(`contentScriptApi.onUnregisterContentScript (tabId: ${tabId})`);
		// update tabs
		tabs.remove(tabId);
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
		tabs
			.getAll()
			.filter(
				tab => tab.articleId === event.article.id
			)
			.forEach(
				tab => {
					// update bai badge
					browserActionBadgeApi.setReading(tab.id, event.article);
					// update content script
					readerContentScriptApi.articleUpdated(tab.id, event);
				}
			);
	},
	onCommentPosted: comment => {
		// update content script
		tabs
			.getAll()
			.filter(tab => tab.articleId === comment.articleId)
			.forEach(tab => {
				readerContentScriptApi.commentPosted(tab.id, comment);
			});
	},
	onCommentUpdated: comment => {
		// update content script
		tabs
			.getAll()
			.filter(tab => tab.articleId === comment.articleId)
			.forEach(tab => {
				readerContentScriptApi.commentUpdated(tab.id, comment);
			});
	},
	onUserUpdated: user => {
		serverApi.updateUser(user);
	}
});

// icon interface
const browserActionBadgeApi = new BrowserActionBadgeApi();

// chrome event handlers
chrome.runtime.onInstalled.addListener(details => {
	console.log('[EventPage] installed, reason: ' + details.reason);
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
				drawBrowserActionIcon(
					isAuthenticated ?
						'signedIn' :
						'signedOut'
				)
			}
		);
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
	chrome.alarms.create(
		ServerApi.alarms.getBlacklist,
		{
			when: Date.now(),
			periodInMinutes: 120
		}
	);
	// clean up old alarm
	chrome.alarms.clear('ServerApi.checkNewReplyNotification');
	// set cookie
	chrome.cookies.set({
		url: createUrl(window.reallyreadit.extension.config.web),
		domain: '.' + window.reallyreadit.extension.config.web.host,
		expirationDate: Date.now() + (365 * 24 * 60 * 60),
		name: 'extensionVersion',
		secure: window.reallyreadit.extension.config.web.protocol === 'https',
		value: window.reallyreadit.extension.config.version,
		path: '/',
		sameSite: 'no_restriction'
	});
});
chrome.runtime.onStartup.addListener(
	() => {
		console.log('[EventPage] startup');
		// update icon
		serverApi
			.getAuthStatus()
			.then(
				isAuthenticated => {
					drawBrowserActionIcon(
						isAuthenticated ?
							'signedIn' :
							'signedOut'
					)
				}
			);
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
							url: createUrl(window.reallyreadit.extension.config.web, '/', { 'create-account': null })
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