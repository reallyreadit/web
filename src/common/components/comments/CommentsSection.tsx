import * as React from 'react';
import UserAccount from '../../models/UserAccount';
import UserArticle from '../../models/UserArticle';
import CommentThread from '../../models/CommentThread';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import CommentDetails from './CommentDetails';
import ContentBox from '../ContentBox';
import CommentForm from '../../models/social/CommentForm';

export default (props: {
	article: UserArticle,
	comments: CommentThread[],
	highlightedCommentId?: string | null,
	imagePath: string,
	noCommentsMessage: string,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment: (form: CommentForm) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewProfile?: (userName: string) => void,
	user: UserAccount | null
}) => {
	const isAllowedToPost = props.article && props.user && props.article.isRead;
	return (
		<div className="comments-section_mqmgnd">
			{!isAllowedToPost ?
				<ContentBox className="post">
					<div className="locked">
						<img
							alt="Padlock"
							src={props.imagePath + '/padlock.svg'}
						/>
						You must read the article before you can post or reply.
					</div>
				</ContentBox> :
				null}
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
				<ContentBox className="no-comments">{props.noCommentsMessage}</ContentBox>}
		</div>
	);
};