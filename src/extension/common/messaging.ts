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
			error => {
				let errorText: string;
				if (error != null) {
					if (typeof error === 'string' || typeof error === 'number') {
						errorText = error.toString();
					} else if (
						'name' in error ||
						'message' in error ||
						'stack' in error
					) {
						errorText = JSON.stringify({
							name: error.name,
							message: error.message,
							stack: error.stack
						});
					} else {
						try {
							errorText = JSON.stringify(error);
						} catch {
							errorText = 'Failed to stringify error.';
						}
					}
				} else {
					errorText = 'No error provided.';
				}
				sendResponse({
					error: errorText
				});
			}
		);
}