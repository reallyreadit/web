// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

abstract class EventEmitter<T> {
	private listeners: { type: keyof T, delegate: (ev: any) => void }[] = [];
	private getListener<K extends keyof T>(type: K, delegate: (ev: T[K]) => void) {
		return this.listeners.filter(l => l.type === type && l.delegate === delegate)[0];
	}
	protected emitEvent<K extends keyof T>(type: K, ev?: T[K]) {
		this
			.listeners
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