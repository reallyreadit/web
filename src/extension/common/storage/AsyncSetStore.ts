// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import AsyncStore, { ChromeStorageArea } from './AsyncStore';

/**
 * Stores a set of values, backed by either web localStorage or sessionStorage.
 * Usage: `const store = await new SetStore<K,V>().initialized
 */
export default class AsyncSetStore<K, V> extends AsyncStore<V[]> {
	private _getKey: (item: V) => K;

	constructor(
		key: string,
		getKey: (item: V) => K,
		storageType: ChromeStorageArea = 'local'
	) {
		super(key, [], storageType);
		this._getKey = getKey;
	}
	private _getItemByKey(key: K, items: V[]) {
		return items.filter((item) => this._getKey(item) === key)[0];
	}

	private _removeItem(item: V, items: V[]) {
		items.splice(items.indexOf(item), 1);
	}

	public async get(key: K) {
		return this._getItemByKey(key, await this._read());
	}
	public async getAll() {
		return await this._read();
	}
	public async set(item: V) {
		const items = await this._read();
		const existingItem = this._getItemByKey(this._getKey(item), items);
		if (existingItem) {
			this._removeItem(existingItem, items);
		}
		items.push(item);
		await this._write(items);
		return item;
	}
	public async remove(key: K) {
		const items = await this._read();
		const item = this._getItemByKey(key, items);
		if (item) {
			this._removeItem(item, items);
			await this._write(items);
		}
		return item;
	}
}
