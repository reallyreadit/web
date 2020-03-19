interface MessageErrorResponse {
	error: string
}
interface MessageSuccessResponse<T> {
	value: T
}
export type MessageResponse<T> = MessageSuccessResponse<T> | MessageErrorResponse;
export function isSuccessResponse<T>(response: MessageResponse<T>): response is MessageSuccessResponse<T> {
	return (response as MessageSuccessResponse<T>).value != null;
}
export function createMessageResponseHandler<T>(promise: Promise<T>, sendResponse: (response: MessageResponse<T>) => void, error?: string) {
	promise
		.then(
			value => {
				sendResponse({
					value
				});
			}
		)
		.catch(
			() => {
				sendResponse({
					error
				});
			}
		);
}