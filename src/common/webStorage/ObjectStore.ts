// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import Store, { StorageType } from './Store';

export default class<T> extends Store<T> {
	constructor(
		name: string,
		defaultValue: T,
		storageType: StorageType = 'localStorage'
	) {
		super(name, defaultValue, storageType);
	}
	public get() {
		return this._read();
	}
	public set(value: T) {
		this._write(value);
	}
}
