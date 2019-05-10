import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentList from './CommentList';
import CommentComposer from './CommentComposer';
import ActionLink from '../ActionLink';
import classNames from 'classnames';
import timeago from 'timeago.js';
import ShareControl, { MenuPosition } from '../ShareControl';
import { findRouteByKey } from '../../routing/Route';
import routes from '../../routing/routes';
import ScreenKey from '../../routing/ScreenKey';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import AsyncTracker from '../../AsyncTracker';
import UserAccount from '../../models/UserAccount';
import { formatPossessive } from '../../format';

interface Props {
	comment: CommentThread,
	highlightedCommentId?: string,
	isAllowedToPost?: boolean,
	mode: 'reply' | 'link',
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment?: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewThread?: (comment: CommentThread) => void,
	parentCommentId?: string,
	user: UserAccount | null
}
export default class CommentDetails extends React.Component<Props, { showComposer: boolean }> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _commentsScreenRoute = findRouteByKey(routes, ScreenKey.Comments);
	private _showComposer = () => this.setState({ showComposer: true });
	private _hideComposer = () => this.setState({ showComposer: false });
	private _addComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(this._asyncTracker.addCallback(() => {
				this.setState({ showComposer: false });
			}));
	};
	private readonly _getShareData = () => {
		const
			articleTitle = this.props.comment.articleTitle,
			commentAuthor = this.props.comment.userAccount,
			commentText = new DOMParser()
				.parseFromString(this.props.comment.text, 'text/html')
				.documentElement
				.textContent,
			quotedCommentText = commentText
				.split(/\n\n+/)
				.map((paragraph, index, paragraphs) => `"${paragraph}${index === paragraphs.length - 1 ? '"' : ''}`)
				.join('\n\n'),
			[sourceSlug, articleSlug] = this.props.comment.articleSlug.split('_'),
			shareUrl = this.props.onCreateAbsoluteUrl(
				this._commentsScreenRoute.createUrl({
					['articleSlug']: articleSlug,
					['commentId']: this.props.comment.id,
					['sourceSlug']: sourceSlug
				})
			);
		return {
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
					commentText :
					`Check out ${formatPossessive(commentAuthor)} comment on "${articleTitle}"`
			),
			url: shareUrl
		};
	};
	private _viewThread = () => this.props.onViewThread(this.props.comment);
	constructor(props: Props) {
		super(props);
		this.state = { showComposer: false };
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<li
				className={classNames(
					'comment-details_qker1u',
					{
						unread: this.props.mode === 'link' && !this.props.comment.dateRead,
						highlight: this.props.comment.id === this.props.highlightedCommentId
					}
				)}
			>
				{this.props.mode === 'link' ?
					<div className="article-title">{this.props.comment.articleTitle}</div> :
					null}
				<div className="title">
					<strong>{this.props.comment.userAccount}</strong> <span>-</span> {timeago().format(this.props.comment.dateCreated.replace(/([^Z])$/, '$1Z'))}
				</div>
				<div
					className={classNames('text', { 'preview': this.props.mode === 'link' })}
					dangerouslySetInnerHTML={{ __html: this.props.comment.text.replace(/\n/g, '<br />') }}>
				</div>
				{this.state.showComposer ? 
					<CommentComposer
						articleId={this.props.comment.articleId}
						isAllowedToPost={this.props.isAllowedToPost}
						onCancel={this._hideComposer}
						onPostComment={this._addComment}
						parentCommentId={this.props.comment.id}
					/> :
					<div className="links">
						{this.props.mode === 'reply' ?
							<>
								{this.props.isAllowedToPost ?
									<ActionLink text="Reply" iconLeft="backward" onClick={this._showComposer} /> :
									null}
								<ShareControl
									menuPosition={MenuPosition.MiddleRight}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onGetData={this._getShareData}
									onShare={this.props.onShare}
								>
									<ActionLink
										text="Share"
										iconLeft="share"
									/>
								</ShareControl>
							</> :
							<ActionLink text="View Thread" iconLeft="comments" onClick={this._viewThread} />}
					</div>}
				{this.props.comment.children.length ?
					<CommentList
						comments={this.props.comment.children}
						highlightedCommentId={this.props.highlightedCommentId}
						isAllowedToPost={this.props.isAllowedToPost}
						mode={this.props.mode}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onPostComment={this.props.onPostComment}
						onShare={this.props.onShare}
						onViewThread={this.props.onViewThread}
						parentCommentId={this.props.comment.id}
						user={this.props.user}
					/> :
					null}
			</li>
		);
	}
}