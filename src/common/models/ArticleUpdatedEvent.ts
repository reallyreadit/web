import UserArticle from './UserArticle';

export default interface ArticleUpdatedEvent {
	article: UserArticle,
	isCompletionCommit: boolean
}