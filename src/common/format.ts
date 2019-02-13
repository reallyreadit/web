import Fetchable from "./Fetchable";

export function formatFetchable<T, U>(
	fetchable: Fetchable<T>,
	formatter: ((value: T) => U),
	loadingMessage?: string,
	errorMessage?: string
) {
	if (fetchable.isLoading) {
		return loadingMessage;
	}
	if (fetchable.errors) {
		return errorMessage;
	}
	return formatter(fetchable.value);
}
export function formatTimestamp(timestamp: string) {
	if (!timestamp || timestamp.length < 10) {
		return timestamp;
	}
	return (
		parseInt(timestamp.substr(5, 2)) + '/' +
		parseInt(timestamp.substr(8, 2)) + '/' +
		timestamp.substr(2, 2)
	);
}
export function truncateText(text: string, length: number) {
	if (!text) {
		return text;
	}
	return text.length > length ? text.substring(0, length) + '...' : text;
}