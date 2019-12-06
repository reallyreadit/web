import * as React from 'react';
import ShareChannel from '../../../common/sharing/ShareChannel';
import Toaster from '../../../common/components/Toaster';
import { createUrl } from '../../../common/HttpEndpoint';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import DialogService, { State as DialogState } from '../../../common/services/DialogService';
import AsyncTracker from '../../../common/AsyncTracker';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../../../common/Fetchable';
import CommentThread from '../../../common/models/CommentThread';
import UserAccount from '../../../common/models/UserAccount';
import PostDialog from '../../../common/components/PostDialog';
import DialogManager from '../../../common/components/DialogManager';
import CommentsSection from '../../../common/components/comments/CommentsSection';
import PostForm from '../../../common/models/social/PostForm';
import Post from '../../../common/models/social/Post';
import ShareData from '../../../common/sharing/ShareData';
import PostPrompt from '../../../common/components/PostPrompt';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import ContentBox from '../../../common/components/ContentBox';
import SpinnerIcon from '../../../common/components/SpinnerIcon';

export interface Props {
	article: UserArticle
	comments: Fetchable<CommentThread[]>,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onPostArticle: (form: PostForm) => Promise<Post>,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onShare: (data: ShareData) => void,
	user: UserAccount
}
export default class App extends React.Component<
	Props,
	ToasterState &
	DialogState
> {
	// clipboard
	private readonly _copyTextToClipboard = () => {
		// we don't need this since we're using native sharing
	};

	// dialogs
	private readonly _dialog = new DialogService({
		setState: delegate => {
			this.setState(delegate);
		}
	})
	protected readonly _openPostDialog = (article: UserArticle) => {
		this._dialog.openDialog(
			<PostDialog
				article={article}
				onCloseDialog={this._dialog.closeDialog}
				onShowToast={this._toaster.addToast}
				onSubmit={this.props.onPostArticle}
			/>
		);
	};

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.nativeClient.reader.config.webServer, path);

	// sharing
	private readonly _handleShareRequest = (data: ShareData) => {
		this.props.onShare(data);
		return [] as ShareChannel[];
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: delegate => {
			this.setState(delegate);
		}
	});
	constructor(props: Props) {
		super(props);
		this.state = {
			dialogs: [],
			toasts: []
		};
	}
	public render() {
		return (
			<div className="app_n0jlkg">
				<PostPrompt
					article={this.props.article}
					onPost={this._openPostDialog}
					promptMessage="Post this article."
				/>
				{this.props.comments.isLoading ?
					<ContentBox className="loading-comments">
						<SpinnerIcon /> Loading comments...
					</ContentBox> :
					<CommentsSection
						article={this.props.article}
						comments={this.props.comments.value}
						imagePath="./images"
						noCommentsMessage="No comments on this article yet."
						onCloseDialog={this._dialog.closeDialog}
						onCopyTextToClipboard={this._copyTextToClipboard}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onDeleteComment={this.props.onDeleteComment}
						onOpenDialog={this._dialog.openDialog}
						onPostComment={this.props.onPostComment}
						onPostCommentAddendum={this.props.onPostCommentAddendum}
						onPostCommentRevision={this.props.onPostCommentRevision}
						onShare={this._handleShareRequest}
						user={this.props.user}
					/>}
				<DialogManager
					dialogs={this.state.dialogs}
					onTransitionComplete={this._dialog.handleTransitionCompletion}
				/>
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}