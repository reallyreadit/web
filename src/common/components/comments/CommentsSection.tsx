import * as React from 'react';
import UserAccount from '../../models/UserAccount';
import UserArticle from '../../models/UserArticle';
import CommentThread from '../../models/CommentThread';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import CommentComposer from './CommentComposer';
import CommentDetails from './CommentDetails';
import ContentBox from '../ContentBox';

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
		<div className="comments-section_mqmgnd">
			<ContentBox className="post">
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
			</ContentBox>
			{props.comments.length ?
				<ul className="comments">
					{props.comments.map(
						comment => (
							<li key={comment.id}>
								<CommentDetails
									comment={comment}
									highlightedCommentId={props.highlightedCommentId}
									isAllowedToPost={isAllowedToPost}
									onCopyTextToClipboard={props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
									onPostComment={props.onPostComment}
									onShare={props.onShare}
									user={props.user}
								/>
							</li>
						)
					)}
				</ul> :
				<ContentBox className="no-comments">No comments yet</ContentBox>}
		</div>
	);
};