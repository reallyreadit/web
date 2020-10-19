export interface CancellationToken {
	isCancelled: boolean
}
export default class AsyncTracker {
	private readonly _animationFrameHandles: number[] = [];
	private readonly _cancellationTokens: CancellationToken[] = [];
	private readonly _cancellationDelegates: Function[] = [];
	private readonly _intervalHandles: number[] = [];
	private readonly _timeoutHandles: number[] = [];
	private createCancellationToken() {
		const token = { isCancelled: false };
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
	public addCallback<T>(callback: (value: T) => void) {
		const token = this.createCancellationToken();
		return (arg: T) => {
			this.removeCancellationToken(token);
			if (!token.isCancelled) {
				callback(arg);
			}
		};
	}
	public addCancellationDelegate(...callbacks: Function[]) {
		this._cancellationDelegates.splice(this._cancellationDelegates.length - 1, 0, ...callbacks);
	}
	public addInterval(handle: number) {
		this._intervalHandles.push(handle);
		return handle;
	}
	public addPromise<T>(promise: Promise<T>) {
		const token = this.createCancellationToken();
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
	public cancelAll() {
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