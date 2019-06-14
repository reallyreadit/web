export default interface KeyMetricsReportRow {
	day: string,
	userAccountAppCount: number,
	userAccountBrowserCount: number,
	userAccountUnknownCount: number,
	readAppCount: number,
	readBrowserCount: number,
	readUnknownCount: number,
	commentAppCount: number,
	commentBrowserCount: number,
	commentUnknownCount: number,
	extensionInstallationCount: number,
	extensionRemovalCount: number
}