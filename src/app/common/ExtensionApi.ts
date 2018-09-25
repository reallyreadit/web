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
	public abstract isInstalled(): boolean;
	public abstract isBrowserCompatible(): boolean;
	public abstract updateNewReplyNotification(notification: NewReplyNotification): void;
}