import AppApi, { ArticleReference } from '../common/AppApi';
import ShareData from '../../common/sharing/ShareData';
import SemanticVersion from '../../common/SemanticVersion';
import DeviceInfo from '../../common/models/app/DeviceInfo';
import UserAccount from '../../common/models/UserAccount';

export default class extends AppApi {
	public openExternalUrl(url: string) {
		throw new Error('Operation not supported in server environment');
	}
	public readArticle(reference: ArticleReference) {
		throw new Error('Operation not supported in server environment');
	}
	public share(data: ShareData) {
		throw new Error('Operation not supported in server environment');
	}
	public syncAuthCookie(user?: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
	public get appVersion() {
		return null as SemanticVersion;
	}
	public get deviceInfo() {
		return null as DeviceInfo;
	}
}