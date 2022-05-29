// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export default class AuthServiceBrowserPopup {
	private _popup: Window | null;
	public load(url: string) {
		if (!this._popup) {
			return Promise.reject(
				new Error('Popup has not been opened.')
			);
		}
		this._popup.location.href = url;
		return new Promise(
			(resolve, reject) => {
				const onClosePollingInterval = window.setInterval(
					() => {
						if (!this._popup.closed) {
							return;
						}
						window.clearInterval(onClosePollingInterval);
						resolve();
					},
					1000
				);
			}
		);
	}
	public open() {
		if (this._popup) {
			return;
		}
		this._popup = window.open(
			'',
			'_blank',
			'height=300,location=0,menubar=0,toolbar=0,width=400'
		);
	}
}