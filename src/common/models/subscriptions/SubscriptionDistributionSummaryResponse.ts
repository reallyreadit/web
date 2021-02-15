import { SubscriptionStatus } from './SubscriptionStatus';
import { SubscriptionDistributionReport } from './SubscriptionDistributionReport';

export interface SubscriptionDistributionSummaryResponse {
	subscriptionStatus: SubscriptionStatus,
	currentPeriod: SubscriptionDistributionReport,
	completedPeriods: SubscriptionDistributionReport
}