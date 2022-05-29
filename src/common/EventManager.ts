// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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