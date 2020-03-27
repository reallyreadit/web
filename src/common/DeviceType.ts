export enum DeviceType {
	Unknown,
	Ios,
	Android,
	DesktopChrome,
	DesktopFirefox,
	DesktopSafari,
	DesktopEdge
}
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