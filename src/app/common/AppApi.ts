import UserArticle from '../../common/models/UserArticle';
import EventEmitter from './EventEmitter';

export default abstract class extends EventEmitter<{
	'articleUpdated': { article: UserArticle, isCompletionCommit: boolean }
}> {
	public abstract readArticle(article: UserArticle): void;
}