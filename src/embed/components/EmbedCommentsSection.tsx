import * as React from 'react';
import ClipboardService from '../../common/services/ClipboardService';
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
import ShareData from '../../common/sharing/ShareData';
import ShareResponse from '../../common/sharing/ShareResponse';
import AuthServiceProvider from '../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../common/models/auth/AuthServiceAccountAssociation';

export interface Props {
	article: UserArticle
	clipboardService: ClipboardService,
	comments: Fetchable<CommentThread[]>,
	dialogService: DialogService,
	onAuthenticationRequired: (analyticsAction: string, completionDelegate: () => void) => Function,
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<AuthServiceAccountAssociation>
	onNavTo: (url: string) => boolean,
	onPostArticle: (form: PostForm) => Promise<Post>,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onShare: (shareData: ShareData) => ShareResponse,
	onViewProfile: (userName: string) => void,
	toasterService: ToasterService,
	user: UserAccount | null
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
	private readonly _requireAuthenticationForReply = (completionDelegate: () => void) => (
		this.props.onAuthenticationRequired('EmbedReply', completionDelegate)
	);
	public render() {
		return (
			<div className="embed-comments-section_40yiiy">
				{this.props.article.isRead ?
					<PostPrompt
						article={this.props.article}
						onPost={this._openPostDialog}
						promptMessage="Post this article on Readup."
					/> :
					null}
				{this.props.comments.isLoading ?
					<ContentBox className="loading-comments">
						<SpinnerIcon /> Loading comments...
					</ContentBox> :
					<>
						<CommentsSection
							article={this.props.article}
							comments={this.props.comments.value}
							noCommentsMessage="No comments on this article yet."
							onAuthenticationRequired={this._requireAuthenticationForReply}
							onCloseDialog={this.props.dialogService.closeDialog}
							onCopyTextToClipboard={this.props.clipboardService.copyText}
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
						<div className="embed-solicitation">
							Want a reader-only comments section like this on your blog? <a href="mailto:support@readup.com?subject=Blog%20Comments%20Embed">Drop us a line.</a>
						</div>
					</>}
			</div>
		);
	}
}