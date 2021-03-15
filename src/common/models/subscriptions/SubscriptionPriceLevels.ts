import SubscriptionProvider from './SubscriptionProvider';
import { StandardSubscriptionPriceLevel } from './SubscriptionPrice';

export interface SubscriptionPriceLevelsRequest {
	provider: SubscriptionProvider
}
export interface SubscriptionPriceLevelsResponse {
	prices: StandardSubscriptionPriceLevel[]
}