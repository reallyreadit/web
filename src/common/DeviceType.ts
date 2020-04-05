export enum DeviceType {
	Unknown = 'Unknown',
	Ios = 'iOS',
	Android = 'Android',
	DesktopChrome = 'Chrome',
	DesktopFirefox = 'Firefox',
	DesktopSafari = 'Safari',
	DesktopEdge = 'Edge'
}
type CompatibleBrowser = DeviceType.DesktopChrome | DeviceType.DesktopFirefox;
type CompatibleDevice = CompatibleBrowser | DeviceType.Ios;
export function getDeviceType(userAgent: string) {
	// test for mobile os first since browsers don't matter there
	if (/(iphone|ipad|ipod)/i.test(userAgent)) {
		return DeviceType.Ios;
	}
	if (/(android)/i.test(userAgent)) {
		return DeviceType.Android;
	}
	// test edge first since it also includes 'chrome' and 'safari'
	if (/(edge)/i.test(userAgent)) {
		return DeviceType.DesktopEdge;
	}
	// test chrome before safari since brave includes 'chrome' and 'safari'
	// but users chrome extensions
	if (/(chrome)/i.test(userAgent)) {
		return DeviceType.DesktopChrome;
	}
	if (/(safari)/i.test(userAgent)) {
		return DeviceType.DesktopSafari;
	}
	return DeviceType.Unknown;
}
export function getExtensionName(deviceType: CompatibleBrowser) {
	switch (deviceType) {
		case DeviceType.DesktopChrome:
			return 'extension';
		case DeviceType.DesktopFirefox:
			return 'add-on';
	}
}
export function getStoreUrl(deviceType: CompatibleDevice) {
	switch (deviceType) {
		case DeviceType.DesktopChrome:
			return 'https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi';
		case DeviceType.DesktopFirefox:
			return 'https://addons.mozilla.org/en-US/firefox/addon/readup/';
		case DeviceType.Ios:
			return 'https://apps.apple.com/us/app/readup-app/id1441825432';
	}
}
export function isCompatibleBrowser(deviceType: DeviceType): deviceType is CompatibleBrowser {
	return deviceType === DeviceType.DesktopChrome || deviceType === DeviceType.DesktopFirefox;
}
export function isCompatibleDevice(deviceType: DeviceType): deviceType is CompatibleDevice {
	return isCompatibleBrowser(deviceType) || deviceType === DeviceType.Ios;
}
export function isMobileDevice(deviceType: DeviceType) {
	return deviceType === DeviceType.Android || deviceType === DeviceType.Ios;
}