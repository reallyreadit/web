import * as React from 'react';
import Comment from '../../../../../common/models/Comment';
import CommentDetails from './CommentDetails';

export default class CommentList extends React.Component<{
    comments: Comment[],
    mode: 'reply' | 'link',
    isAllowedToPost?: boolean,
    parentCommentId?: string,
    onCommentAdded?: (comment: Comment) => void,
    onViewThread?: (comment: Comment) => void,
    highlightedCommentId?: string
}, {}> {
    public render() {
        return (
            <ul className="comment-list">
                {this.props.comments.map(comment =>
                    <CommentDetails
                        key={comment.id}
                        comment={comment}
                        mode={this.props.mode}
                        isAllowedToPost={this.props.isAllowedToPost}
                        parentCommentId={this.props.parentCommentId}
                        onCommentAdded={this.props.onCommentAdded}
                        onViewThread={this.props.onViewThread}
                        highlightedCommentId={this.props.highlightedCommentId}
                    />)}
            </ul>
        );
    }
}