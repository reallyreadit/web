export default class ObjectStore<K, V> {
	private _name: string;
	private _getKey: (item: V) => K;
	private _storage: Storage;
	constructor(name: string, type: 'local' | 'session', getKey: (item: V) => K) {
		// set up our fields
		this._name = name;
		switch (type) {
			case 'local':
				this._storage = localStorage;
				break;
			case 'session':
				this._storage = sessionStorage;
				break;
		}
		this._getKey = getKey;
		// clear the storage in case it's uninitialized/corrupted
		// JSON.parse can throw an exception
		try {
			if (!this._readItems()) {
				this.clear();
			}
		} catch (ex) {
			this.clear();
		}
	}
	private _readItems() {
		return JSON.parse(this._storage.getItem(this._name)) as V[];
	}
	private _writeItems(items: V[]) {
		this._storage.setItem(this._name, JSON.stringify(items));
	}
	private _getItemByKey(key: K, items: V[]) {
		return items.filter(item => this._getKey(item) === key)[0];
	}
	private _removeItem(item: V, items: V[]) {
		items.splice(items.indexOf(item), 1);
	}
	public get(key: K) {
		return this._getItemByKey(key, this._readItems());
	}
	public getAll() {
		return this._readItems();
	}
	public set(item: V) {
		const items = this._readItems();
		const existingItem = this._getItemByKey(this._getKey(item), items);
		if (existingItem) {
			this._removeItem(existingItem, items);
		}
		items.push(item);
		this._writeItems(items);
		return item;
	}
	public remove(key: K) {
		const items = this._readItems();
		const item = this._getItemByKey(key, items);
		if (item) {
			this._removeItem(item, items);
			this._writeItems(items);
		}
		return item;
	}
	public clear() {
		this._writeItems([]);
	}
}