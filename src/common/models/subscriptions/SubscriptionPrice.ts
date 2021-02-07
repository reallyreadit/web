export type SubscriptionPriceLevel = {
	id: string,
	name: string,
	amount: number
};
export type SubscriptionPrice =
	SubscriptionPriceLevel | {
		amount: number
	};
export function formatSubscriptionPriceAmount(amount: number) {
	return (amount / 100)
		.toLocaleString(
			'en-US',
			{
				style: 'currency',
				currency: 'usd'
			}
		);
}
export function formatSubscriptionPriceName(price: SubscriptionPrice) {
	if (
		isSubscriptionPriceLevel(price)
	) {
		return price.name;
	}
	return 'Custom Price';
}
export function isSubscriptionPriceLevel(price: SubscriptionPrice): price is SubscriptionPriceLevel {
	return (price as SubscriptionPriceLevel).id != null;
}