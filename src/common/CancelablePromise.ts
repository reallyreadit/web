export default class CancelablePromise<T> {
	private isCancelled = false;
	public readonly promise: Promise<T>;
	constructor(promise: Promise<T>) {
		this.promise = new Promise(
			(resolve, reject) => promise
				.then(value => this.isCancelled ? reject({ isCancelled: true }) : resolve(value))
				.catch(reason => this.isCancelled ? reject({ isCancelled: true }) : reject(reason))
		);
	}
	public cancel() {
		this.isCancelled = true;
	}
}