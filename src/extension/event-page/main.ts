import ServerApi from './ServerApi';
import WebAppApi from './WebAppApi';
import { createUrl } from '../../common/HttpEndpoint';
import { extensionInstalledQueryStringKey } from '../../common/routing/queryString';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import { ReadArticleNativeMessage, NativeMessageType, NativeMessageResponse } from './nativeMessaging';
import { ignoreList } from './ignoreList';

// browser action badge
const badgeApi = new BrowserActionBadgeApi();

// server
const serverApi = new ServerApi();

// web app
const webAppApi = new WebAppApi();

// alert content script
function showAlert(tabId: number, message: string) {
	chrome.tabs.executeScript(
		tabId,
		{
			code: `if (!window.reallyreadit?.alertContentScript) { window.reallyreadit = { ...window.reallyreadit, alertContentScript: { alertContent: '${message}' } }; chrome.runtime.sendMessage({ from: 'contentScriptInitializer', to: 'eventPage', type: 'injectAlert' }); } else if (!window.reallyreadit.alertContentScript.isActive) { window.reallyreadit.alertContentScript.display(); }`
		}
	);
}
function showDownloadAlert(tabId: number) {
	const downloadUrl = createUrl(window.reallyreadit.extension.config.webServer, '/download');
	showAlert(tabId, `Download the Readup app to continue: <a href="${downloadUrl}">${downloadUrl}</a>.`);
}

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
	localStorage.removeItem('displayedNotifications');
	localStorage.removeItem('displayPreference');
	localStorage.removeItem('blacklist');
	localStorage.removeItem('user');
	localStorage.removeItem('contentParserScript');
	localStorage.removeItem('contentParserVersion');
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
		// check which type of page we're looking at
		if (!tab.url) {
			return;
		}
		// web app
		if (tab.url.startsWith(createUrl(window.reallyreadit.extension.config.webServer))) {
			showAlert(tab.id, 'Press the Readup button when you\'re on an article web page.');
			return;
		}
		// ignore list
		if (
			ignoreList.some(
				regex => regex.test(tab.url)
			)
		) {
			showAlert(tab.id, 'No article detected on this web page.');
			return;
		}
		// article
		badgeApi.setLoading();
		const message: ReadArticleNativeMessage = {
			type: NativeMessageType.ReadArticle,
			data: {
				url: tab.url
			}
		};
		chrome.runtime.sendNativeMessage(
			'it.reallyread.mobile.browser_extension_app',
			message,
			(response?: NativeMessageResponse) => {
				badgeApi.setDefault();
				if (chrome.runtime.lastError) {
					console.log('[EventPage] Error sending native message.');
					showDownloadAlert(tab.id);
					return;
				}
				console.log("[EventPage] Received native message response:");
				console.log(response);
				if (!response?.succeeded) {
					showDownloadAlert(tab.id);
				}
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
		}
	}
);