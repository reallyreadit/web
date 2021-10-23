export enum BulkEmailSubscriptionStatusFilter {
	CurrentlySubscribed = 1,
	NotCurrentlySubscribed = 2,
	NeverSubscribed = 3
}
export interface BulkMailingRequest {
	subject: string,
	body: string,
	subscriptionStatusFilter: BulkEmailSubscriptionStatusFilter | null,
	freeForLifeFilter: boolean | null,
	userCreatedAfterFilter: string | null,
	userCreatedBeforeFilter: string | null
}
export interface BulkMailingTestRequest extends BulkMailingRequest {
	emailAddress: string
}
export default interface BulkMailing {
	id: number,
	dateSent: string,
	subject: string,
	body: string,
	type: string,
	subscriptionStatusFilter: BulkEmailSubscriptionStatusFilter | null,
	freeForLifeFilter: boolean | null,
	userCreatedAfterFilter: string | null,
	userCreatedBeforeFilter: string | null,
	userAccount: string,
	recipientCount: number
}