import EventEmitter from './EventEmitter';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';

export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent,
	'change': boolean,
	'commentPosted': CommentThread
}> {
	protected readonly _extensionId: string;
	constructor(extensionId: string) {
		super();
		this._extensionId = extensionId;
	}
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract install(): void;
	public abstract newReplyNotificationUpdated(notification: NewReplyNotification): void;
	public abstract get isInstalled(): boolean | undefined;
	public abstract get isBrowserCompatible(): boolean | undefined;
}