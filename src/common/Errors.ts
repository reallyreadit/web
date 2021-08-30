export enum AppStoreErrorType {
	PaymentsDisallowed = "https://docs.readup.com/errors/app-store/payments-disallowed",
	ProductNotFound = "https://docs.readup.com/errors/app-store/product-not-found",
	PurchaseCancelled = "https://docs.readup.com/errors/app-store/purchase-cancelled",
	ReceiptNotFound = "https://docs.readup.com/errors/app-store/receipt-not-found",
	ReceiptRequestFailed = "https://docs.readup.com/errors/app-store/receipt-request-failed"
};
export enum BrowserExtensionAppErrorType {
	MessageParsingFailed = "https://docs.readup.com/errors/browser-extension-app/message-parsing-failed",
	ReadupProtocolFailed = "https://docs.readup.com/errors/browser-extension-app/readup-protocol-failed",
	UnexpectedMessageType = "https://docs.readup.com/errors/browser-extension-app/unexpected-message-type"
}
export enum ReadingErrorType {
	SubscriptionRequired = "https://docs.readup.com/errors/reading/subscription-required"
};
export enum SubscriptionsErrorType {
	ReceiptValidationFailed = "https://docs.readup.com/errors/subscriptions/receipt-validation-failed"
}