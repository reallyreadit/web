export enum ResultType {
	Success = 1,
	Failure = 2,
	Loading = 3
}
export interface SuccessResult<T> {
	type: ResultType.Success,
	value: T
}
export interface FailureResult<T> {
	type: ResultType.Failure,
	error: T
}
export interface LoadingResult {
	type: ResultType.Loading
}
export type Result<TSuccess, TFailure> = SuccessResult<TSuccess> | FailureResult<TFailure>;
export type AsyncResult<TSuccess, TFailure> = Result<TSuccess, TFailure> | LoadingResult;
export function mapResult<TSuccess, TFailure, TMappedSuccess, TMappedFailure>(
	result: Result<TSuccess, TFailure>,
	success: (result: TSuccess) => TMappedSuccess,
	failure: (result: TFailure) => TMappedFailure
): Result<TMappedSuccess, TMappedFailure> {
	switch (result.type) {
		case ResultType.Success:
			return {
				type: ResultType.Success,
				value: success(result.value)
			};
		case ResultType.Failure:
			return {
				type: ResultType.Failure,
				error: failure(result.error)
			};
	}
}