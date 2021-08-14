import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import SemanticVersion from '../../common/SemanticVersion';
import { sessionIdCookieKey } from '../../common/cookies';
import { extensionInstalledQueryStringKey, extensionAuthQueryStringKey } from '../../common/routing/queryString';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';

// browser action badge
const badgeApi = new BrowserActionBadgeApi();

// server
const serverApi = new ServerApi({
	onDisplayPreferenceChanged: preference => {
		webAppApi.displayPreferenceChanged(preference);
	},
	onUserSignedOut: () => {
	},
	onUserUpdated: user => {
		webAppApi.userUpdated(user);
	}
});

// web app
const webAppApi = new WebAppApi({
	onArticleUpdated: event => {
	},
	onAuthServiceLinkCompleted: response => {
	},
	onDisplayPreferenceChanged: preference => {
		// update server cache
		serverApi.displayPreferenceChanged(preference);
	},
	onCommentPosted: comment => {
	},
	onCommentUpdated: comment => {
	},
	onSubscriptionStatusChanged: status => {
	},
	onUserSignedIn: profile => {
		serverApi.userSignedIn(profile);
	},
	onUserSignedOut: () => {
		serverApi.userSignedOut();
	},
	onUserUpdated: user => {
		// update server cache
		serverApi.userUpdated(user);
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
					url: createUrl(window.reallyreadit.extension.config.webServer),
					name: cookieName
				},
				cookie => {
					if (cookie?.sameSite === 'unspecified') {
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
	localStorage.removeItem('parseMode');
	localStorage.removeItem('showOverlay');
	localStorage.removeItem('newReplyNotification');
	localStorage.removeItem('sourceRules');
	localStorage.removeItem('articles');
	localStorage.removeItem('tabs');
	localStorage.setItem('debug', JSON.stringify(false));
	// inject web app content script into open web app tabs
	// we have to do this on updates as well as initial installs
	// since content script extension contexts are invalidated
	// on updates
	webAppApi.clearTabs();
	webAppApi.injectContentScripts();
	// log all installations
	// safari doesn't allow us to get or set cookies prior to user granting access
	// in fact chrome.cookies.* api calls take 30+s to time out with no results
	// so we need to rely on the api server to get and set them for us
	chrome.runtime.getPlatformInfo(
		platformInfo => {
			if (details.reason === 'install') {
				badgeApi.setLoading();
			}
			serverApi
				.logExtensionInstallation({
					arch: platformInfo.arch,
					installationId: localStorage.getItem('installationId'),
					os: platformInfo.os
				})
				.then(
					response => {
						if (details.reason === 'install') {
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
						if (!response.installationId) {
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
						localStorage.setItem('installationId', response.installationId);
					}
				)
				.catch(
					error => {
						console.log('[EventPage] error logging installation');
						if (error) {
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
	if (chrome.notifications) {
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
	() => {
		console.log('[EventPage] startup');
		// initialize tabs
		webAppApi.clearTabs();
		webAppApi.injectContentScripts();
	}
);
chrome.browserAction.onClicked.addListener(
	tab => {
		// check if we're logged in
		if (!serverApi.isAuthenticated()) {
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
		if (!tab.url) {
			return;
		}
		// web app
		if (tab.url.startsWith(createUrl(window.reallyreadit.extension.config.webServer))) {
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
		}
	}
);
chrome.alarms.onAlarm.addListener(
	alarm => {
		if (alarm.name === 'updateContentParser') {
			const currentVersion = SemanticVersion.greatest(
				...[
					window.reallyreadit.extension.config.version.common.contentParser,
					localStorage.getItem('contentParserVersion')
				]
				.filter(string => !!string)
				.map(versionString => new SemanticVersion(versionString))
			);
			console.log(`chrome.alarms.onAlarm (updateContentParser: checking for new version. current version: ${currentVersion.toString()})`);
			fetch(createUrl(window.reallyreadit.extension.config.staticServer, '/extension/content-parser.txt'))
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
						fetch(createUrl(window.reallyreadit.extension.config.staticServer, '/extension/content-parser/' + newVersionInfo.fileName))
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