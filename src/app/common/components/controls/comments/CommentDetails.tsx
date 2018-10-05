import * as React from 'react';
import Comment from '../../../../../common/models/Comment';
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import ActionLink from '../../../../../common/components/ActionLink';
import classNames from 'classnames';
import timeago from 'timeago.js';

interface Props {
	comment: Comment,
	highlightedCommentId?: number,
	isAllowedToPost?: boolean,
	mode: 'reply' | 'link',
	onPostComment?: (text: string, articleId: number, parentCommentId?: number) => Promise<void>,
	onViewThread?: (comment: Comment) => void,
	parentCommentId?: number
}
export default class CommentDetails extends React.Component<Props, { showCommentBox: boolean }> {
	private _showCommentBox = () => this.setState({ showCommentBox: true });
	private _hideCommentBox = () => this.setState({ showCommentBox: false });
	private _addComment = (text: string, articleId: number, parentCommentId?: number) => {
		this.setState({ showCommentBox: false });
		return this.props.onPostComment(text, articleId, parentCommentId);
	};
	private _viewThread = () => this.props.onViewThread(this.props.comment);
	constructor(props: Props) {
		super(props);
		this.state = { showCommentBox: false };
	}
	public render(): JSX.Element {
		return (
			<li
				className={classNames(
					'comment-details',
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
					this.props.mode === 'reply' ?
						this.props.isAllowedToPost ?
							<ActionLink text="Reply" iconLeft="backward" onClick={this._showCommentBox} /> :
							null :
						<ActionLink text="View Thread" iconLeft="comments" onClick={this._viewThread} />}
				{this.props.comment.children.length ?
					<CommentList
						comments={this.props.comment.children}
						highlightedCommentId={this.props.highlightedCommentId}
						isAllowedToPost={this.props.isAllowedToPost}
						mode={this.props.mode}
						onPostComment={this.props.onPostComment}
						onViewThread={this.props.onViewThread}
						parentCommentId={this.props.comment.id}
					/> :
					null}
			</li>
		);
	}
}