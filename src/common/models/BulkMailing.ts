export default interface BulkMailing {
	id: number,
	dateSent: string,
	subject: string,
	body: string,
	list: string,
	userAccount: string,
	recipientCount: number,
	errorCount: number
}