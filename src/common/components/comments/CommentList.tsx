import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentDetails from './CommentDetails';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import UserAccount from '../../models/UserAccount';

export default class CommentList extends React.Component<{
    comments: CommentThread[],
    highlightedCommentId?: string,
    isAllowedToPost?: boolean,
    mode: 'reply' | 'link',
    onCopyTextToClipboard: (text: string, successMessage: string) => void,
    onCreateAbsoluteUrl: (path: string) => string,
    onPostComment?: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
    onShare: (data: ShareData) => ShareChannel[],
    onViewThread?: (comment: CommentThread) => void,
    parentCommentId?: string,
    user: UserAccount | null
}, {}> {
    public render() {
        return (
            <ul className="comment-list_ba2upz">
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
                        onShare={this.props.onShare}
                        onViewThread={this.props.onViewThread}
                        parentCommentId={this.props.parentCommentId}
                        user={this.props.user}
                    />)}
            </ul>
        );
    }
}