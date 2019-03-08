import UserArticle from '../../common/models/UserArticle';
import EventEmitter from './EventEmitter';
import ShareData from '../../common/sharing/ShareData';
import SemanticVersion from '../../common/SemanticVersion';

export interface ArticleUpdatedEvent {
	article: UserArticle,
	isCompletionCommit: boolean
}
export type ArticleReference = { slug: string } | { url: string }
export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent
}> {
	public abstract readArticle(reference: ArticleReference): void;
	public abstract share(data: ShareData): void;
	public abstract get appVersion(): SemanticVersion | null;
}