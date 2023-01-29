// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { ProblemDetails } from '../../common/ProblemDetails';

export enum NativeMessageType {
	ReadArticle = 'readArticle',
}
export interface ReadArticleNativeMessage {
	type: NativeMessageType.ReadArticle;
	data: {
		url: string;
		star: boolean;
	};
}
export interface NativeMessageResponseBase {
	version: string;
}
export interface NativeMessageSuccessResponse
	extends NativeMessageResponseBase {
	succeeded: true;
}
export interface NativeMessageErrorResponse extends NativeMessageResponseBase {
	succeeded: false;
	error: ProblemDetails;
}
export type NativeMessageResponse =
	| NativeMessageSuccessResponse
	| NativeMessageErrorResponse;
