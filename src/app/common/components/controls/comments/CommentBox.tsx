import * as React from 'react';
import Button from '../../../../../common/components/Button';
import Context, { contextTypes } from '../../../Context';
import Comment from '../../../../../common/models/Comment';
import { Link } from 'react-router-dom';
import * as className from 'classnames';

interface Props {
	articleId: number,
	parentCommentId?: number,
	isAllowedToPost: boolean,
	onCommentPosted: (comment: Comment) => void,
	onCancel?: () => void
}
export default class CommentBox extends React.Component<Props, {
	commentText: string,
	hasContent: boolean,
	hasFocus: boolean,
	isMousedown: boolean,
	isResizing: boolean,
	isPosting: boolean
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _updateCommentText = (e: React.FormEvent<HTMLTextAreaElement>) => this.setState({
		commentText: e.currentTarget.value,
		hasContent: e.currentTarget.value.trim() !== ''
	});
	private _mousedown = () => this.setState({ isMousedown: true });
	private _mousemove = () => this.setState(prevState => ({ isResizing: prevState.isMousedown }));
	private _mouseup = () => this.setState({
		isMousedown: false,
		isResizing: false
	});
	private _focus = () => this.setState({ hasFocus: true });
	private _blur = () => this.setState({ hasFocus: false });
	private _postComment = () => {
		this.setState({ isPosting: true });
		this.context.api
			.postComment(this.state.commentText, this.props.articleId, this.props.parentCommentId)
			.then(comment => {
				this.setState({
					commentText: '',
					hasContent: false,
					isPosting: false
				});
				this.props.onCommentPosted(comment);
				ga('send', {
					hitType: 'event',
					eventCategory: 'Comment',
					eventAction: comment.parentCommentId ? 'reply' : 'post',
					eventLabel: comment.articleTitle,
					eventValue: comment.text.length
				});
			});
	};
	private _cancel = () => {
		this.setState({
			commentText: '',
			hasContent: false
		});
		if (this.props.onCancel) {
			this.props.onCancel();
		}
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this.state = {
			commentText: '',
			hasContent: false,
			hasFocus: false,
			isMousedown: false,
			isResizing: false,
			isPosting: false
		};
	}
	public render() {
		const textareaStyle: { [key: string]: string } = {};
		if (!this.state.hasFocus && !this.state.hasContent) {
			textareaStyle['width'] = '100%';
			textareaStyle['height'] = this.props.parentCommentId ? '130px' : '26px';
		}
		return (
			<div className="comment-box">
				<textarea
					className={className({
						expanded: !!(this.props.parentCommentId || this.state.hasFocus || this.state.hasContent),
						resizing: this.state.isResizing
					})}
					value={this.state.commentText}
					placeholder={!this.props.parentCommentId ? 'Post a new comment...' : ''}
					onChange={this._updateCommentText}
					autoFocus={!!this.props.parentCommentId}
					onFocus={this._focus}
					onBlur={this._blur}
					onMouseDown={this._mousedown}
					onMouseMove={this._mousemove}
					onMouseUp={this._mouseup}
					style={textareaStyle}
				/>
				{this.props.articleId && !this.props.isAllowedToPost ?
					<span className="comment-warning">
						You must <Link to="/how-it-works">really read</Link> the article before you can comment
					</span> :
					null}
				<Button
					text="Cancel"
					iconLeft="forbid"
					state={
						this.state.isPosting ?
							'disabled' :
							(this.props.isAllowedToPost && this.state.hasContent) || this.props.parentCommentId ?
								'normal' :
								'disabled'
					}
					onClick={this._cancel}
				/>
				<Button
					text={`Post ${this.props.parentCommentId ? 'Reply' : 'Comment'}`}
					iconLeft="checkmark"
					style="preferred"
					state={
						this.state.isPosting ?
							'busy' :
							this.props.isAllowedToPost && this.state.hasContent ?
								'normal' :
								'disabled'
					}
					onClick={this._postComment}
				/>
			</div>
		);
	}
}