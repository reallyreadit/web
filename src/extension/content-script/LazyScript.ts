export default class LazyScript<T> {
	private _isLoaded = false;
	private _isLoading = false;
	private readonly _load: () => void;
	private readonly _onLoadDelegates: (() => void)[] = [];
	private _value: T | null;
	constructor(load: () => void) {
		this._load = load;
	}
	public get() {
		if (this._isLoaded) {
			return Promise.resolve(this._value);
		} else {
			if (!this._isLoading) {
				this._load();
				this._isLoading = true;
			}
			return new Promise<T>(resolve => {
				this._onLoadDelegates.push(() => {
					resolve(this._value);
				});
			});
		}
	}
	public set(value: T) {
		this._value = value;
		this._isLoading = false;
		this._isLoaded = true;
		while (this._onLoadDelegates.length) {
			this._onLoadDelegates.splice(0, 1)[0]();
		}
	}
	public get isLoaded() {
		return this._isLoaded;
	}
}