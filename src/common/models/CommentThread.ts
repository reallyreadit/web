import LeaderboardBadge from './LeaderboardBadge';
import CommentAddendum from './social/CommentAddendum';

export default interface CommentThread {
	id: string,
	dateCreated: string,
	text: string,
	addenda: CommentAddendum[],
	articleId: number,
	articleTitle: string,
	articleSlug: string,
	userAccount: string,
	badge: LeaderboardBadge,
	parentCommentId: string | null,
	dateDeleted: string | null,
	children: CommentThread[]
}