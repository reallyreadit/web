import CommentThread from './models/CommentThread';

export function findComment(id: string, threads: CommentThread[]): CommentThread | null {
	for (const thread of threads) {
		if (thread.id === id) {
			return thread;
		}
		const match = findComment(id, thread.children);
		if (match) {
			return match;
		}
	}
	return null;
}
export function mergeComment(comment: CommentThread, comments: CommentThread[]) {
	if (comment.parentCommentId) {
		findComment(comment.parentCommentId, comments)
			.children
			.unshift(comment);
	} else {
		comments.unshift(comment);
	}
	return comments;
}