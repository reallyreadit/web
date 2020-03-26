import Store, { StorageType } from './Store';

export default class <T> extends Store<T> {
	constructor(name: string, defaultValue: T, storageType: StorageType = 'localStorage') {
		super(name, defaultValue, storageType);
	}
	public get() {
		return this._read();
	}
	public set(value: T) {
		this._write(value);
	}
}