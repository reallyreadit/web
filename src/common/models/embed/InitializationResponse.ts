// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import UserAccount from '../UserAccount';
import UserArticle from '../UserArticle';

export enum InitializationAction {
	Activate = 0,
	Deactivate = 1,
}
export type InitializationResponse =
	| InitializationActivationResponse
	| InitializationDeactivationResponse;
export interface InitializationDeactivationResponse {
	action: InitializationAction.Deactivate;
}
export interface InitializationActivationResponse {
	action: InitializationAction.Activate;
	article: UserArticle;
	user: UserAccount;
	userArticle: {
		articleId: number;
		dateCompleted: string | null;
		dateCreated: string;
		lastModified: string | null;
		readableWordCount: number;
		readState: number[];
		wordsRead: number;
	};
}
