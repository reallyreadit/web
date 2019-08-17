import LeaderboardBadge from './LeaderboardBadge';

export default interface CommentThread {
	id: string,
	dateCreated: string,
	text: string,
	articleId: number,
	articleTitle: string,
	articleSlug: string,
	userAccount: string,
	badge: LeaderboardBadge,
	children: CommentThread[],
	parentCommentId: string | null
}