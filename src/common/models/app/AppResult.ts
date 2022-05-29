// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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