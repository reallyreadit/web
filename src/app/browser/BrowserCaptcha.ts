import Captcha from '../common/Captcha';

export default class extends Captcha {
	private readonly _verifyCaptcha: boolean;
	private _captcha: ReCaptchaV2.ReCaptcha | null = null;
	private readonly _resolvers: ((captcha: this) => void)[] = [];
	constructor(verifyCaptcha: boolean, registerOnLoadHandler: (handler: (captcha: ReCaptchaV2.ReCaptcha) => void) => void) {
		super();
		this._verifyCaptcha = verifyCaptcha;
		if (verifyCaptcha) {
			registerOnLoadHandler(captcha => {
				this._captcha = captcha;
				while (this._resolvers.length) {
					this._resolvers.splice(0, 1)[0](this);
				}
			});
		}
	}
	public getResponse(id: number) {
		if (this._captcha) {
			return this._captcha.getResponse(id);
		}
		return '';
	}
	public onReady() {
		if (this._captcha || !this._verifyCaptcha) {
			return Promise.resolve(this);
		}
		return new Promise<this>((resolve, reject) => {
			this._resolvers.push(resolve);
		});
	}
	public render(container: HTMLElement, siteKey: string) {
		if (this._captcha) {
			return this._captcha.render(container, { sitekey: siteKey });
		}
		return 0;
	}
	public reset(id: number) {
		if (this._captcha) {
			this._captcha.reset(id);
		}
	}
}