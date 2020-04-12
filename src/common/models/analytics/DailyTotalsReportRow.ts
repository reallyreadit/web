export default interface DailyTotalsReportRow {
	day: string,
	signupAppCount: number,
	signupBrowserCount: number,
	signupUnknownCount: number,
	readAppCount: number,
	readBrowserCount: number,
	readUnknownCount: number,
	postAppCount: number,
	postBrowserCount: number,
	postUnknownCount: number,
	replyAppCount: number,
	replyBrowserCount: number,
	replyUnknownCount: number,
	postTweetAppCount: number,
	postTweetBrowserCount: number
	extensionInstallationCount: number,
	extensionRemovalCount: number
}