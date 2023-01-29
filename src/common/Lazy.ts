// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

type Initializer<T> = () => T;
export default class Lazy<T> {
	private readonly _initializer: Initializer<T>;
	private _isInitialized = false;
	private _value: T | undefined;
	constructor(initializer: Initializer<T>) {
		this._initializer = initializer;
	}
	public get value() {
		if (!this._isInitialized) {
			this._value = this._initializer();
			this._isInitialized = true;
		}
		return this._value;
	}
}
