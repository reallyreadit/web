import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPriceLevel } from './SubscriptionPrice';

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
	price: SubscriptionPriceLevel,
	invoiceId: string,
	isUserFreeForLife: boolean
};
export type PaymentFailedSubscriptionStatus = {
	type: SubscriptionStatusType.PaymentFailed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	isUserFreeForLife: boolean
};
export type ActiveSubscriptionStatus = {
		type: SubscriptionStatusType.Active,
		provider: SubscriptionProvider,
		price: SubscriptionPriceLevel,
		currentPeriodBeginDate: string,
		currentPeriodEndDate: string,
		currentPeriodRenewalGracePeriodEndDate: string,
		isUserFreeForLife: boolean
	} & (
		{
			autoRenewEnabled: true,
			autoRenewPrice: SubscriptionPriceLevel
		} | {
			autoRenewEnabled: false
		}
	);
export type LapsedSubscriptionStatus = {
	type: SubscriptionStatusType.Lapsed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	lastPeriodEndDate: string,
	lastPeriodRenewalGracePeriodEndDate: string,
	lastPeriodDateRefunded: string | null,
	isUserFreeForLife: boolean
};
export type SubscriptionStatus =
	NeverSubscribedSubscriptionStatus |
	PaymentConfirmationRequiredSubscriptionStatus |
	PaymentFailedSubscriptionStatus |
	ActiveSubscriptionStatus |
	LapsedSubscriptionStatus;
