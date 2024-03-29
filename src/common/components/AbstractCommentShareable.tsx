// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { formatPossessive } from '../format';
import CommentThread from '../models/CommentThread';
import Post, { createCommentThread } from '../models/social/Post';
import UserAccount from '../models/UserAccount';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

type AbstractProps = {
	comment?: CommentThread;
	post?: Post;
	onCreateAbsoluteUrl: (path: string) => string;
	user: UserAccount | null;
};

/**
 * Superclass to share code for classes that can share a posted comment
 */
export default abstract class AbstractCommentShareable<
	Props extends AbstractProps,
	State = {}
> extends React.Component<Props, State> {
	private readonly _commentsScreenRoute = findRouteByKey(
		routes,
		ScreenKey.Comments
	);

	protected _hasComment = () => {
		return !!this.props.post.comment;
	};

	protected _getCommentThread = (): CommentThread | undefined => {
		if (this.props.post && this.props.post.comment) {
			return createCommentThread(this.props.post);
		} else if (this.props.comment) {
			return this.props.comment;
		}
		return undefined;
	};

	protected getCommentAbsoluteUrl() {
		const [sourceSlug, articleSlug] =
			this._getCommentThread().articleSlug.split('_');
		return this.props.onCreateAbsoluteUrl(
			this._commentsScreenRoute.createUrl({
				['articleSlug']: articleSlug,
				['commentId']: this._getCommentThread().id,
				['sourceSlug']: sourceSlug,
			})
		);
	}

	protected readonly _getShareData = () => {
		const articleTitle = this._getCommentThread().articleTitle,
			commentAuthor = this._getCommentThread().userAccount,
			quotedCommentText = this._getCommentThread()
				.text.split(/\n\n+/)
				.map(
					(paragraph, index, paragraphs) =>
						`"${paragraph}${index === paragraphs.length - 1 ? '"' : ''}`
				)
				.join('\n\n'),
			shareUrl = this.getCommentAbsoluteUrl();
		return {
			action: 'Comment',
			email: {
				body: `${quotedCommentText}\n\n${shareUrl}`,
				subject:
					this.props.user && this.props.user.name === commentAuthor
						? `My comment on "${articleTitle}"`
						: `Check out ${formatPossessive(
								commentAuthor
						  )} comment on "${articleTitle}"`,
			},
			text:
				this.props.user && this.props.user.name === commentAuthor
					? this._getCommentThread().text
					: `Check out ${formatPossessive(
							commentAuthor
					  )} comment on "${articleTitle}"`,
			url: shareUrl,
		};
	};
}
