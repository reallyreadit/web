import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPriceLevel } from './SubscriptionPrice';

export enum SubscriptionStatusType {
	NeverSubscribed = 1,
	PaymentConfirmationRequired = 2,
	PaymentFailed = 3,
	Active = 4,
	Lapsed = 5
}
export enum FreeTrialCreditType {
	ArticleView = 1
}
export enum FreeTrialCreditTrigger {
	AccountCreated = 1,
	PromoTweetIntended = 2
}
export interface FreeTrialCredit {
	dateCreated: string,
	trigger: FreeTrialCreditTrigger,
	type: FreeTrialCreditType
	amount: number
}
export interface FreeTrialArticleView {
	// articleId is returned by the API but for the time being it makes things simpler to only
	// use the article slug since that's what is usually passed around when reading articles.
	//articleId: number,
	articleSlug: string,
	dateViewed: string
}
export interface FreeTrial {
	credits: FreeTrialCredit[],
	articleViews: FreeTrialArticleView[]
}
export type InactiveSubscriptionStatusWithFreeTrialBase = {
	isUserFreeForLife: false,
	freeTrial: FreeTrial
}

export type InactiveSubscriptionStatusBase = {
	isUserFreeForLife: true
} | InactiveSubscriptionStatusWithFreeTrialBase;
type NeverSubscribedSubscriptionStatusBase = {
	type: SubscriptionStatusType.NeverSubscribed
};
export type NeverSubscribedSubscriptionStatus = NeverSubscribedSubscriptionStatusBase & InactiveSubscriptionStatusBase;
type PaymentConfirmationRequiredSubscriptionStatusBase = {
	type: SubscriptionStatusType.PaymentConfirmationRequired,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	invoiceId: string
};
export type PaymentConfirmationRequiredSubscriptionStatus = PaymentConfirmationRequiredSubscriptionStatusBase & InactiveSubscriptionStatusBase;
type PaymentFailedSubscriptionStatusBase = {
	type: SubscriptionStatusType.PaymentFailed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel
};
export type PaymentFailedSubscriptionStatus = PaymentFailedSubscriptionStatusBase & InactiveSubscriptionStatusBase;
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
type LapsedSubscriptionStatusBase = {
	type: SubscriptionStatusType.Lapsed,
	provider: SubscriptionProvider,
	price: SubscriptionPriceLevel,
	lastPeriodEndDate: string,
	lastPeriodRenewalGracePeriodEndDate: string,
	lastPeriodDateRefunded: string | null
};
export type LapsedSubscriptionStatus = LapsedSubscriptionStatusBase & InactiveSubscriptionStatusBase;
export type SubscriptionStatus =
	NeverSubscribedSubscriptionStatus |
	PaymentConfirmationRequiredSubscriptionStatus |
	PaymentFailedSubscriptionStatus |
	ActiveSubscriptionStatus |
	LapsedSubscriptionStatus;
export type InactiveSubscriptionStatusWithFreeTrial =
	(NeverSubscribedSubscriptionStatusBase & InactiveSubscriptionStatusWithFreeTrialBase) |
	(PaymentConfirmationRequiredSubscriptionStatus & InactiveSubscriptionStatusWithFreeTrialBase) |
	(PaymentFailedSubscriptionStatus & InactiveSubscriptionStatusWithFreeTrialBase) |
	(LapsedSubscriptionStatus & InactiveSubscriptionStatusWithFreeTrialBase);