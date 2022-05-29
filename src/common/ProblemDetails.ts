// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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