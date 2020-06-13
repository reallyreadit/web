import ArticleQuery from './ArticleQuery';

export default interface AuthorArticleQuery extends ArticleQuery {
	pageSize: number,
	slug: string
}