interface MessageErrorResponse {
	error: string
}
interface MessageSuccessResponse<T> {
	value: T
}
export type MessageResponse<T> = MessageSuccessResponse<T> | MessageErrorResponse;
export function isSuccessResponse<T>(response: MessageResponse<T>): response is MessageSuccessResponse<T> {
	return 'value' in response;
}
export function createMessageResponseHandler<T>(promise: Promise<T>, sendResponse: (response: MessageResponse<T>) => void) {
	promise
		.then(
			value => {
				sendResponse({
					value
				});
			}
		)
		.catch(
			reason => {
				// Error properties are non-enumerable
				if (reason instanceof Error) {
					reason = {
						message: reason.message,
						name: reason.name
					};
				}
				sendResponse({
					error: reason
				});
			}
		);
}