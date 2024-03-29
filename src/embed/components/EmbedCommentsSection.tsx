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
import ToasterService from '../../common/services/ToasterService';
import DialogService from '../../common/services/DialogService';
import UserArticle from '../../common/models/UserArticle';
import Fetchable from '../../common/Fetchable';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';
import PostDialog from '../../common/components/PostDialog';
import CommentsSection from '../../common/components/comments/CommentsSection';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import PostPrompt from '../../common/components/PostPrompt';
import CommentForm from '../../common/models/social/CommentForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import ContentBox from '../../common/components/ContentBox';
import SpinnerIcon from '../../common/components/SpinnerIcon';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import ShareResponse from '../../common/sharing/ShareResponse';
import AuthServiceProvider from '../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../common/models/auth/AuthServiceAccountAssociation';
import { ShareChannelData } from '../../common/sharing/ShareData';
import { DiscordInviteLink } from '../../common/components/Link';

export interface Props {
	article: UserArticle;
	comments: Fetchable<CommentThread[]>;
	dialogService: DialogService<{}>;
	onAuthenticationRequired: (
		analyticsAction: string,
		completionDelegate: () => void
	) => Function;
	onCreateAbsoluteUrl: (path: string) => string;
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>;
	onLinkAuthServiceAccount: (
		provider: AuthServiceProvider
	) => Promise<AuthServiceAccountAssociation>;
	onNavTo: (url: string) => boolean;
	onPostArticle: (form: PostForm) => Promise<Post>;
	onPostComment: (form: CommentForm) => Promise<void>;
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>;
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>;
	onShare: (shareData: ShareEvent) => ShareResponse;
	onShareViaChannel: (shareData: ShareChannelData) => void;
	onViewProfile: (userName: string) => void;
	toasterService: ToasterService;
	user: UserAccount | null;
}
export default class EmbedCommentsSection extends React.Component<Props> {
	private readonly _openPostDialog = (article: UserArticle) => {
		const openDialog = (article: UserArticle) => {
			this.props.dialogService.openDialog(
				<PostDialog
					article={article}
					onCloseDialog={this.props.dialogService.closeDialog}
					onLinkAuthServiceAccount={this.props.onLinkAuthServiceAccount}
					onOpenDialog={this.props.dialogService.openDialog}
					onShowToast={this.props.toasterService.addToast}
					onSubmit={this.props.onPostArticle}
					user={this.props.user}
				/>
			);
		};
		if (!this.props.user) {
			const unsubscribe = this.props.onAuthenticationRequired(
				'EmbedPost',
				() => {
					unsubscribe();
					openDialog(article);
				}
			);
		} else {
			openDialog(article);
		}
	};
	private readonly _requireAuthenticationForReply = (
		completionDelegate: () => void
	) => this.props.onAuthenticationRequired('EmbedReply', completionDelegate);
	public render() {
		return (
			<div className="embed-comments-section_40yiiy">
				{this.props.article.isRead ? (
					<PostPrompt
						article={this.props.article}
						onPost={this._openPostDialog}
						promptMessage="Post this article on Readup."
					/>
				) : null}
				{this.props.comments.isLoading ? (
					<ContentBox className="loading-comments">
						<SpinnerIcon /> Loading comments...
					</ContentBox>
				) : (
					<>
						<CommentsSection
							comments={this.props.comments.value}
							isAllowedToPost={this.props.article.isRead}
							noCommentsMessage="No comments on this article yet."
							onAuthenticationRequired={this._requireAuthenticationForReply}
							onCloseDialog={this.props.dialogService.closeDialog}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onDeleteComment={this.props.onDeleteComment}
							onNavTo={this.props.onNavTo}
							onOpenDialog={this.props.dialogService.openDialog}
							onPostComment={this.props.onPostComment}
							onPostCommentAddendum={this.props.onPostCommentAddendum}
							onPostCommentRevision={this.props.onPostCommentRevision}
							onShare={this.props.onShare}
							onShareViaChannel={this.props.onShareViaChannel}
							onViewProfile={this.props.onViewProfile}
							user={this.props.user}
						/>
						<div className="embed-solicitation">
							Want a reader-only comments section like this on your blog?{' '}
							<DiscordInviteLink onClick={this.props.onNavTo}>
								Help our community achieve it.
							</DiscordInviteLink>
						</div>
					</>
				)}
			</div>
		);
	}
}
