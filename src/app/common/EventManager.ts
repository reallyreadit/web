import KeyValuePair from '../../common/KeyValuePair';

export default class EventManager<T> {
	private readonly _listeners: KeyValuePair<keyof T, (event: any) => void>[] = [];
	public addListener<K extends keyof T>(key: K, delegate: (event: T[K]) => void) {
		const listener = {
			key,
			value: delegate
		};
		this._listeners.push(listener);
		return () => {
			this._listeners.splice(
				this._listeners.findIndex(item => item === listener),
				1
			);
		};
	}
	public triggerEvent<K extends keyof T>(key: K, event: T[K]) {
		this._listeners
			.filter(listener => listener.key === key)
			.forEach(listener => {
				listener.value(event);
			});
	}
}