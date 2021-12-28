export interface PayoutReportLineItem {
	authorName: string,
	totalEarnings: number,
	totalPayouts: number,
	totalDonations: number,
	currentBalance: number
}
export interface PayoutReportRequest {

}
export interface PayoutReportResponse {
	lineItems: PayoutReportLineItem[]
}