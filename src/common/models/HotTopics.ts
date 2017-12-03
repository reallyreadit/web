import UserArticle from './UserArticle';
import PageResult from './PageResult';

export default interface HotTopics {
	aotd: UserArticle,
	articles: PageResult<UserArticle>
}