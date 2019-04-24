import EventEmitter from './EventEmitter';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';

export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent,
	'commentPosted': CommentThread,
	'updateAvailable': SemanticVersion,
	'userSignedIn': UserAccount,
	'userSignedOut': void,
	'userUpdated': UserAccount
}> {
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract setTitle(title: string): void;
	public abstract updateAvailable(version: SemanticVersion): void;
	public abstract userSignedIn(user: UserAccount): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
}