import UserArticle from '../UserArticle';
import LeaderboardBadge from '../LeaderboardBadge';
import PostComment from './PostComment';
import CommentThread from '../CommentThread';

export default interface Post {
	date: string,
	userName: string,
	badge: LeaderboardBadge,
	article: UserArticle,
	comment: PostComment | null,
	silentPostId: string | null,
	dateDeleted: string | null,
	hasAlert: boolean
}
export function createCommentThread(post: Post): CommentThread {
	return {
		id: (post.comment && post.comment.id) || '',
		dateCreated: post.date,
		text: (post.comment && post.comment.text) || '',
		addenda: (post.comment && post.comment.addenda) || [],
		articleId: post.article.id,
		articleTitle: post.article.title,
		articleSlug: post.article.slug,
		userAccount: post.userName,
		badge: post.badge,
		isAuthor: false,
		parentCommentId: null,
		dateDeleted: post.dateDeleted,
		children: []
	};
}