import UserArticle from './UserArticle';
import UserPage from './UserPage';
import UserAccount from './UserAccount';

export default interface ArticleLookupResult {
	userArticle: UserArticle,
	userPage: UserPage,
	user: UserAccount
}