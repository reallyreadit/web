// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import CaptchaBase from './CaptchaBase';
import ReCaptchaV3 from './ReCaptchaV3';

export default class Captcha extends CaptchaBase {
	private _captcha: ReCaptchaV3 | null = null;
	private readonly _queue: ((captcha: ReCaptchaV3) => void)[] = [];
	private readonly _siteKey: string | null;
	constructor(siteKey: string | null, registerOnLoadHandler: (handler: (captcha: ReCaptchaV3) => void) => void) {
		super();
		this._siteKey = siteKey;
		if (siteKey) {
			registerOnLoadHandler(captcha => {
				this._captcha = captcha;
				while (this._queue.length) {
					this._queue.splice(0, 1)[0](captcha);
				}
			});
		}
	}
	public execute(action: string) {
		if (this._siteKey) {
			if (this._captcha) {
				return new Promise<string>(resolve => {
					this._captcha
						.execute(this._siteKey, { action })
						.then(response => {
							resolve(response);
						});
				});
			}
			return new Promise<string>(resolve => {
				this._queue.push(captcha => {
					captcha
						.execute(this._siteKey, { action })
						.then(response => {
							resolve(response);
						});
				});
			});
		}
		return Promise.resolve('');
	}
	public hideBadge() {
		window.document.body.classList.remove('show-captcha');
		window.document.body.classList.add('hide-captcha');
	}
	public showBadge() {
		window.document.body.classList.remove('hide-captcha');
		window.document.body.classList.add('show-captcha');
	}
}