export enum ProductsRequestError {
	CannotMakePayments = 1
}
export enum PurchaseError {
	ProductNotFound = 1
}
export enum ReceiptRequestError {
	FileUrlNotFound = 1
}
export enum TransactionError {
	Cancelled = 1,
	ReceiptRequestFailed = 2,
	SubscriptionValidationFailed = 3
}