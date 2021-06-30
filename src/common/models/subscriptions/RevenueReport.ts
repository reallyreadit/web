export interface RevenueReport {
	totalRevenue: number,
	authorAllocation: number,
	authorEarnings: number,
	totalPayouts: number
}
export interface RevenueReportRequest {
	useCache: boolean
}
export interface RevenueReportResponse {
	report: RevenueReport
}