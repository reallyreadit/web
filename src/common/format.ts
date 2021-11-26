import { CancellationToken } from "./AsyncTracker";
import Fetchable from "./Fetchable";
import { isProblemDetails, ProblemDetails } from "./ProblemDetails";
import { FailureResult, ResultType } from "./Result";

export function formatCurrency(amount: number) {
	return (amount / 100)
		.toLocaleString(
			'en-US',
			{
				style: 'currency',
				currency: 'usd'
			}
		);
}
export function formatIsoDateAsDotNet(isoDate: string) {
	return isoDate.replace(/z$/i, '');
}
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
export function formatProblemDetails(problem: ProblemDetails) {
	return problem.detail ?? problem.title;
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
	return text.length > length ? text.substring(0, length - 1) + '…' : text;
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
export function generateRandomString(byteCount: number) {
	const bytes = new Uint8Array(byteCount);
	window.crypto.getRandomValues(bytes);
	return bytes.reduce(
		(result, byte) => result + byte.toString(16),
		''
	);
}
export function getPromiseErrorMessage(reason: any) {
	if (!reason) {
		return 'An unknown error occurred.';
	}
	if (
		isProblemDetails(reason)
	) {
		return formatProblemDetails(reason);
	}
	if (
		Array.isArray(reason) &&
		typeof reason[0] === 'string'
	) {
		return reason[0];
	}
	if (
		'message' in reason
	) {
		return reason.message;
	}
	if (
		typeof reason === 'string'
	) {
		return reason;
	}
	return 'An unknown error occurred.';
}
export function mapPromiseErrorToResultIfNotCancelled(reason: any, handler: (result: FailureResult<string>) => void) {
	if ((reason as CancellationToken)?.isCancelled) {
		return;
	}
	handler({
		type: ResultType.Failure,
		error: getPromiseErrorMessage(reason)
	});
}