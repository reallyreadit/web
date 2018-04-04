import UserArticle from '../../common/models/UserArticle';

export default abstract class {
	public abstract readArticle(article: UserArticle): void;
}