import * as React from 'react';
import UserAccount from '../../models/UserAccount';
import UserArticle from '../../models/UserArticle';
import CommentThread from '../../models/CommentThread';
import ShareResponse from '../../sharing/ShareResponse';
import ShareData from '../../sharing/ShareData';
import CommentDetails from './CommentDetails';
import ContentBox from '../ContentBox';
import CommentForm from '../../models/social/CommentForm';
import CommentDeletionForm from '../../models/social/CommentDeletionForm';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import CommentAddendumForm from '../../models/social/CommentAddendumForm';
import Icon from '../Icon';

export default (props: {
	article: UserArticle,
	comments: CommentThread[],
	highlightedCommentId?: string | null,
	noCommentsMessage: string,
	onAuthenticationRequired?: (completionDelegate?: () => void) => Function,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onShare: (data: ShareData) => ShareResponse,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}) => {
	const isAllowedToPost = props.article.isRead;
	return (
		<div className="comments-section_mqmgnd">
			{!isAllowedToPost ?
				<ContentBox className="post">
					<div className="locked">
						<Icon
							className="padlock"
							display="block"
							name="padlock"
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
									onAuthenticationRequired={props.onAuthenticationRequired}
									onCloseDialog={props.onCloseDialog}
									onCopyTextToClipboard={props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
									onDeleteComment={
										isAllowedToPost ?
											props.onDeleteComment :
											null
									}
									onNavTo={props.onNavTo}
									onOpenDialog={props.onOpenDialog}
									onPostComment={
										isAllowedToPost ?
											props.onPostComment :
											null
									}
									onPostCommentAddendum={
										isAllowedToPost ?
											props.onPostCommentAddendum :
											null
									}
									onPostCommentRevision={
										isAllowedToPost ?
											props.onPostCommentRevision :
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