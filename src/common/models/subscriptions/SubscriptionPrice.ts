export type StandardSubscriptionPriceLevel = {
	id: string,
	name: string,
	amount: number
};
export type CustomSubscriptionPriceLevel = Pick<StandardSubscriptionPriceLevel, 'amount' | 'id'>;
export type SubscriptionPriceLevel = StandardSubscriptionPriceLevel | CustomSubscriptionPriceLevel;
export type SubscriptionPrice =
	StandardSubscriptionPriceLevel | {
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
export function isSubscriptionPriceLevel(price: SubscriptionPrice): price is StandardSubscriptionPriceLevel {
	return (price as StandardSubscriptionPriceLevel).id != null;
}