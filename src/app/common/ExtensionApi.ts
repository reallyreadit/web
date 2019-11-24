import EventEmitter from './EventEmitter';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';

export default abstract class extends EventEmitter<{
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'change': boolean,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'userUpdated': UserAccount
}> {
	protected readonly _extensionId: string;
	constructor(extensionId: string) {
		super();
		this._extensionId = extensionId;
	}
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract install(): void;
	public abstract userUpdated(user: UserAccount): void;
	public abstract get isInstalled(): boolean | undefined;
	public abstract get isBrowserCompatible(): boolean | undefined;
}