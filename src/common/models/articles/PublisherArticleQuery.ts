import ArticleQuery from './ArticleQuery';

export default interface PublisherArticleQuery extends ArticleQuery {
	pageSize: number,
	slug: string
}