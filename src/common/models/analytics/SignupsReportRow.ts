export default interface SignupsReportRow {
	id: number,
	name: string,
	email: string,
	dateCreated: string,
	timeZoneName: string,
	clientMode: string,
	marketingVariant: number,
	referrerUrl: string | null,
	initialPath: string | null,
	currentPath: string | null,
	action: string | null,
	orientationShareCount: number,
	articleViewCount: number,
	articleReadCount: number,
	postTweetCount: number
}