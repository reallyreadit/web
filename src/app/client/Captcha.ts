import Captcha from '../common/Captcha';

interface ReCaptchaV3 {
	execute: (siteKey: string, options: { action: string }) => Promise<string>
}
export default class extends Captcha {
	private readonly _verifyCaptcha: boolean;
	private _captcha: ReCaptchaV3 | null = null;
	private readonly _resolvers: ((captcha: this) => void)[] = [];
	constructor(verifyCaptcha: boolean, registerOnLoadHandler: (handler: (captcha: ReCaptchaV3) => void) => void) {
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
	public execute(action: string) {
		if (this._captcha) {
			return this._captcha.execute('6Lejf38UAAAAALcvA6u_JvImVdjfqS2TF71IstNl', { action });
		}
		return Promise.resolve('');
	}
	public onReady() {
		if (this._captcha || !this._verifyCaptcha) {
			return Promise.resolve(this);
		}
		return new Promise<this>((resolve, reject) => {
			this._resolvers.push(resolve);
		});
	}
}