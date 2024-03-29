import * as React from 'react';
import ClipboardService from '../../../../common/services/ClipboardService';
import ToasterService from '../../../../common/services/ToasterService';
import DialogService from '../../../../common/services/DialogService';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';
import PostDialog from '../../../../common/components/PostDialog';
import CommentsSection from '../../../../common/components/comments/CommentsSection';
import PostForm from '../../../../common/models/social/PostForm';
import Post from '../../../../common/models/social/Post';
import PostPrompt from '../../../../common/components/PostPrompt';
import CommentForm from '../../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../../common/models/social/CommentRevisionForm';
import ContentBox from '../../../../common/components/ContentBox';
import SpinnerIcon from '../../../../common/components/SpinnerIcon';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../../common/models/auth/AuthServiceAccountAssociation';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

export interface Props {
	article: UserArticle;
	clipboardService: ClipboardService;
	comments: Fetchable<CommentThread[]>;
	dialogService: DialogService<{}>;
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
	onShareViaChannel: (data: ShareChannelData) => void;
	onViewProfile: (userName: string) => void;
	toasterService: ToasterService;
	user: UserAccount;
}
export default class BrowserCommentsSection extends React.Component<Props> {
	protected readonly _openPostDialog = (article: UserArticle) => {
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
	public render() {
		return (
			<div className="browser-comments-section_s3hacq">
				<PostPrompt
					article={this.props.article}
					onPost={this._openPostDialog}
					promptMessage="Post this article on Readup."
				/>
				{this.props.comments.isLoading ? (
					<ContentBox className="loading-comments">
						<SpinnerIcon /> Loading comments...
					</ContentBox>
				) : (
					<CommentsSection
						comments={this.props.comments.value}
						isAllowedToPost={this.props.article.isRead}
						noCommentsMessage="No comments on this article yet."
						onCloseDialog={this.props.dialogService.closeDialog}
						onShareViaChannel={this.props.onShareViaChannel}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onDeleteComment={this.props.onDeleteComment}
						onNavTo={this.props.onNavTo}
						onOpenDialog={this.props.dialogService.openDialog}
						onPostComment={this.props.onPostComment}
						onPostCommentAddendum={this.props.onPostCommentAddendum}
						onPostCommentRevision={this.props.onPostCommentRevision}
						onShare={this.props.onShare}
						onViewProfile={this.props.onViewProfile}
						user={this.props.user}
					/>
				)}
			</div>
		);
	}
}
