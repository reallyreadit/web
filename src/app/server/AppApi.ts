import AppApi, { ArticleReference } from '../common/AppApi';
import ShareData from '../../common/sharing/ShareData';
import SemanticVersion from '../../common/SemanticVersion';
import DeviceInfo from '../../common/models/app/DeviceInfo';

export default class extends AppApi {
	public readArticle(reference: ArticleReference) {
		throw new Error('Operation not supported in server environment');
	}
	public share(data: ShareData) {
		throw new Error('Operation not supported in server environment');
	}
	public syncAuthCookie() {
		throw new Error('Operation not supported in server environment');
	}
	public get appVersion() {
		return null as SemanticVersion;
	}
	public get deviceInfo() {
		return null as DeviceInfo;
	}
}