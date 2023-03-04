// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import UserArticle from '../UserArticle';
import LeaderboardBadge from '../LeaderboardBadge';
import PostComment from './PostComment';
import CommentThread from '../CommentThread';

export default interface Post {
	date: string;
	userName: string;
	badge: LeaderboardBadge;
	article: UserArticle;
	comment: PostComment | null;
	silentPostId: string | null;
	dateDeleted: string | null;
	hasAlert: boolean;
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
		children: [],
	};
}
