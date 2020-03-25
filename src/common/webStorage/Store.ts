export type StorageType = 'localStorage' | 'sessionStorage';

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type: StorageType = 'localStorage') {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return e instanceof DOMException && (
			// everything except Firefox
			e.code === 22 ||
			// Firefox
			e.code === 1014 ||
			// test name field too, because code might not be present
			// everything except Firefox
			e.name === 'QuotaExceededError' ||
			// Firefox
			e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage.length !== 0;
	}
}

export default abstract class Store<T> {
	private readonly _storage: {
		read: () => T,
		write: (value: T) => void
	};
	private readonly _onStorage: (e: StorageEvent) => void;
	private readonly _eventListeners: ((oldValue: T, newValue: T) => void)[] = [];
	private readonly _defaultValue: T;
	constructor(key: string, defaultValue: T, storageType: StorageType = 'localStorage') {
		// set default value
		this._defaultValue = defaultValue;
		// check if storage is available
		if (storageAvailable(storageType)) {
			// use storage
			let storage: Storage;
			switch (storageType) {
				case 'localStorage':
					storage = localStorage;
					break;
				case 'sessionStorage':
					storage = sessionStorage;
					break;
			}
			this._storage = {
				read: () => JSON.parse(storage.getItem(key)) as T,
				write: (value: T) => {
					storage.setItem(key, JSON.stringify(value));
				}
			};
			this._onStorage = (e: StorageEvent) => {
				if (e.key === key) {
					this._eventListeners.forEach(listener => {
						listener(
							JSON.parse(e.oldValue) as T,
							JSON.parse(e.newValue) as T
						);
					});
				}
			};
			// clear the storage in case it's uninitialized/corrupted
			// JSON.parse can throw an exception
			try {
				this._read();
			} catch (ex) {
				this.clear();
			}
		} else {
			// fall back to memory store
			let storedValue: T;
			this._storage = {
				read: () => storedValue,
				write: (value: T) => {
					storedValue = value;
				}
			};
		}
	}
	protected _read() {
		return this._storage.read();
	}
	protected _write(value: T) {
		this._storage.write(value);
	}
	public clear() {
		this._write(this._defaultValue);
	};
	public addEventListener(listener: (oldValue: T, newValue: T) => void) {
		if (this._eventListeners.length === 0) {
			window.addEventListener('storage', this._onStorage);
		}
		this._eventListeners.push(listener);
	}
	public removeEventListener(listener: (oldValue: T, newValue: T) => void) {
		this._eventListeners.splice(
			this._eventListeners.findIndex(thisListener => thisListener === listener),
			1
		);
		if (this._eventListeners.length === 0) {
			window.removeEventListener('storage', this._onStorage);
		}
	}
}