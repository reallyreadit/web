export interface AuthorEarningsReport {
	authorName: string,
	authorSlug: string,
	userAccountName: string | null,
	donationRecipientName: string | null,
	minutesRead: number,
	amountEarned: number,
	status: AuthorEarningsReportStatus
}
export enum AuthorEarningsReportStatus {
	ApproachingMinimum = 1,
	NotYetContacted = 2,
	Contacted = 3,
	AuthorPaidOut = 4,
	DonationPaidOut = 5
}
export interface AuthorsEarningsReportResponse {
	lineItems: AuthorEarningsReport[]
}