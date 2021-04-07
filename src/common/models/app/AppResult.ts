import { Result, ResultType } from '../../Result';

export function mapAppSuccessResult<TSuccess, TFailure, TMappedSuccess>(
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
export function mapAppResult<TSuccess, TFailure, TMappedSuccess, TMappedFailure>(
	result: Result<TSuccess, TFailure>,
	success: (result: TSuccess) => TMappedSuccess,
	failure: (error: TFailure) => TMappedFailure
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