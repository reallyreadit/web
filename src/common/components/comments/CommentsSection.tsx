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
import UserAccount from '../../models/UserAccount';
import UserArticle from '../../models/UserArticle';
import CommentThread from '../../models/CommentThread';
import ShareResponse from '../../sharing/ShareResponse';
import { ShareEvent } from '../../sharing/ShareEvent';
import CommentDetails from './CommentDetails';
import ContentBox from '../ContentBox';
import CommentForm from '../../models/social/CommentForm';
import CommentDeletionForm from '../../models/social/CommentDeletionForm';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import CommentAddendumForm from '../../models/social/CommentAddendumForm';
import Icon from '../Icon';
import { ShareChannelData } from '../../sharing/ShareData';

export default (props: {
	article: UserArticle;
	comments: CommentThread[];
	highlightedCommentId?: string | null;
	noCommentsMessage: string;
	onAuthenticationRequired?: (completionDelegate?: () => void) => Function;
	onCloseDialog: () => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>;
	onNavTo: (url: string) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onPostComment: (form: CommentForm) => Promise<void>;
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>;
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onViewProfile: (userName: string) => void;
	user: UserAccount | null;
}) => {
	const isAllowedToPost = props.article.isRead;
	return (
		<div className="comments-section_mqmgnd">
			{!isAllowedToPost ? (
				<ContentBox className="post">
					<div className="locked">
						<Icon className="padlock" display="block" name="padlock" />
						You must read the article before you can comment on it.
					</div>
				</ContentBox>
			) : null}
			{props.comments.length ? (
				<ul className="comments">
					{props.comments.map((comment) => (
						<li key={comment.id}>
							<CommentDetails
								comment={comment}
								highlightedCommentId={props.highlightedCommentId}
								onAuthenticationRequired={props.onAuthenticationRequired}
								onCloseDialog={props.onCloseDialog}
								onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
								onDeleteComment={isAllowedToPost ? props.onDeleteComment : null}
								onNavTo={props.onNavTo}
								onOpenDialog={props.onOpenDialog}
								onPostComment={isAllowedToPost ? props.onPostComment : null}
								onPostCommentAddendum={
									isAllowedToPost ? props.onPostCommentAddendum : null
								}
								onPostCommentRevision={
									isAllowedToPost ? props.onPostCommentRevision : null
								}
								onShare={props.onShare}
								onShareViaChannel={props.onShareViaChannel}
								onViewProfile={props.onViewProfile}
								user={props.user}
							/>
						</li>
					))}
				</ul>
			) : (
				<ContentBox className="no-comments">
					{props.noCommentsMessage}
				</ContentBox>
			)}
		</div>
	);
};
