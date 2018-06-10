import Store from './Store';

export default class <T> extends Store<T> {
	constructor(name: string, defaultValue: T) {
		super(name, defaultValue);
	}
	public get() {
		return this._read();
	}
	public set(value: T) {
		this._write(value);
	}
}