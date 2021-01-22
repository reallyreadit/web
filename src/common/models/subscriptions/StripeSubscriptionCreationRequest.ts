export type StripeSubscriptionCreationRequest = {
		paymentMethodId: string,
		priceLevelId: string
	} | {
		paymentMethodId: string,
		customPriceAmount: number
	};