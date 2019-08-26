import BrowserApi from '../common/BrowserApi';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import Post from '../../common/models/social/Post';

export default class extends BrowserApi {
	private _title: string;
	public setTitle(title: string) {
		this._title = title;
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		throw new Error('Operation not supported in server environment');
	}
	public articlePosted(post: Post) {
		throw new Error('Operation not supported in server environment');
	}
	public commentPosted(comment: CommentThread) {
		throw new Error('Operation not supported in server environment');
	}
	public getTitle() {
		return this._title;
	}
	public updateAvailable(version: SemanticVersion) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedIn(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedOut() {
		throw new Error('Operation not supported in server environment');
	}
	public userUpdated(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}