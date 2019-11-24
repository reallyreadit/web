import CommentThread from './models/CommentThread';

function findArrayContainingComment(id: string, threads: CommentThread[]): CommentThread[] | null {
	if (threads.some(thread => thread.id === id)) {
		return threads;
	}
	for (const child of threads) {
		const match = findArrayContainingComment(id, child.children);
		if (match) {
			return match;
		}
	}
	return null;
}
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
export function updateComment(updatedComment: CommentThread, comments: CommentThread[]) {
	const container = findArrayContainingComment(updatedComment.id, comments);
	if (container) {
		const originalComment = container.find(comment => comment.id === updatedComment.id);
		container.splice(
			container.indexOf(originalComment),
			1,
			{
				...originalComment,
				...updatedComment,
				children: updatedComment.children.length ?
					updatedComment.children :
					originalComment.children
			}
		);
	}
	return comments;
}