export default class CancelablePromise<T = void> {
	private _isCancelled = false;
	public readonly _promise: Promise<T>;
	constructor(promise: Promise<T>) {
		this._promise = new Promise(
			(resolve, reject) => promise
				.then(value => this._isCancelled ? reject({ isCancelled: true }) : resolve(value))
				.catch(reason => this._isCancelled ? reject({ isCancelled: true }) : reject(reason))
		);
	}
	public cancel() {
		this._isCancelled = true;
	}
}