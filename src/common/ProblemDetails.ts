export function isProblemDetails(error: any): error is ProblemDetails {
	if (error == null || typeof error !== 'object') {
		return false;
	}
	return (
		typeof error['title'] === 'string' &&
		typeof error['type'] === 'string'
	);
}
export function isHttpProblemDetails(error: any): error is HttpProblemDetails {
	if (
		!isProblemDetails(error)
	) {
		return false;
	}
	return (
		typeof (error as HttpProblemDetails)['status'] === 'number' &&
		typeof (error as HttpProblemDetails)['traceId'] === 'string'
	);
}
export interface ProblemDetails {
	detail?: string,
	instance?: string,
	title: string,
	type: string
}
export interface HttpProblemDetails extends ProblemDetails {
	status: number,
	traceId: string
}