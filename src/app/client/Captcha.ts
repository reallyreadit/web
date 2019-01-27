import Captcha from '../common/Captcha';
import ReCaptchaV3 from './ReCaptchaV3';

export default class extends Captcha {
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