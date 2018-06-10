import Captcha from '../common/Captcha';

export default class extends Captcha {
	public getResponse(id: number): string {
		throw new Error('Operation not supported in server environment');
	}
	public onReady(): Promise<this> {
		throw new Error('Operation not supported in server environment');
	}
	public render(container: HTMLElement, siteKey: string): number {
		throw new Error('Operation not supported in server environment');
	}
	public reset(id: number) {
		throw new Error('Operation not supported in server environment');
	}
}