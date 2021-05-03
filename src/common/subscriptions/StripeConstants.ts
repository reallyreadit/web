export enum StripePaymentIntentStatus {
	RequiresPaymentMethod = "requires_payment_method",
	RequiresConfirmation = "requires_confirmation",
	RequiresAction = "requires_action",
	Processing = "processing",
	RequiresCapture = "requires_capture",
	Cancelled = "canceled",
	Succeeded = "succeeded"
}