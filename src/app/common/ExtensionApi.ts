import EventEmitter from './EventEmitter';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';

export interface Params {
	legacyChromeExtensionId: string,
	isInstalled: boolean
}
export default abstract class ExtensionApi extends EventEmitter<{
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'change': boolean,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'userUpdated': UserAccount
}> {
	protected readonly _legacyChromeExtensionId: string;
	protected _isInstalled: boolean;
	constructor(params: Params) {
		super();
		this._legacyChromeExtensionId = params.legacyChromeExtensionId;
		this._isInstalled = params.isInstalled;
	}
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract extensionUninstalled(): void;
	public abstract userUpdated(user: UserAccount): void;
	public get isInstalled() {
		return this._isInstalled;
	}
}