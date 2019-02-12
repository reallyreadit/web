import BrowserApi from '../common/BrowserApi';
import UserArticle from '../../common/models/UserArticle';
import UserAccount from '../../common/models/UserAccount';

export default class extends BrowserApi {
	private _title: string;
	public setTitle(title: string) {
		this._title = title;
	}
	public getTitle() {
		return this._title;
	}
	public setPath(path: string) {
		throw new Error('Operation not supported in server environment');
	}
	public updateArticle(article: UserArticle) {
		throw new Error('Operation not supported in server environment');
	}
	public updateAvailable(version: number) {
		throw new Error('Operation not supported in server environment');
	}
	public updateUser(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}