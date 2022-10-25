/**
 * Provides an Promise interface around loading an external script.
 *
 * Used by code that asks the event page to load the content parser into the
 * reader content script. When loaded, the content script then announces its
 * own presence via set(); which will pass the scrip to the Promise consumers
 * that called get().
 */
export default class LazyScript<T> {
	private _isLoaded = false;
	private _isLoading = false;
	private readonly _load: () => void;
	private readonly _onLoadDelegates: (() => void)[] = [];
	private _value: T | null;
	constructor(load: () => void) {
		this._load = load;
	}
	/**
	 * Get a Promise of the loaded script.
	 */
	public get() {
		if (this._isLoaded) {
			return Promise.resolve(this._value);
		} else {
			if (!this._isLoading) {
				this._load();
				this._isLoading = true;
			}
			return new Promise<T>(resolve => {
				// Pass the promise resolver to _onloadDelegates in the closure,
				// don't call it yet (wrap) in another function.
				this._onLoadDelegates.push(() => {
					resolve(this._value);
				});
			});
		}
	}
	/**
	 * Set the loaded script.
	 */
	public set(value: T) {
		this._value = value;
		this._isLoading = false;
		this._isLoaded = true;
		while (this._onLoadDelegates.length) {
			// Resolve the script loading promise
			this._onLoadDelegates.splice(0, 1)[0]();
		}
	}
	public get isLoaded() {
		return this._isLoaded;
	}
}