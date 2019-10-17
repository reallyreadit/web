import EventEmitter from './EventEmitter';
import ShareData from '../../common/sharing/ShareData';
import SemanticVersion from '../../common/SemanticVersion';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import DeviceInfo from '../../common/models/app/DeviceInfo';

export type ArticleReference = { slug: string } | { url: string }
export default abstract class extends EventEmitter<{
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'commentPosted': CommentThread
}> {
	public abstract readArticle(reference: ArticleReference): void;
	public abstract share(data: ShareData): void;
	public abstract syncAuthCookie(): void;
	public abstract get appVersion(): SemanticVersion;
	public abstract get deviceInfo(): DeviceInfo;
}