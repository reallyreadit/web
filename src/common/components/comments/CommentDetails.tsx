import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentComposer from './CommentComposer';
import ActionLink from '../ActionLink';
import classNames from 'classnames';
import { findRouteByKey } from '../../routing/Route';
import routes from '../../routing/routes';
import ScreenKey from '../../routing/ScreenKey';
import ShareResponse from '../../sharing/ShareResponse';
import ShareData from '../../sharing/ShareData';
import AsyncTracker from '../../AsyncTracker';
import UserAccount from '../../models/UserAccount';
import { formatPossessive, formatIsoDateAsUtc } from '../../format';
import ContentBox from '../ContentBox';
import PostHeader from '../PostHeader';
import CommentForm from '../../models/social/CommentForm';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import CommentAddendumForm from '../../models/social/CommentAddendumForm';
import CommentDeletionForm from '../../models/social/CommentDeletionForm';
import CommentRevisionComposer from './CommentRevisionComposer';
import Dialog from '../Dialog';
import CommentAddendumComposer from './CommentAddendumComposer';
import { DateTime } from 'luxon';
import MarkdownContent from './MarkdownContent';

enum CompositionState {
	None,
	Reply,
	Revision,
	Addendum
}
interface Props {
	comment: CommentThread,
	highlightedCommentId?: string,
	onAuthenticationRequired?: (completionDelegate?: () => void) => Function,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteComment?: (form: CommentDeletionForm) => Promise<CommentThread>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostComment?: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum?: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision?: (form: CommentRevisionForm) => Promise<CommentThread>,
	onShare: (data: ShareData) => ShareResponse,
	onViewProfile: (userName: string) => void,
	onViewThread?: (comment: CommentThread) => void,
	parentCommentId?: string,
	user: UserAccount | null
}
export default class CommentDetails extends React.Component<
	Props,
	{
		compositionState: CompositionState
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _commentsScreenRoute = findRouteByKey(routes, ScreenKey.Comments);
	private readonly _textDivRef: React.RefObject<HTMLDivElement>;
	private readonly _openEditComposer = () => {
		if ((DateTime.fromISO(formatIsoDateAsUtc(this.props.comment.dateCreated)).diffNow('seconds').seconds * -1) < (60 * 2) + 50) {
			this.setState({ compositionState: CompositionState.Revision });
		} else {
			this.setState({ compositionState: CompositionState.Addendum });
		}
	};
	private readonly _openReplyComposer = () => {
		const openComposer = () => {
			this.setState({
				compositionState: CompositionState.Reply
			});
		};
		if (this.props.user) {
			openComposer();
		} else if (this.props.onAuthenticationRequired) {
			const unsubscribe = this.props.onAuthenticationRequired(
				() => {
					unsubscribe();
					this._asyncTracker.removeCancellationDelegate(unsubscribe);
					openComposer();
				}
			);
			this._asyncTracker.addCancellationDelegate(unsubscribe);
		}
	};
	private readonly _closeComposer = () => {
		this.setState({ compositionState: CompositionState.None });
	};
	private readonly _openDeleteDialog = () => {
		this.props.onOpenDialog(
			<Dialog
				closeButtonText="Cancel"
				onClose={this.props.onCloseDialog}
				onSubmit={
					() => this.props.onDeleteComment({ commentId: this.props.comment.id })
				}
				size="small"
				textAlign="center"
				title="Delete Comment"
			>
				<p>Are you sure?</p>
				<p>Comment deletion is permanant. You can't undo this action.</p>
			</Dialog>
		);
	};
	private readonly _navTo = (url: string) => {
		const result = this.props.onNavTo(url);
		if (!result) {
			this.props.onOpenDialog(
				<Dialog
					closeButtonText="Ok"
					onClose={this.props.onCloseDialog}
					size="small"
					textAlign="center"
					title="Navigation Error"
				>
					<p>This link is invalid.</p>
				</Dialog>
			);
		}
		return result;
	};
	private readonly _postComment = (form: CommentForm) => {
		return this.props
			.onPostComment(form)
			.then(
				this._asyncTracker.addCallback(
					() => {
						this.setState({ compositionState: CompositionState.None });
					}
				)
			);
	};
	private readonly _postCommentRevision = (form: CommentRevisionForm) => {
		return this._asyncTracker.addPromise(
			this.props
				.onPostCommentRevision(form)
				.then(
					comment => {
						this.setState({ compositionState: CompositionState.None });
						return comment;
					}
				)
		);
	};
	private readonly _postCommentAddendum = (form: CommentAddendumForm) => {
		return this._asyncTracker.addPromise(
			this.props
				.onPostCommentAddendum(form)
				.then(
					comment => {
						this.setState({ compositionState: CompositionState.None });
						return comment;
					}
				)
		);
	};
	private readonly _getShareData = () => {
		const
			articleTitle = this.props.comment.articleTitle,
			commentAuthor = this.props.comment.userAccount,
			quotedCommentText = this.props.comment.text
				.split(/\n\n+/)
				.map((paragraph, index, paragraphs) => `"${paragraph}${index === paragraphs.length - 1 ? '"' : ''}`)
				.join('\n\n'),
			shareUrl = this.getCommentAbsoluteUrl();
		return {
			action: 'Comment',
			email: {
				body: `${quotedCommentText}\n\n${shareUrl}`,
				subject: (
					this.props.user && this.props.user.name === commentAuthor ?
						`My comment on "${articleTitle}"` :
						`Check out ${formatPossessive(commentAuthor)} comment on "${articleTitle}"`
				)
			},
			text: (
				this.props.user && this.props.user.name === commentAuthor ?
					this.props.comment.text :
					`Check out ${formatPossessive(commentAuthor)} comment on "${articleTitle}"`
			),
			url: shareUrl
		};
	};
	private readonly _viewThread = () => {
		this.props.onViewThread(this.props.comment);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			compositionState: CompositionState.None
		};
		if (this.props.onPostComment && this.props.user && this.props.user.name === this.props.comment.userAccount) {
			this._textDivRef = React.createRef();
		}
	}
	private getCommentAbsoluteUrl() {
		const [sourceSlug, articleSlug] = this.props.comment.articleSlug.split('_');
		return this.props.onCreateAbsoluteUrl(
			this._commentsScreenRoute.createUrl({
				['articleSlug']: articleSlug,
				['commentId']: this.props.comment.id,
				['sourceSlug']: sourceSlug
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const commentText = (
			!this.props.comment.dateDeleted ?
				this.props.comment.text :
				`This comment was deleted on ${DateTime.fromISO(formatIsoDateAsUtc(this.props.comment.dateDeleted)).toLocaleString(DateTime.DATE_SHORT)}`
		);
		return (
			<ContentBox
				className={classNames(
					'comment-details_qker1u',
					{
						'post-embed': !!this.props.onViewThread
					}
				)}
				highlight={this.props.highlightedCommentId === this.props.comment.id}
			>
				<PostHeader
					userName={this.props.comment.userAccount}
					leaderboardBadge={this.props.comment.badge}
					date={this.props.comment.dateCreated}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onGetShareData={this._getShareData}
					onShare={this.props.onShare}
					onViewProfile={this.props.onViewProfile}
				/>
				{this.state.compositionState === CompositionState.Revision ?
					<CommentRevisionComposer
						comment={this.props.comment}
						initialHeight={(this._textDivRef.current && this._textDivRef.current.offsetHeight + 30) || 0}
						onClose={this._closeComposer}
						onCloseDialog={this.props.onCloseDialog}
						onCreateAddendum={this._openEditComposer}
						onOpenDialog={this.props.onOpenDialog}
						onPostRevision={this._postCommentRevision}
					/> :
					<>
						<div
							className="text-wrapper"
							ref={this._textDivRef}
						>
							<MarkdownContent
								className={classNames('text', { 'deleted': !!this.props.comment.dateDeleted })}
								onNavTo={this._navTo}
								text={commentText}
							/>
						</div>
						{this.props.comment.addenda.length ?
							<ol className="addenda">
								{this.props.comment.addenda.map(
									addendum => (
										<li
											className="addendum"
											key={addendum.dateCreated}
										>
											<span className="date">Update ({DateTime.fromISO(formatIsoDateAsUtc(addendum.dateCreated)).toLocaleString(DateTime.DATE_SHORT)}):</span>
											<MarkdownContent
												className="text"
												onNavTo={this._navTo}
												text={addendum.textContent}
											/>
										</li>
									)
								)}
							</ol> :
							null}
					</>}
				{this.state.compositionState === CompositionState.Addendum ?
					<CommentAddendumComposer
						comment={this.props.comment}
						onClose={this._closeComposer}
						onCloseDialog={this.props.onCloseDialog}
						onOpenDialog={this.props.onOpenDialog}
						onPostAddendum={this._postCommentAddendum}
					/> :
					null}
				{this.state.compositionState === CompositionState.Reply ? 
					<CommentComposer
						articleId={this.props.comment.articleId}
						onCancel={this._closeComposer}
						onCloseDialog={this.props.onCloseDialog}
						onOpenDialog={this.props.onOpenDialog}
						onPostComment={this._postComment}
						parentCommentId={this.props.comment.id}
					/> :
					null}
				{this.state.compositionState === CompositionState.None && (this.props.onPostComment || this.props.onViewThread) && !this.props.comment.dateDeleted ?
					<div className="actions">
						{this.props.onPostComment ?
							this.props.user?.name === this.props.comment.userAccount ?
								<>
									<ActionLink
										text="Edit"
										onClick={this._openEditComposer}
									/>
									<ActionLink
										text="Delete"
										onClick={this._openDeleteDialog}
									/>
								</> :
								<ActionLink
									text="Reply"
									onClick={this._openReplyComposer}
								/> :
							this.props.onViewThread ?
								<ActionLink
									href={this.getCommentAbsoluteUrl()}
									text="View Thread"
									onClick={this._viewThread} 
								/> :
								null}
					</div> :
					null}
				{this.props.comment.children.length ?
					<ul className="replies">
						{this.props.comment.children.map(
							comment => (
								<li key={comment.id}>
									<CommentDetails
										comment={comment}
										highlightedCommentId={this.props.highlightedCommentId}
										onAuthenticationRequired={this.props.onAuthenticationRequired}
										onCloseDialog={this.props.onCloseDialog}
										onCopyTextToClipboard={this.props.onCopyTextToClipboard}
										onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
										onDeleteComment={this.props.onDeleteComment}
										onNavTo={this.props.onNavTo}
										onOpenDialog={this.props.onOpenDialog}
										onPostComment={this.props.onPostComment}
										onPostCommentAddendum={this.props.onPostCommentAddendum}
										onPostCommentRevision={this.props.onPostCommentRevision}
										onShare={this.props.onShare}
										onViewProfile={this.props.onViewProfile}
										onViewThread={this.props.onViewThread}
										parentCommentId={this.props.comment.id}
										user={this.props.user}
									/>
								</li>
							)
						)}
					</ul> :
					null}
			</ContentBox>
		);
	}
}