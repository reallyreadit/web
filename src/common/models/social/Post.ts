import UserArticle from '../UserArticle';
import CommentThread from '../CommentThread';
import LeaderboardBadge from '../LeaderboardBadge';

export default interface Post {
	date: string,
	userName: string,
	badge: LeaderboardBadge,
	article: UserArticle,
	comment: CommentThread | null
}