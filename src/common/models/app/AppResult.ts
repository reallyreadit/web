import { Result, ResultType } from '../../Result';

type AppError = number;
export interface ErrorResponse<T extends AppError | void = void> {
	value?: T,
	message?: string
}
export function formatAppErrorResponseMessage(response: Pick<ErrorResponse, 'message'>) {
	if (response.message) {
		return `An unexpected error occurred: ${response.message}`;
	}
	return 'An unexpected error occurred.';
}
export function reduceAppErrorResponse<T extends AppError>(
	response: ErrorResponse<T>,
	messages: { [key in T]: string }
) {
	if (response.value != null) {
		return messages[response.value];
	}
	return formatAppErrorResponseMessage(response);
}
export function mapAppSuccessResult<TSuccess, TError extends AppError, TFailure extends ErrorResponse<TError>, TMappedSuccess>(
	result: Result<TSuccess, TFailure>,
	success: (result: TSuccess) => TMappedSuccess
): Result<TMappedSuccess, TFailure> {
	if (result.type === ResultType.Success) {
		return {
			type: ResultType.Success,
			value: success(result.value)
		};
	}
	return result;
}
export function mapAppResult<TSuccess, TError extends AppError, TFailure extends ErrorResponse<TError>, TMappedSuccess>(
	result: Result<TSuccess, TFailure>,
	success: (result: TSuccess) => TMappedSuccess,
	errorMessages: { [key in TError]: string }
): Result<TMappedSuccess, string> {
	switch (result.type) {
		case ResultType.Success:
			return {
				type: ResultType.Success,
				value: success(result.value)
			};
		case ResultType.Failure:
			return {
				type: ResultType.Failure,
				error: reduceAppErrorResponse(result.error, errorMessages)
			};
	}
}