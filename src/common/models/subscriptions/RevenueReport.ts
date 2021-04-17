export interface RevenueReport {
	totalRevenue: number,
	authorAllocation: number
}
export interface RevenueReportRequest {
	useCache: boolean
}
export interface RevenueReportResponse {
	report: RevenueReport
}