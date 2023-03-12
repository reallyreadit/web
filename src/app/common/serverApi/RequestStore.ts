// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import Request, { areEqual } from './Request';
import Exchange from './Exchange';

export default class RequestStore {
	private readonly _exchanges: Exchange[];
	constructor(exchanges: Exchange[] = []) {
		this._exchanges = exchanges;
	}
	public getExchange(request: Request) {
		return this.exchanges.find((exchange) =>
			areEqual(exchange.request, request)
		);
	}
	public addRequest(request: Request) {
		if (!this.getExchange(request)) {
			this.exchanges.push({
				request,
				processed: false,
			});
		}
	}
	public get exchanges() {
		return this._exchanges;
	}
}
