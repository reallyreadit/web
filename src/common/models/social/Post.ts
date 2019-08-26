import UserArticle from '../UserArticle';
import LeaderboardBadge from '../LeaderboardBadge';
import PostComment from './PostComment';
import CommentThread from '../CommentThread';

export default interface Post {
	date: string,
	userName: string,
	badge: LeaderboardBadge,
	article: UserArticle,
	comment: PostComment | null
}
export function createCommentThread(post: Post): CommentThread {
	return {
		id: post.comment.id,
		dateCreated: post.date,
		text: post.comment.text,
		articleId: post.article.id,
		articleTitle: post.article.title,
		articleSlug: post.article.slug,
		userAccount: post.userName,
		badge: post.badge,
		children: [],
		parentCommentId: null
	};
}