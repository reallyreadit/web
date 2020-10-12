import KeyValuePair from './KeyValuePair';

export default class EventManager<T> {
	private _listeners: KeyValuePair<keyof T, (event: any) => void>[] = [];
	public addListener<K extends keyof T>(key: K, delegate: (event: T[K]) => void) {
		const listener = {
			key,
			value: delegate
		};
		this._listeners.push(listener);
		return () => {
			const listenerIndex = this._listeners.findIndex(
				item => item === listener
			);
			if (listenerIndex > -1) {
				this._listeners.splice(listenerIndex, 1);
			}
		};
	}
	public removeListeners(key: keyof T) {
		this._listeners = this._listeners.filter(
			listener => listener.key !== key
		);
	}
	public triggerEvent<K extends keyof T>(key: K, event: T[K]) {
		this._listeners
			.filter(
				listener => listener.key === key
			)
			.forEach(
				listener => {
					listener.value(event);
				}
			);
	}
}