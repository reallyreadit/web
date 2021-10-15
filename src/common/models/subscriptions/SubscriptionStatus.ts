import SubscriptionProvider from './SubscriptionProvider';
import { SubscriptionPriceLevel } from './SubscriptionPrice';

export function calculateFreeViewBalance(freeTrial: FreeTrial) {
	const totalViewCreditAmount = freeTrial.credits
		.filter(
			credit => credit.type === FreeTrialCreditType.ArticleView
		)
		.reduce(
			(total, credit) => total + credit.amount,
			0
		);
	return totalViewCreditAmount - freeTrial.articleViews.length;
}
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
