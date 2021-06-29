import SubscriptionProvider from '../subscriptions/SubscriptionProvider';

export interface RevenueReportLineItem {
	period: string,
	provider: SubscriptionProvider | null,
	priceName: string | null,
	priceAmount: number,
	quantityPurchased: number,
	quantityRefunded: number
}

export interface MonthlyRecurringRevenueReportLineItem {
	period: string,
	amount: number
}

export interface RevenueReportResponse {
	lineItems: RevenueReportLineItem[],
	monthlyRecurringRevenueLineItems: MonthlyRecurringRevenueReportLineItem[]
}