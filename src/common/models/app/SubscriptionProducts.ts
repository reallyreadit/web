export interface SubscriptionProduct {
	localizedDescription: string,
	localizedPrice: string,
	localizedTitle: string,
	productId: string
}
export interface SubscriptionProductsRequest {
	productIds: string[]
}
export interface SubscriptionProductsResponse {
	products: SubscriptionProduct[]
}
