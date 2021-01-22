type Initializer<T> = () => T;
export default class Lazy<T> {
	private readonly _initializer: Initializer<T>;
	private _isInitialized = false;
	private _value: T | undefined;
	constructor(initializer: Initializer<T>) {
		this._initializer = initializer;
	}
	public get value() {
		if (!this._isInitialized) {
			this._value = this._initializer();
			this._isInitialized = true;
		}
		return this._value;
	}
}