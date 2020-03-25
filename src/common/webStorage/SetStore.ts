import Store, { StorageType } from './Store';

export default class SetStore<K, V> extends Store<V[]> {
	private _getKey: (item: V) => K;
	constructor(key: string, getKey: (item: V) => K, storageType: StorageType = 'localStorage') {
		super(key, [], storageType);
		this._getKey = getKey;
	}
	private _getItemByKey(key: K, items: V[]) {
		return items.filter(item => this._getKey(item) === key)[0];
	}
	private _removeItem(item: V, items: V[]) {
		items.splice(items.indexOf(item), 1);
	}
	public get(key: K) {
		return this._getItemByKey(key, this._read());
	}
	public getAll() {
		return this._read();
	}
	public set(item: V) {
		const items = this._read();
		const existingItem = this._getItemByKey(this._getKey(item), items);
		if (existingItem) {
			this._removeItem(existingItem, items);
		}
		items.push(item);
		this._write(items);
		return item;
	}
	public remove(key: K) {
		const items = this._read();
		const item = this._getItemByKey(key, items);
		if (item) {
			this._removeItem(item, items);
			this._write(items);
		}
		return item;
	}
}