export type StripeSubscriptionPaymentRequest = {
		paymentMethodId: string,
		priceLevelId: string
	} | {
		paymentMethodId: string,
		customPriceAmount: number
	};