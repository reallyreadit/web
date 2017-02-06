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
		if (!this.readItems()) {
			this.clear();
		}
	}
	private readItems() {
		return JSON.parse(this._storage.getItem(this._name)) as V[];
	}
	private writeItems(items: V[]) {
		this._storage.setItem(this._name, JSON.stringify(items));
	}
	private getItemByKey(key: K, items: V[]) {
		return items.filter(item => this._getKey(item) === key)[0];
	}
	public get(key: K) {
		return this.getItemByKey(key, this.readItems());
	}
	public getAll() {
		return this.readItems();
	}
	public set(item: V) {
		const items = this.readItems();
		const existingItem = this.getItemByKey(this._getKey(item), items);
		if (existingItem) {
			items.splice(items.indexOf(existingItem), 1);
		}
		items.push(item);
		this.writeItems(items);
		return item;
	}
	public remove(key: K) {
		const items = this.readItems();
		const item = this.getItemByKey(key, items);
		if (item) {
			items.splice(items.indexOf(item), 1);
			this.writeItems(items);
		}
		return item;
	}
	public clear() {
		this.writeItems([]);
	}
}