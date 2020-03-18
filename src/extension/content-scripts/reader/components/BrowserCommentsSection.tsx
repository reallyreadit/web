import * as React from 'react';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ClipboardService from '../../../../common/services/ClipboardService';
import { createUrl } from '../../../../common/HttpEndpoint';
import ToasterService from '../../../../common/services/ToasterService';
import DialogService from '../../../../common/services/DialogService';
import UserArticle from '../../../../common/models/UserArticle';
import Logo from './Logo';
import Fetchable from '../../../../common/Fetchable';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';
import PostDialog from '../../../../common/components/PostDialog';
import CommentsSection from '../../../../common/components/comments/CommentsSection';
import PostForm from '../../../../common/models/social/PostForm';
import Post from '../../../../common/models/social/Post';
import PostPrompt from '../../../../common/components/PostPrompt';
import { findRouteByKey, parseUrlForRoute } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import CommentForm from '../../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../../common/models/social/CommentRevisionForm';
import ContentBox from '../../../../common/components/ContentBox';
import SpinnerIcon from '../../../../common/components/SpinnerIcon';

export interface Props {
	article: UserArticle
	clipboardService: ClipboardService,
	comments: Fetchable<CommentThread[]>,
	dialogService: DialogService,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onPostArticle: (form: PostForm) => Promise<Post>,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	toasterService: ToasterService,
	user: UserAccount
}
export default class App extends React.Component<Props> {
	protected readonly _openPostDialog = (article: UserArticle) => {
		this.props.dialogService.openDialog(
			<PostDialog
				article={article}
				onCloseDialog={this.props.dialogService.closeDialog}
				onOpenDialog={this.props.dialogService.openDialog}
				onShowToast={this.props.toasterService.addToast}
				onSubmit={this.props.onPostArticle}
			/>
		);
	};

	// profile links
	private readonly _viewProfile = (userName: string) => {
		this.openInNewTab(
			this._createAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
			)
		);
	};

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.web, path);
	private readonly _navTo = (url: string) => {
		const result = parseUrlForRoute(url);
		if (
			(result.isInternal && result.route) ||
			(!result.isInternal && result.url)
		) {
			this.openInNewTab(result.url.href);
			return true;
		}
		return false;
	}

	// sharing
	private readonly _handleShareRequest = () => {
		return [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter
		];
	};

	private openInNewTab(url: string) {
		window.open(url, '_blank');
	}
	public render() {
		return (
			<div className="browser-comments-section_s3hacq">
				<Logo />
				<PostPrompt
					article={this.props.article}
					onPost={this._openPostDialog}
					promptMessage="Post this article on Readup."
				/>
				{this.props.comments.isLoading ?
					<ContentBox className="loading-comments">
						<SpinnerIcon /> Loading comments...
					</ContentBox> :
					<CommentsSection
						article={this.props.article}
						comments={this.props.comments.value}
						imagePath={`chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-scripts/ui/images`}
						noCommentsMessage="No comments on this article yet."
						onCloseDialog={this.props.dialogService.closeDialog}
						onCopyTextToClipboard={this.props.clipboardService.copyText}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onDeleteComment={this.props.onDeleteComment}
						onNavTo={this._navTo}
						onOpenDialog={this.props.dialogService.openDialog}
						onPostComment={this.props.onPostComment}
						onPostCommentAddendum={this.props.onPostCommentAddendum}
						onPostCommentRevision={this.props.onPostCommentRevision}
						onShare={this._handleShareRequest}
						onViewProfile={this._viewProfile}
						user={this.props.user}
					/>}
			</div>
		);
	}
}