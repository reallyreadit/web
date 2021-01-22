import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPriceLevel } from './SubscriptionPrice';

export interface SubscriptionPriceLevelsRequest {
	provider: SubscriptionProvider
}
export interface SubscriptionPriceLevelsResponse {
	prices: SubscriptionPriceLevel[]
}