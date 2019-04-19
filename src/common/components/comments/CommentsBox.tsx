import * as React from 'react';
import UserAccount from '../../models/UserAccount';
import UserArticle from '../../models/UserArticle';
import CommentThread from '../../models/CommentThread';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import CommentComposer from './CommentComposer';
import CommentList from './CommentList';

export default (props: {
	article: UserArticle,
	comments: CommentThread[],
	highlightedCommentId?: string | null,
	imagePath: string,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	user: UserAccount | null
}) => {
	const
		isUserSignedIn = !!props.user,
		isAllowedToPost = props.article && isUserSignedIn && props.article.isRead;
	return (
		<div className="comments-box_o5c6fe">
			{isAllowedToPost ?
				<CommentComposer
					articleId={props.article.id}
					isAllowedToPost={isAllowedToPost}
					onPostComment={props.onPostComment}
				/> :
				<div className="locked">
					<img
						alt="Padlock"
						src={props.imagePath + '/padlock.svg'}
					/>
					You must read the article before you can comment.
				</div>}
			{props.comments.length ?
				<CommentList
					comments={props.comments}
					highlightedCommentId={props.highlightedCommentId}
					isAllowedToPost={isAllowedToPost}
					mode="reply"
					onCopyTextToClipboard={props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
					onPostComment={props.onPostComment}
					onShare={props.onShare}
					user={props.user}
				/> :
				<span className="no-comments">No comments yet</span>}
		</div>
	);
};