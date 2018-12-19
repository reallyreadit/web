import UserArticle from './UserArticle';
import PageResult from './PageResult';
import UserStats from './UserStats';

export default interface CommunityReads {
	aotd: UserArticle,
	articles: PageResult<UserArticle>,
	userStats?: UserStats
}