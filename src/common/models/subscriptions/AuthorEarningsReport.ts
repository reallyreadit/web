export interface AuthorEarningsReport {
	authorName: string,
	authorSlug: string,
	userAccountName: string | null,
	donationRecipientName: string | null,
	minutesRead: number,
	amountEarned: number
}
export interface AuthorsEarningsReportResponse {
	lineItems: AuthorEarningsReport[]
}