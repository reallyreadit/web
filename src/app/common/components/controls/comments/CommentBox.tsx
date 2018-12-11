import * as React from 'react';
import Button from '../../../../../common/components/Button';
import classNames from 'classnames';

interface Props {
	articleId: number,
	isAllowedToPost: boolean,
	onCancel?: () => void,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<void>,
	parentCommentId?: number
}
export default class extends React.PureComponent<Props, {
	commentText: string,
	hasContent: boolean,
	hasFocus: boolean,
	isMousedown: boolean,
	isResizing: boolean,
	isPosting: boolean
}> {
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
	private _focus = () => {
		this.setState({ hasFocus: true });
		// iOS keyboard scroll bug
		window.isFocusedOnField = true;
	};
	private _blur = () => {
		this.setState({ hasFocus: false });
		// iOS keyboard scroll bug
		window.isFocusedOnField = false;
		window.setTimeout(() => {
			if (!window.isFocusedOnField && window.scrollY !== 0) {
				window.scrollTo(0, 0);
			}
		}, 100);
	};
	private _postComment = () => {
		this.setState({ isPosting: true });
		this.props
			.onPostComment(this.state.commentText, this.props.articleId, this.props.parentCommentId)
			.then(() => {
				this.setState({
					commentText: '',
					hasContent: false,
					isPosting: false
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
	constructor(props: Props) {
		super(props);
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
			textareaStyle['height'] = this.props.parentCommentId ? '130px' : '32px';
		}
		return (
			<div className="comment-box">
				<textarea
					className={classNames({
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
						You must really read the article before you can comment
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
					iconLeft={this.props.isAllowedToPost ? 'checkmark' : 'locked'}
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