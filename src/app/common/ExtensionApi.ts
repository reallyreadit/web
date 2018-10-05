import EventEmitter from './EventEmitter';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import UserArticle from '../../common/models/UserArticle';

export default abstract class extends EventEmitter<{
	'articleUpdated': { article: UserArticle, isCompletionCommit: boolean },
	'change': boolean
}> {
	protected readonly _extensionId: string;
	constructor(extensionId: string) {
		super();
		this._extensionId = extensionId;
	}
	public abstract install(): void;
	public abstract updateNewReplyNotification(notification: NewReplyNotification): void;
	public abstract get isInstalled(): boolean | undefined;
	public abstract get isBrowserCompatible(): boolean | undefined;
}