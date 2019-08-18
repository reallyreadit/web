import UserArticle from '../UserArticle';
import LeaderboardBadge from '../LeaderboardBadge';
import PostComment from './PostComment';

export default interface Post {
	date: string,
	userName: string,
	badge: LeaderboardBadge,
	article: UserArticle,
	comment: PostComment | null
}