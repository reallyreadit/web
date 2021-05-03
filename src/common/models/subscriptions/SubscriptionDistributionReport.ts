export interface SubscriptionDistributionAuthorReport {
	authorName: string,
	authorSlug: string,
	minutesRead: number,
	amount: number
}

export interface SubscriptionDistributionReport {
	subscriptionAmount: number,
	platformAmount: number,
	appleAmount: number,
	stripeAmount: number,
	unknownAuthorMinutesRead: number,
	unknownAuthorAmount: number,
	authorDistributions: SubscriptionDistributionAuthorReport[]
}