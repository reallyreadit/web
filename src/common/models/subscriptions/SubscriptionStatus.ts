import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPrice } from './SubscriptionPrice';

export enum SubscriptionStatusType {
	NeverSubscribed = 1,
	Incomplete = 2,
	Active = 3,
	Lapsed = 4
}
export type SubscriptionStatus = {
		type: SubscriptionStatusType.NeverSubscribed,
		isUserFreeForLife: boolean
	} | {
		type: SubscriptionStatusType.Incomplete,
		provider: SubscriptionProvider,
		price: SubscriptionPrice,
		requiresConfirmation: boolean,
		isUserFreeForLife: boolean
	} | {
		type: SubscriptionStatusType.Active,
		provider: SubscriptionProvider,
		price: SubscriptionPrice,
		currentPeriodBeginDate: string,
		currentPeriodEndDate: string,
		isUserFreeForLife: boolean
	} | {
		type: SubscriptionStatusType.Lapsed,
		provider: SubscriptionProvider,
		price: SubscriptionPrice,
		lastPeriodEndDate: string,
		isUserFreeForLife: boolean
	};
