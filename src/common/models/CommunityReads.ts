import UserArticle from './UserArticle';
import PageResult from './PageResult';

export default interface CommunityReads {
	aotd: UserArticle,
	aotdHasAlert: boolean,
	articles: PageResult<UserArticle>,
	userReadCount: number
}