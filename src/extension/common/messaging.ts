// Use enum to determine type since null values or errors aren't preserved during serialization.
export enum ResponseType {
	Success,
	Error
}
interface MessageErrorResponse {
	error: string;
	type: ResponseType.Error;
}
interface MessageSuccessResponse<T> {
	value: T;
	type: ResponseType.Success
}
export type MessageResponse<T> =
	| MessageSuccessResponse<T>
	| MessageErrorResponse;
export function isSuccessResponse<T>(
	response: MessageResponse<T>
): response is MessageSuccessResponse<T> {
	return response?.type === ResponseType.Success;
}
export function createMessageResponseHandler<T>(
	promise: Promise<T>,
	sendResponse: (response: MessageResponse<T>) => void
) {
	promise
		.then((value) => {
			sendResponse({
				value,
				type: ResponseType.Success
			});
		})
		.catch((reason) => {
			// Error properties are non-enumerable
			if (reason instanceof Error) {
				reason = {
					message: reason.message,
					name: reason.name,
				};
			}
			sendResponse({
				error: reason,
				type: ResponseType.Error
			});
		});
}
