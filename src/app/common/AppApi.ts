import UserArticle from '../../common/models/UserArticle';
import EventEmitter from './EventEmitter';

export interface ArticleUpdatedEvent {
	article: UserArticle,
	isCompletionCommit: boolean
}
export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent
}> {
	public abstract readArticle(article: UserArticle): void;
}