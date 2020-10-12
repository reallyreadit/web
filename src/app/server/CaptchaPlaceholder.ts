import CaptchaBase from '../../common/captcha/CaptchaBase';

export default class CaptchaPlaceholder extends CaptchaBase {
	public execute(action: string): Promise<string> {
		throw new Error('Operation not supported in server environment');
	}
	public hideBadge(): void {
		throw new Error('Operation not supported in server environment');
	}
	public showBadge(): void {
		throw new Error('Operation not supported in server environment');
	}
}