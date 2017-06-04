export default abstract class Store<T> {
	private _name: string;
	private _storage: Storage;
	constructor(name: string, type: 'local' | 'session') {
		this._name = name;
		switch (type) {
			case 'local':
				this._storage = localStorage;
				break;
			case 'session':
				this._storage = sessionStorage;
				break;
		}
		// clear the storage in case it's uninitialized/corrupted
		// JSON.parse can throw an exception
		try {
			if (!this._read()) {
				this.clear();
			}
		} catch (ex) {
			this.clear();
		}
	}
	protected _read() {
		return JSON.parse(this._storage.getItem(this._name)) as T;
	}
	protected _write(value: T) {
		this._storage.setItem(this._name, JSON.stringify(value));
	}
	public abstract clear(): void;
}