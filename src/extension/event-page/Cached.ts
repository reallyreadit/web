export interface Cached<T> {
	value: T,
	timestamp: number,
	expirationTimespan: number
}
export function cache<T>(value: T, expirationTimespan: number) {
	return {
		value,
		timestamp: Date.now(),
		expirationTimespan
	};
}
export function isExpired<T>(item: Cached<T>) {
	return Date.now() - item.timestamp > item.expirationTimespan;
}