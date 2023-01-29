// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { generateRandomString } from '../format';
import { BroadcastChannelMessageListener } from './BroadcastChannelInterface';

export default class StorageBroadcastChannel {
	private readonly _listeners: BroadcastChannelMessageListener[] = [];
	private readonly _name: string;
	private readonly _keyPrefix = '_broadcast';
	private readonly _keyRegex: RegExp;
	private readonly _keySeparator = '|';
	private readonly _timeToLive = 500;
	constructor(name: string) {
		this._name = name;
		this._keyRegex = new RegExp(
			[`^${this._keyPrefix}`, this._name, '(\\d+)', '[0-9a-z]+$'].join(
				'\\' + this._keySeparator
			)
		);
		window.addEventListener('storage', (event) => {
			const keyMatch = event.key.match(this._keyRegex);
			if (!keyMatch || event.newValue == null) {
				return;
			}
			try {
				const message = JSON.parse(event.newValue);
				this._listeners.forEach((listener) => {
					listener({
						data: message,
					});
				});
			} catch (error) {
				console.error(error);
			}
		});
		this.cleanupExpiredItems();
	}
	private cleanupExpiredItems() {
		const now = Date.now();
		Object.keys(localStorage)
			.map((key) => key.match(this._keyRegex))
			.filter((match) => {
				if (match?.length !== 2) {
					return false;
				}
				return now - parseInt(match[1]) > this._timeToLive;
			})
			.forEach((expiredMatch) => {
				localStorage.removeItem(expiredMatch[0]);
			});
	}
	private generateKey() {
		return [
			this._keyPrefix,
			this._name,
			Date.now().toString(),
			generateRandomString(4),
		].join(this._keySeparator);
	}
	public addEventListener(
		type: 'message',
		listener: BroadcastChannelMessageListener
	) {
		this._listeners.push(listener);
	}
	public postMessage(message: any) {
		const key = this.generateKey();
		localStorage.setItem(key, JSON.stringify(message));
		window.setTimeout(() => {
			localStorage.removeItem(key);
		}, this._timeToLive);
	}
}
