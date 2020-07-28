import Fetchable from "./Fetchable";

export function formatIsoDateAsUtc(isoDate: string) {
	return isoDate.endsWith('Z') ? isoDate : isoDate + 'Z';
}
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
export function formatList<T>(list: T[]) {
	if (!list || list.length === 0) {
		return '';
	}
	if (list.length === 1) {
		return list[0];
	}
	return `${list.slice(0, list.length - 1).join(', ')} & ${list[list.length - 1]}`;
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
	return text.length > length ? text.substring(0, length - 3) + '...' : text;
}
export function formatPossessive(text: string) {
	return `${text}'${text.endsWith('s') ? '' : 's'}`;
}
export function formatCountable(count: number, singular: string, plural?: string) {
	return count === 1 ?
		singular :
		plural || singular + 's';
}
export function pad(input: string, direction: 'left' | 'right', padding: string, spaces: number) {
	while (padding.length < spaces) {
		padding += padding;
	}
	if (direction === 'left') {
		return (padding + input).slice(-spaces);
	} else {
		return (input + padding).slice(0, Math.max(input.length, spaces));
	}
}