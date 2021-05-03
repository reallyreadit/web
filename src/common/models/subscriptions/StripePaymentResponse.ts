import { SubscriptionStatus } from './SubscriptionStatus';

export enum StripePaymentResponseType {
	Succeeded = 1,
	RequiresConfirmation = 2,
	Failed = 3
}
export type StripePaymentResponse = {
		type: StripePaymentResponseType.Succeeded,
		subscriptionStatus: SubscriptionStatus
	} | {
		type: StripePaymentResponseType.RequiresConfirmation,
		subscriptionStatus: SubscriptionStatus,
		clientSecret: string,
		invoiceId: string
	} | {
		type: StripePaymentResponseType.Failed,
		subscriptionStatus: SubscriptionStatus,
		errorMessage: string | null
	} ;