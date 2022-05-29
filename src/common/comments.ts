// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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