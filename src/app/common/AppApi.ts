import UserArticle from '../../common/models/UserArticle';
import EventEmitter from './EventEmitter';

export interface ArticleUpdatedEvent {
	article: UserArticle,
	isCompletionCommit: boolean
}
export type ArticleReference = { slug: string } | { url: string }
export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent
}> {
	public abstract readArticle(reference: ArticleReference): void;
}