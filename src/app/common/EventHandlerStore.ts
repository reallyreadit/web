export default class {
	private readonly _unregisterCallbacks: Function[] = [];
	public add(...callbacks: Function[]) {
		this._unregisterCallbacks.splice(this._unregisterCallbacks.length - 1, 0, ...callbacks);
	}
	public unregister() {
		this._unregisterCallbacks.forEach(callback => {
			callback();
		});
	}
}