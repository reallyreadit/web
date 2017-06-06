import * as React from 'react';
import Comment from '../../../common/models/Comment';
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import ActionLink from '../../../common/components/ActionLink';
import * as className from 'classnames';

interface Props {
	comment: Comment,
	mode: 'reply' | 'link',
	isAllowedToPost?: boolean,
	parentCommentId?: string,
	onCommentAdded?: (comment: Comment) => void,
	onViewThread?: (comment: Comment) => void,
	highlightedCommentId?: string
}
export default class CommentDetails extends React.Component<Props, {
	showCommentBox: boolean,
	children: Comment[]
}> {
	private _showCommentBox = () => this.setState({ showCommentBox: true });
	private _hideCommentBox = () => this.setState({ showCommentBox: false });
	private _addComment = (comment: Comment) => {
		const children = this.state.children.slice();
		children.splice(Math.max(children.findIndex(c => c.dateCreated < comment.dateCreated), 0), 0, comment);
		this.setState({ children, showCommentBox: false });
		this.props.onCommentAdded(comment);
	};
	private _viewThread = () => this.props.onViewThread(this.props.comment);
	constructor(props: Props) {
		super(props);
		this.state = {
			showCommentBox: false,
			children: props.comment.children.slice()
		};
	}
	public render(): JSX.Element {
		return (
			<li className={className(
					'comment-details',
					{ unread: this.props.mode === 'link' && !this.props.comment.dateRead },
					{ highlight: this.props.comment.id === this.props.highlightedCommentId }
				)}>
				{this.props.mode === 'link' ? <div className="article-title">{this.props.comment.articleTitle}</div> : null}
				<div className="title">Posted by <strong>{this.props.comment.userAccount}</strong> on {this.props.comment.dateCreated}</div>
				<div className={className('text', { 'preview': this.props.mode === 'link' })} dangerouslySetInnerHTML={{ __html: this.props.comment.text.replace(/\n/g, '<br />') }}></div>
				{this.state.showCommentBox ? 
					<CommentBox articleId={this.props.comment.articleId} parentCommentId={this.props.comment.id} isAllowedToPost={this.props.isAllowedToPost} onCommentPosted={this._addComment} onCancel={this._hideCommentBox} /> :
					this.props.mode === 'reply' ?
						this.props.isAllowedToPost ?
							<ActionLink text="Reply" iconLeft="backward" onClick={this._showCommentBox} /> :
							null :
						<ActionLink text="View Thread" iconLeft="comments" onClick={this._viewThread} />}
				{this.state.children.length ?
					<CommentList
						comments={this.state.children}
						mode={this.props.mode}
						isAllowedToPost={this.props.isAllowedToPost}
						parentCommentId={this.props.comment.id}
						onCommentAdded={this.props.onCommentAdded}
						onViewThread={this.props.onViewThread}
						highlightedCommentId={this.props.highlightedCommentId}
						/> :
					null}
			</li>
		);
	}
}