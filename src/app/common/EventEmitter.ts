abstract class EventEmitter<T> {
	private listeners: { type: keyof T, delegate: (ev: any) => void }[] = [];
	private getListener<K extends keyof T>(type: K, delegate: (ev: T[K]) => void) {
		return this.listeners.filter(l => l.type === type && l.delegate === delegate)[0];
	}
	protected emitEvent<K extends keyof T>(type: K, ev: T[K]) {
		this.listeners
			.filter(l => l.type === type)
			.forEach(l => l.delegate(ev));
	}
	public addListener<K extends keyof T>(type: K, delegate: (ev: T[K]) => void) {
		if (this.getListener(type, delegate) === undefined) {
			this.listeners.push({ type, delegate });
		}
		return this;
	}
	public removeListener<K extends keyof T>(type: K, delegate: (ev: T[K]) => void) {
		const listener = this.getListener(type, delegate);
		if (listener !== undefined) {
			this.listeners.splice(this.listeners.indexOf(listener), 1);
		}
		return this;
	}
}
export default EventEmitter;