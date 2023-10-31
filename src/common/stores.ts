const
	appStore = 'https://apps.apple.com/us/app/readup-social-reading/id1441825432',
	chromeStore = 'https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi',
	edgeStore = 'https://microsoftedge.microsoft.com/addons/detail/readup/nnnlnihiejbbkikldbfeeefljhpplhcm',
	firefoxStore = 'https://addons.mozilla.org/en-US/firefox/addon/readup/';

export function isAndroidDevice() {
	return /(android)/i.test(navigator.userAgent);
}
export function isIosDevice() {
	// we need a special platform check for iPadOS which isn't detectable via user agent
	return (
		/(iphone|ipad|ipod)/i.test(navigator.userAgent) ||
		(/^mac/i.test(navigator.platform) && navigator.maxTouchPoints > 0)
	);
}
export function getStoreUrl() {
	const userAgent = navigator.userAgent;
	// first test for mobile devices since the browser extensions don't work there
	if (isIosDevice()) {
		return appStore;
	}
	if (isAndroidDevice()) {
		return null;
	}
	// no other major browsers claim to be firefox
	if (/(firefox)/i.test(userAgent)) {
		return firefoxStore;
	}
	// test edge before chrome and safari since it also includes 'chrome' and 'safari'
	if (/(edg)/i.test(userAgent)) {
		return edgeStore;
	}
	// test chrome before safari since brave includes 'chrome' and 'safari'
	// but users chrome extensions
	if (/(chrome)/i.test(userAgent)) {
		return chromeStore;
	}
	if (/(safari)/i.test(userAgent)) {
		return appStore;
	}
	return null;
}
