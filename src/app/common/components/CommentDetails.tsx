import * as React from 'react';
import Comment from '../api/models/Comment';
import CommentList from './CommentList';
import CommentBox from './CommentBox';

interface Props {
    comment: Comment,
    isAllowedToPost: boolean,
    parentCommentId?: string,
    onCommentAdded: (comment: Comment) => void
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
    constructor(props: Props) {
        super(props);
        this.state = {
            showCommentBox: false,
            children: props.comment.children.slice()
        };
    }
    public render(): JSX.Element {
        return (
            <li className="comment-details">
                <div className="title">Posted by <strong>{this.props.comment.userAccount}</strong> on {this.props.comment.dateCreated}</div>
				<div className="text">{this.props.comment.text}</div>
                {this.state.showCommentBox ? 
                    <CommentBox articleId={this.props.comment.articleId} parentCommentId={this.props.comment.id} isAllowedToPost={this.props.isAllowedToPost} onCommentPosted={this._addComment} onCancel={this._hideCommentBox} /> :
                    this.props.isAllowedToPost ? <span className="reply" onClick={this._showCommentBox}>Reply</span> : null}
                {this.state.children.length ? <CommentList comments={this.state.children} isAllowedToPost={this.props.isAllowedToPost} parentCommentId={this.props.comment.id} onCommentAdded={this.props.onCommentAdded} /> : null}
            </li>
        );
    }
}