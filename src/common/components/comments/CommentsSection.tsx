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
	onViewProfile?: (userName: string) => void,
	user: UserAccount | null
}) => {
	const isAllowedToPost = props.article && props.user && props.article.isRead;
	return (
		<div className="comments-section_mqmgnd">
			<ContentBox className="post">
				{isAllowedToPost ?
					<CommentComposer
						articleId={props.article.id}
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
									onCopyTextToClipboard={props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
									onPostComment={
										isAllowedToPost ?
											props.onPostComment :
											null
									}
									onShare={props.onShare}
									onViewProfile={props.onViewProfile}
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