import * as React from 'react';
import Button from '../Button';
import classNames from 'classnames';
import AsyncTracker from '../../AsyncTracker';
import CommentForm from '../../models/social/CommentForm';
import ActionLink from '../ActionLink';
import MarkdownDialog from '../MarkdownDialog';

interface Props {
	articleId: number,
	onCancel?: () => void,
	onCloseDialog: () => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostComment: (form: CommentForm) => Promise<void>,
	parentCommentId?: string
}
export default class CommentComposer extends React.PureComponent<Props, {
	commentText: string,
	hasContent: boolean,
	hasFocus: boolean,
	isMousedown: boolean,
	isResizing: boolean,
	isPosting: boolean
}> {
	private readonly _asyncTracker = new AsyncTracker();
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
		if (window.reallyreadit && window.reallyreadit.app) {
			window.reallyreadit.app.isFocusedOnField = true;
		}
	};
	private _blur = () => {
		this.setState({ hasFocus: false });
		// iOS keyboard scroll bug
		if (window.reallyreadit && window.reallyreadit.app) {
			window.reallyreadit.app.isFocusedOnField = false;
			window.setTimeout(() => {
				if (!window.reallyreadit.app.isFocusedOnField && window.scrollY !== 0) {
					window.scrollTo(0, 0);
				}
			}, 100);
		}
	};
	private readonly _openMarkdownDialog = () => {
		this.props.onOpenDialog(
			<MarkdownDialog
				onClose={this.props.onCloseDialog}
			/>
		);
	};
	private _postComment = () => {
		this.setState({ isPosting: true });
		this.props
			.onPostComment({
				text: this.state.commentText,
				articleId: this.props.articleId,
				parentCommentId: this.props.parentCommentId
			})
			.then(this._asyncTracker.addCallback(() => {
				this.setState({
					commentText: '',
					hasContent: false,
					isPosting: false
				});
			}));
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
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const textareaStyle: { [key: string]: string } = {};
		if (!this.state.hasFocus && !this.state.hasContent) {
			textareaStyle['width'] = '100%';
			textareaStyle['height'] = this.props.parentCommentId ? '130px' : '64px';
		}
		return (
			<div className="comment-composer_fgo1ny">
				<textarea
					className={classNames({
						expanded: !!(this.props.parentCommentId || this.state.hasFocus || this.state.hasContent),
						resizing: this.state.isResizing
					})}
					value={this.state.commentText}
					onChange={this._updateCommentText}
					autoFocus={!!this.props.parentCommentId}
					onFocus={this._focus}
					onBlur={this._blur}
					onMouseDown={this._mousedown}
					onMouseMove={this._mousemove}
					onMouseUp={this._mouseup}
					placeholder="Share your thoughts."
					style={textareaStyle}
				/>
				<div className="controls">
					<ActionLink
						iconLeft="question-circle"
						onClick={this._openMarkdownDialog}
						text="Formatting Guide"
					/>
					<div className="buttons">
						{this.props.parentCommentId ?
							<Button
								text="Cancel"
								state={
									this.state.isPosting ?
										'disabled' :
										'normal'
								}
								onClick={this._cancel}
							/> :
							null}
						<Button
							text={`Post ${this.props.parentCommentId ? 'Reply' : 'Comment'}`}
							style="preferred"
							state={
								this.state.isPosting ?
									'busy' :
									this.state.hasContent ?
										'normal' :
										'disabled'
							}
							onClick={this._postComment}
						/>
					</div>
				</div>
			</div>
		);
	}
}