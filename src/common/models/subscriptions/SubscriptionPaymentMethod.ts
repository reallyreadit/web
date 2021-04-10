export enum SubscriptionPaymentMethodWallet {
	None = 0,
	AmexExpressCheckout = 1,
	ApplePay = 2,
	GooglePay = 3,
	Masterpass = 4,
	SamsungPay = 5,
	VisaCheckout = 6
}
export enum SubscriptionPaymentMethodBrand {
	None = 0,
	Amex = 1,
	Diners = 2,
	Discover = 3,
	Jcb = 4,
	Mastercard = 5,
	Unionpay = 6,
	Visa = 7
}
export interface SubscriptionPaymentMethod {
	id: string,
	wallet: SubscriptionPaymentMethodWallet,
	brand: SubscriptionPaymentMethodBrand,
	lastFourDigits: string,
	expirationMonth: number,
	expirationYear: number
}
export interface SubscriptionPaymentMethodUpdateRequest {
	id: string,
	expirationMonth: number,
	expirationYear: number
}
export interface SubscriptionPaymentMethodResponse {
	paymentMethod: SubscriptionPaymentMethod
}