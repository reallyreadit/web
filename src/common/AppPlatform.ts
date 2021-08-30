export enum AppPlatform {
	Android = 'Android',
	Ios = 'iOS',
	Linux = 'Linux',
	MacOs = 'macOS',
	Windows = 'Windows'
}
export function isAppleAppPlatform(platform: AppPlatform) {
	return platform === AppPlatform.Ios || platform === AppPlatform.MacOs;
}