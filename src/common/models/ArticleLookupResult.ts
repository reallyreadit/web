import UserArticle from './UserArticle';
import UserPage from './UserPage';

export default interface ArticleLookupResult {
	userArticle: UserArticle,
	userPage: UserPage
}