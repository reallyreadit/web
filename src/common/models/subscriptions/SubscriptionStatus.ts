import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPriceLevel } from './SubscriptionPrice';

export function calculateFreeViewBalance(freeTrial: FreeTrial) {
	const totalCreditAmount = freeTrial.freeViewCredits.reduce(
		(total, credit) => total + credit.amount,
		0
	);
	return totalCreditAmount - freeTrial.freeViews.length;
}
export enum SubscriptionStatusType {
	NeverSubscribed = 1,
	PaymentConfirmationRequired = 2,
	PaymentFailed = 3,
	Active = 4,
	Lapsed = 5
}
export enum FreeViewCreditType {
	AccountCreated = 1,
	PromoTweetIntended = 2
}
export interface FreeViewCredit {
	type: FreeViewCreditType,
	dateIssued: string,
	amount: number
}
export interface FreeView {
	article_id: number
}
export interface FreeTrial {
	freeViewCredits: FreeViewCredit[],
	freeViews: FreeView[]
}
export type InactiveSubscriptionStatusBase = {
	isUserFreeForLife: true
} | {
	isUserFreeForLife: false,
	freeTrial: FreeTrial
};
export type NeverSubscribedSubscriptionStatus = InactiveSubscriptionStatusBase & {
	type: SubscriptionStatusType.NeverSubscribed
};
export type PaymentConfirmationRequiredSubscriptionStatus = InactiveSubscriptionStatusBase & {
	type: SubscriptionStatusType.PaymentConfirmationRequired,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	invoiceId: string
};
export type PaymentFailedSubscriptionStatus = InactiveSubscriptionStatusBase & {
	type: SubscriptionStatusType.PaymentFailed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel
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
export type LapsedSubscriptionStatus = InactiveSubscriptionStatusBase & {
	type: SubscriptionStatusType.Lapsed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	lastPeriodEndDate: string,
	lastPeriodRenewalGracePeriodEndDate: string,
	lastPeriodDateRefunded: string | null
};
export type SubscriptionStatus =
	NeverSubscribedSubscriptionStatus |
	PaymentConfirmationRequiredSubscriptionStatus |
	PaymentFailedSubscriptionStatus |
	ActiveSubscriptionStatus |
	LapsedSubscriptionStatus;
