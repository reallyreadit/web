import * as React from 'react';
import Comment from '../../../../../common/models/Comment';
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import ActionLink from '../../../../../common/components/ActionLink';
import classNames from 'classnames';
import timeago from 'timeago.js';
import ShareControl from '../../../../../common/components/ShareControl';
import { findRouteByKey } from '../../../../../common/routing/Route';
import routes from '../../../../../common/routing/routes';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import ShareChannel from '../../../../../common/sharing/ShareChannel';
import ShareData from '../../../../../common/sharing/ShareData';

interface Props {
	comment: Comment,
	highlightedCommentId?: number,
	isAllowedToPost?: boolean,
	mode: 'reply' | 'link',
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment?: (text: string, articleId: number, parentCommentId?: number) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewThread?: (comment: Comment) => void,
	parentCommentId?: number
}
export default class CommentDetails extends React.Component<Props, { showCommentBox: boolean }> {
	private readonly _commentsScreenRoute = findRouteByKey(routes, ScreenKey.Comments);
	private _showCommentBox = () => this.setState({ showCommentBox: true });
	private _hideCommentBox = () => this.setState({ showCommentBox: false });
	private _addComment = (text: string, articleId: number, parentCommentId?: number) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(() => {
				this.setState({ showCommentBox: false });
			});
	};
	private _viewThread = () => this.props.onViewThread(this.props.comment);
	constructor(props: Props) {
		super(props);
		this.state = { showCommentBox: false };
	}
	public render(): JSX.Element {
		const
			[sourceSlug, articleSlug] = this.props.comment.articleSlug.split('_'),
			shareUrl = this.props.onCreateAbsoluteUrl(
				this._commentsScreenRoute.createUrl({
					['articleSlug']: articleSlug,
					['commentId']: this.props.comment.id.toString(),
					['sourceSlug']: sourceSlug
				})
			);
		return (
			<li
				className={classNames(
					'comment-details_xrpqq3',
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
					<strong>{this.props.comment.userAccount}</strong> <span>-</span> {timeago().format(this.props.comment.dateCreated + 'Z')}
				</div>
				<div
					className={classNames('text', { 'preview': this.props.mode === 'link' })}
					dangerouslySetInnerHTML={{ __html: this.props.comment.text.replace(/\n/g, '<br />') }}>
				</div>
				{this.state.showCommentBox ? 
					<CommentBox
						articleId={this.props.comment.articleId}
						isAllowedToPost={this.props.isAllowedToPost}
						onCancel={this._hideCommentBox}
						onPostComment={this._addComment}
						parentCommentId={this.props.comment.id}
					/> :
					<div className="links">
						{this.props.mode === 'reply' ?
							<>
								{this.props.isAllowedToPost ?
									<ActionLink text="Reply" iconLeft="backward" onClick={this._showCommentBox} /> :
									null}
								<ShareControl
									data={{
										subject: `Comment on article: ${this.props.comment.articleTitle}`,
										url: shareUrl
									}}
									menuPosition="right"
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
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
					/> :
					null}
			</li>
		);
	}
}