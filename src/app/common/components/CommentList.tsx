import * as React from 'react';
import Comment from '../api/models/Comment';
import CommentDetails from './CommentDetails';

export default class CommentList extends React.Component<{
    comments: Comment[],
    isAllowedToPost: boolean,
    parentCommentId?: string,
    onCommentAdded: (comment: Comment) => void
}, {}> {
    public render() {
        return (
            <ul className="comment-list">
                {this.props.comments.map(comment => <CommentDetails key={comment.id} comment={comment} isAllowedToPost={this.props.isAllowedToPost} parentCommentId={this.props.parentCommentId} onCommentAdded={this.props.onCommentAdded} />)}
            </ul>
        );
    }
}