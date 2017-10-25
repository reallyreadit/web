export default interface BulkMailing {
	id: string,
	dateSent: string,
	subject: string,
	body: string,
	list: string,
	userAccount: string,
	recipientCount: number
}