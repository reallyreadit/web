export function isProblemResponse(error: any): error is ProblemResponse {
	if (error == null || typeof error !== 'object') {
		return false;
	}
	return (
		typeof error['status'] === 'number' &&
		typeof error['title'] === 'string' &&
		typeof error['traceId'] === 'string' &&
		typeof error['type'] === 'string'
	);
}
export default interface ProblemResponse {
	detail?: string,
	status: number,
	title: string,
	traceId: string,
	type: string
}