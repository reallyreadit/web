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
import CommentThread from '../../models/CommentThread';
import CommentComposer from './CommentComposer';
import Link from '../Link';
import classNames from 'classnames';
import ShareResponse from '../../sharing/ShareResponse';
import { ShareEvent } from '../../sharing/ShareEvent';
import AsyncTracker from '../../AsyncTracker';
import UserAccount from '../../models/UserAccount';
import { formatIsoDateAsUtc } from '../../format';
import ContentBox from '../ContentBox';
import PostHeader from '../PostHeader';
import CommentForm from '../../models/social/CommentForm';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import CommentAddendumForm from '../../models/social/CommentAddendumForm';
import CommentDeletionForm from '../../models/social/CommentDeletionForm';
import CommentRevisionComposer from './CommentRevisionComposer';
import FormDialog from '../FormDialog';
import CommentAddendumComposer from './CommentAddendumComposer';
import { DateTime } from 'luxon';
import MarkdownContent from './MarkdownContent';
import { ShareChannelData } from '../../sharing/ShareData';
import AbstractCommentShareable from '../AbstractCommentShareable';

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
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteComment?: (form: CommentDeletionForm) => Promise<CommentThread>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostComment?: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum?: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision?: (form: CommentRevisionForm) => Promise<CommentThread>,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onViewProfile: (userName: string) => void,
	onViewThread?: (comment: CommentThread) => void,
	parentCommentId?: string,
	showPostHeader?: boolean,
	user: UserAccount | null
}
export default class CommentDetails extends AbstractCommentShareable<
	Props,
	{
		compositionState: CompositionState
	}
> {
	public static defaultProps: Pick<Props, 'showPostHeader'> = {
		showPostHeader: true
	}
	private readonly _asyncTracker = new AsyncTracker();
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
			<FormDialog
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
				<p>Comment deletion is permanent. You can't undo this action.</p>
			</FormDialog>
		);
	};
	private readonly _navTo = (url: string) => {
		const result = this.props.onNavTo(url);
		if (!result) {
			this.props.onOpenDialog(
				<FormDialog
					closeButtonText="Ok"
					onClose={this.props.onCloseDialog}
					size="small"
					textAlign="center"
					title="Navigation Error"
				>
					<p>This link is invalid.</p>
				</FormDialog>
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
		return this._asyncTracker
			.addPromise(
				this.props.onPostCommentRevision(form)
			)
			.then(
				comment => {
					this.setState({ compositionState: CompositionState.None });
					return comment;
				}
			);
	};
	private readonly _postCommentAddendum = (form: CommentAddendumForm) => {
		return this._asyncTracker
			.addPromise(
				this.props.onPostCommentAddendum(form)
			)
			.then(
				comment => {
					this.setState({ compositionState: CompositionState.None });
					return comment;
				}
			);
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
				className="comment-details_qker1u"

				highlight={this.props.highlightedCommentId === this.props.comment.id}
			>
				{ this.props.showPostHeader ?
					<PostHeader
						userName={this.props.comment.userAccount}
						leaderboardBadge={this.props.comment.badge}
						isAuthor={this.props.comment.isAuthor}
						date={this.props.comment.dateCreated}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onGetShareData={this._getShareData}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
						onViewProfile={this.props.onViewProfile}
					/>
					: null
				}
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
									<Link
										text="Edit"
										onClick={this._openEditComposer}
									/>
									<Link
										text="Delete"
										onClick={this._openDeleteDialog}
									/>
								</> :
								<Link
									text="Reply"
									onClick={this._openReplyComposer}
								/> :
							this.props.onViewThread ?
								<Link
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
										onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
										onDeleteComment={this.props.onDeleteComment}
										onNavTo={this.props.onNavTo}
										onOpenDialog={this.props.onOpenDialog}
										onPostComment={this.props.onPostComment}
										onPostCommentAddendum={this.props.onPostCommentAddendum}
										onPostCommentRevision={this.props.onPostCommentRevision}
										onShare={this.props.onShare}
										onShareViaChannel={this.props.onShareViaChannel}
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