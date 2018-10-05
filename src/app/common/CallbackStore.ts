export default class {
	private readonly _callbacks: {
		callback: Function,
		isCancelled: boolean
	}[] = [];
	public add<Arg0>(callback: (arg0: Arg0) => void) {
		const cancelableCallback = {
			callback: (arg0: Arg0) => {
				if (!cancelableCallback.isCancelled) {
					callback(arg0);
				}
				this._callbacks.splice(this._callbacks.indexOf(cancelableCallback, 1));
			},
			isCancelled: false
		};
		this._callbacks.push(cancelableCallback);
		return cancelableCallback.callback;
	}
	public cancel() {
		this._callbacks.forEach(callback => {
			callback.isCancelled = true;
		});
	}
}