import { SubscriptionDistributionReport } from './SubscriptionDistributionReport';

export interface SubscriptionDistributionSummaryResponse {
	currentPeriod: SubscriptionDistributionReport,
	completedPeriods: SubscriptionDistributionReport
}