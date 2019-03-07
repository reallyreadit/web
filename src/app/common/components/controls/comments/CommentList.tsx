import * as React from 'react';
import Comment from '../../../../../common/models/Comment';
import CommentDetails from './CommentDetails';

export default class CommentList extends React.Component<{
    comments: Comment[],
    highlightedCommentId?: number,
    isAllowedToPost?: boolean,
    mode: 'reply' | 'link',
    onCopyTextToClipboard: (text: string, successMessage: string) => void,
    onCreateAbsoluteUrl: (path: string) => string,
    onPostComment?: (text: string, articleId: number, parentCommentId?: number) => Promise<void>,
    onViewThread?: (comment: Comment) => void,
    parentCommentId?: number
}, {}> {
    public render() {
        return (
            <ul className="comment-list_3zfaer">
                {this.props.comments.map(comment =>
                    <CommentDetails
                        key={comment.id}
                        comment={comment}
                        highlightedCommentId={this.props.highlightedCommentId}
                        isAllowedToPost={this.props.isAllowedToPost}
                        mode={this.props.mode}
                        onCopyTextToClipboard={this.props.onCopyTextToClipboard}
                        onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
                        onPostComment={this.props.onPostComment}
                        onViewThread={this.props.onViewThread}
                        parentCommentId={this.props.parentCommentId}
                    />)}
            </ul>
        );
    }
}