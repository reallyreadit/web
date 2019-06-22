import UserArticle from './UserArticle';
import PageResult from './PageResult';

export default interface CommunityReads {
	aotd: UserArticle,
	articles: PageResult<UserArticle>,
	userReadCount: number
}