import Captcha from '../common/Captcha';

export default class extends Captcha {
	public execute(action: string): Promise<string> {
		throw new Error('Operation not supported in server environment');
	}
	public onReady(): Promise<this> {
		throw new Error('Operation not supported in server environment');
	}
}