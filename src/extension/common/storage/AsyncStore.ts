// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export type ChromeStorageArea = 'local' | 'managed' | 'session' | 'sync';

const promisify = (storage: chrome.storage.StorageArea) =>
	chrome.runtime.getManifest().manifest_version > 2
		? // MV3 supports Promises natively
		  {
				get: storage.get.bind(storage),
				set: storage.set.bind(storage),
				remove: storage.remove.bind(storage),
		  }
		: // MV2 must use callbacks: convert to Promises
		  {
				get: (keys?: string | string[] | { [key: string]: any }) =>
					new Promise((resolve, reject) =>
						storage.get(keys, (itemsObject) => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError);
							} else {
								resolve(itemsObject);
							}
						})
					),
				set: (items: { [key: string]: any }) =>
					new Promise<void>((resolve, reject) =>
						storage.set(items, () => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError);
							} else {
								resolve();
							}
						})
					),
				remove: (keys: string | string[]) =>
					new Promise<void>((resolve, reject) =>
						storage.remove(keys, () => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError);
							} else {
								resolve();
							}
						})
					),
		  };

// https://developer.chrome.com/docs/extensions/reference/storage/#property-local
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/lastError
async function checkStorage(type: ChromeStorageArea = 'local') {
	// Test whether storing something doesn't raise an exception.
	var storage = promisify(chrome.storage[type]),
		x = '__storage_test__';
	await storage.set({ [x]: x });
	await storage.remove(x);
	return true;
}

type ChromeStorageEvent = { [key: string]: chrome.storage.StorageChange };

/**
 * Stores a single value, backed by either web localStorage or sessionStorage.
 * Usage: `const store = await new AsyncStore<T>().initialized
 */
export default abstract class AsyncStore<T> {
	// Fallback memory
	private _fallbackMemoryValue: T;

	// Internal storage interface, starting with fallback memory accessors
	private _storage: {
		read: () => Promise<T>;
		write: (value: T) => Promise<void>;
	} = {
		read: async () => {
			if (!this._isInitialized)
				console.warn(
					'AsyncStore read happened before it was fully initialized.'
				);
			return this._fallbackMemoryValue;
		},
		write: async (value: T) => {
			if (!this._isInitialized)
				console.warn(
					'AsyncStore write happened before it was fully initialized.'
				);
			const oldValue = this._fallbackMemoryValue;
			this._fallbackMemoryValue = value;
			// Emalate a ChromeStorageEvent
			this._onStorageChanged(
				{ [this._key]: { oldValue, newValue: value } },
				'local'
			);
		},
	};
	private _isInitialized = false;
	private _key: string;
	private _storageType: ChromeStorageArea;
	private _onStorageChanged = (
		changes: ChromeStorageEvent,
		areaName: ChromeStorageArea
	) => {
		if (areaName !== this._storageType) {
			// Skip events that did not happen in the area of this AsyncStore.
			return;
		}
		const changeForKey = Object.entries(changes).find(([changedKey, _]) => {
			if (changedKey === this._key) {
				return true;
			}
			return false;
		});
		if (changeForKey) {
			const [, { oldValue, newValue }] = changeForKey;
			this._eventListeners.forEach((listener) =>
				listener(oldValue as T, newValue as T)
			);
		}
	};

	private _eventListeners: ((oldValue: T, newValue: T) => void)[] = [];
	private readonly _defaultValue: T;

	constructor(
		key: string,
		defaultValue: T,
		storageType: ChromeStorageArea = 'local'
	) {
		this._defaultValue = defaultValue;
		this._key = key;
		this._storageType = storageType;

		// Initialize the storage to its default value
		if (this._fallbackMemoryValue == null) {
			this._fallbackMemoryValue = this._defaultValue;
		}

		// Asynchronously upgrade to a chrome.storage store
		// This is an alternative for having to asynchronously initialize
		// the store by any consumer, but it might lead to some weird race conditions.
		// See the fallback store read/write warnings above.
		checkStorage(storageType)
			.then(async () => {
				// use storage
				let storage = promisify(chrome.storage[storageType]);

				// Overwrite internal storage accessors
				this._storage = {
					// PROXY EXT TODO: should we parse JSON here?
					read: async () => (await storage.get(key))[key] as T,
					write: async (value: T) => await storage.set({ [key]: value }),
				};

				const currentValue = await this._read();
				// Reset the value in case it's uninitialized
				if (currentValue == null) {
					await this.clear();
				}
				this._isInitialized = true;
			})
			.catch((e) => {
				console.warn("Can't load chrome.storage: ", e);
				this._isInitialized = true;
			});
	}

	/**
	 * Asynchronously wait for chrome.storage quality checking before initializing it.
	 * @deprecated
	 */
	public async initialized(): Promise<AsyncStore<T>> {
		const key = this._key;
		const storageType = this._storageType;
		// check if storage is available
		if (await checkStorage(storageType)) {
			// use storage
			let storage = promisify(chrome.storage[storageType]);

			this._storage = {
				// PROXY EXT TODO: should we parse JSON here?
				read: async () => (await storage.get(key))[key] as T,
				write: async (value: T) => await storage.set({ [key]: value }),
			};

			// reset the storage in case it's uninitialized/corrupted
			// JSON.parse can throw an exception
			try {
				if ((await this._read()) == null) {
					await this.clear();
				}
			} catch (ex) {
				await this.clear();
			}
		} else {
			// leave memory store in place
		}
		return this;
	}

	protected async _read() {
		return await this._storage.read();
	}
	protected async _write(value: T) {
		await this._storage.write(value);
	}
	public async clear() {
		await this._write(this._defaultValue);
	}

	public addEventListener(listener: (oldValue: T, newValue: T) => void) {
		if (this._eventListeners.length === 0) {
			chrome.storage.onChanged.addListener(this._onStorageChanged);
		}
		this._eventListeners.push(listener);
	}
	public removeEventListener(listener: (oldValue: T, newValue: T) => void) {
		this._eventListeners.splice(
			this._eventListeners.findIndex(
				(thisListener) => thisListener === listener
			),
			1
		);
		if (this._eventListeners.length === 0) {
			chrome.storage.onChanged.removeListener(this._onStorageChanged);
		}
	}
}
