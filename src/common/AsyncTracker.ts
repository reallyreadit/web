export interface CancellationToken {
	isCancelled: boolean,
	tag?: string
}
export default class AsyncTracker {
	private readonly _animationFrameHandles: number[] = [];
	private readonly _cancellationTokens: CancellationToken[] = [];
	private readonly _cancellationDelegates: Function[] = [];
	private readonly _intervalHandles: number[] = [];
	private readonly _timeoutHandles: number[] = [];
	private createCancellationToken(tag?: string) {
		const token = {
			isCancelled: false,
			tag
		};
		this._cancellationTokens.push(token);
		return token;
	}
	private removeCancellationToken(token: CancellationToken) {
		this._cancellationTokens.splice(this._cancellationTokens.indexOf(token, 1));
	}
	public addAnimationFrame(handle: number) {
		this._animationFrameHandles.push(handle);
		return handle;
	}
	/**
	 * Wraps a callback function so that it is tracked by this tracker, and cancelable (optionally via a tag).
	 * When the returned wrapping callback is invoked, the inner given callback will only be invoked if
	 * the wrapping callback is not in a cancelled state.
	 * @param callback
	 * @param tag an optional tag to identify this wrapping callback
	 * @returns a function with the same signature as the callback given
	 */
	public addCallback<T>(callback: (value: T) => void, tag?: string) {
		const token = this.createCancellationToken(tag);
		return (arg: T) => {
			this.removeCancellationToken(token);
			if (!token.isCancelled) {
				callback(arg);
			}
		};
	}
	/**
	 * Adds a delegate function that will be invoked when this tracker cancels its tracked operations.
	 * Useful in the case when the given callback is an "unsubscribe" action of an "observer" in the Observable/Observer pattern.
	 * @param callbacks Function(s) that will synchronously cancel an asynchronous operation when invoked
	 */
	public addCancellationDelegate(...callbacks: Function[]) {
		this._cancellationDelegates.splice(this._cancellationDelegates.length - 1, 0, ...callbacks);
	}
	public addInterval(handle: number) {
		this._intervalHandles.push(handle);
		return handle;
	}
	public addPromise<T>(promise: Promise<T>, tag?: string) {
		const token = this.createCancellationToken(tag);
		return new Promise<T>(
			(resolve, reject) => promise
				.then(value => {
					this.removeCancellationToken(token);
					if (token.isCancelled) {
						reject({ isCancelled: true });
					} else {
						resolve(value);
					}
				})
				.catch(reason => {
					this.removeCancellationToken(token);
					if (token.isCancelled) {
						reject({ isCancelled: true });
					} else {
						reject(reason);
					}
				})
		);
	}
	public addTimeout(handle: number) {
		this._timeoutHandles.push(handle);
		return handle;
	}
	public cancelAll(tag?: string) {
		if (tag) {
			this._cancellationTokens.forEach(
				token => {
					if (token.tag === tag) {
						token.isCancelled = true;
					};
				}
			);
			return;
		}
		while (this._animationFrameHandles.length) {
			window.cancelAnimationFrame(this._animationFrameHandles.splice(0, 1)[0]);
		}
		while (this._cancellationDelegates.length) {
			this._cancellationDelegates.splice(0, 1)[0]();
		}
		this._cancellationTokens.forEach(token => {
			token.isCancelled = true;
		});
		while (this._intervalHandles.length) {
			window.clearInterval(this._intervalHandles.splice(0, 1)[0]);
		}
		while (this._timeoutHandles.length) {
			window.clearTimeout(this._timeoutHandles.splice(0, 1)[0]);
		}
	}
	public removeCancellationDelegate(delegate: Function) {
		const index = this._cancellationDelegates.findIndex(
			existingDelegate => existingDelegate === delegate
		);
		if (index > -1) {
			this._cancellationDelegates.splice(index, 1);
		}
	}
}