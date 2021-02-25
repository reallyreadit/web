import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPrice } from './SubscriptionPrice';

export enum SubscriptionStatusType {
	NeverSubscribed = 1,
	PaymentConfirmationRequired = 2,
	PaymentFailed = 3,
	Active = 4,
	Lapsed = 5
}
export type NeverSubscribedSubscriptionStatus = {
	type: SubscriptionStatusType.NeverSubscribed,
	isUserFreeForLife: boolean
};
export type PaymentConfirmationRequiredSubscriptionStatus = {
	type: SubscriptionStatusType.PaymentConfirmationRequired,
	provider: SubscriptionProvider,
	price: SubscriptionPrice,
	invoiceId: string,
	isUserFreeForLife: boolean
};
export type PaymentFailedSubscriptionStatus = {
	type: SubscriptionStatusType.PaymentFailed,
	provider: SubscriptionProvider,
	price: SubscriptionPrice,
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
	PaymentConfirmationRequiredSubscriptionStatus |
	PaymentFailedSubscriptionStatus |
	ActiveSubscriptionStatus |
	LapsedSubscriptionStatus;
