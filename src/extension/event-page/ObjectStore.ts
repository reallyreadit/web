import Store from './Store';

export default class ObjectStore<T> extends Store<T> {
	private _defaultValue: T;
	constructor(name: string, type: 'local' | 'session', defaultValue: T) {
		super(name, type);
		this._defaultValue = defaultValue;
	}
	public get() {
		return this._read();
	}
	public set(value: T) {
		this._write(value);
	}
	public clear() {
		this._write(this._defaultValue);
	}
}