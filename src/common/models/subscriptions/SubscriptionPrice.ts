import { formatCurrency } from "../../format";

export type StandardSubscriptionPriceLevel = {
	id: string,
	name: string,
	amount: number
};
export type CustomSubscriptionPriceLevel = Pick<StandardSubscriptionPriceLevel, 'amount' | 'id'>;
export type SubscriptionPriceLevel = StandardSubscriptionPriceLevel | CustomSubscriptionPriceLevel;
export type SubscriptionPriceSelection = (
	StandardSubscriptionPriceLevel |
	Pick<CustomSubscriptionPriceLevel, 'amount'>
);
export function formatSubscriptionPriceAmount(price: Pick<StandardSubscriptionPriceLevel, 'amount'>) {
	return formatCurrency(price.amount);
}
export function formatSubscriptionPriceName(price: SubscriptionPriceLevel | SubscriptionPriceSelection) {
	if (
		isStandardSubscriptionPriceLevel(price)
	) {
		return price.name;
	}
	return 'Custom Price';
}
export function isStandardSubscriptionPriceLevel(price: SubscriptionPriceLevel | SubscriptionPriceSelection): price is StandardSubscriptionPriceLevel {
	return (price as StandardSubscriptionPriceLevel).name != null;
}