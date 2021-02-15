import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPrice } from './SubscriptionPrice';

export enum SubscriptionStatusType {
	NeverSubscribed = 1,
	Incomplete = 2,
	Active = 3,
	Lapsed = 4
}
export type NeverSubscribedSubscriptionStatus = {
	type: SubscriptionStatusType.NeverSubscribed,
	isUserFreeForLife: boolean
};
export type IncompleteSubscriptionStatus = {
	type: SubscriptionStatusType.Incomplete,
	provider: SubscriptionProvider,
	price: SubscriptionPrice,
	requiresConfirmation: boolean,
	isUserFreeForLife: boolean
};
export type ActiveSubscriptionStatus = {
	type: SubscriptionStatusType.Active,
	provider: SubscriptionProvider,
	price: SubscriptionPrice,
	currentPeriodBeginDate: string,
	currentPeriodEndDate: string,
	isUserFreeForLife: boolean
};
export type LapsedSubscriptionStatus = {
	type: SubscriptionStatusType.Lapsed,
	provider: SubscriptionProvider,
	price: SubscriptionPrice,
	lastPeriodEndDate: string,
	isUserFreeForLife: boolean
};
export type SubscriptionStatus =
	NeverSubscribedSubscriptionStatus |
	IncompleteSubscriptionStatus |
	ActiveSubscriptionStatus |
	LapsedSubscriptionStatus;
