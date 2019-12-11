import AnalyticsBase, { PageviewParams } from '../common/Analytics';

export default class Analytics extends AnalyticsBase {
	public sendSignUp() {
		throw new Error('Operation not supported in server environment');
	}
	public sendPageview(params: PageviewParams) {
		throw new Error('Operation not supported in server environment');
	}
	public setUserId(id: number | null) {
		throw new Error('Operation not supported in server environment');
	}
}