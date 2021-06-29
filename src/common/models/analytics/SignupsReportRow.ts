export default interface SignupsReportRow {
	id: number,
	name: string,
	email: string,
	dateCreated: string,
	timeZoneName: string,
	clientMode: string,
	referrerUrl: string | null,
	initialPath: string | null,
	currentPath: string | null,
	action: string | null,
	articleViewCount: number,
	articleReadCount: number,
	dateSubscribed: string | null
}