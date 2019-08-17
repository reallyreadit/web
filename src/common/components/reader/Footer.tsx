import * as React from 'react';
import RatingSelector from '../RatingSelector';
import UserArticle from '../../models/UserArticle';
import ShareData from '../../sharing/ShareData';
import ShareChannel from '../../sharing/ShareChannel';
import CommentThread from '../../models/CommentThread';
import Fetchable from '../../Fetchable';
import CommentsSection from '../comments/CommentsSection';
import UserAccount from '../../models/UserAccount';

export interface Props {
	article: UserArticle,
	autoHideRatingSelectorStatusText?: boolean,
	children?: React.ReactNode,
	comments?: Fetchable<CommentThread[]>,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onSelectRating: (rating: number) => Promise<{}>,
	onShare: (data: ShareData) => ShareChannel[],
	user: UserAccount | null
}
const render: React.SFC<Props> = (props: Props) => (
	<div className="footer_sg74y0">
		<RatingSelector
			article={props.article}
			autoHideStatusText={props.autoHideRatingSelectorStatusText}
			children={props.children}
			onCopyTextToClipboard={props.onCopyTextToClipboard}
			onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
			onSelectRating={props.onSelectRating}
			onShare={props.onShare}
		/>
		{props.comments && props.comments.value ?
			<CommentsSection
				article={props.article}
				comments={props.comments.value}
				imagePath="./images"
				onCopyTextToClipboard={props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
				onPostComment={props.onPostComment}
				onShare={props.onShare}
				user={props.user}
			/> :
			null}
	</div>
);
render.defaultProps = { autoHideRatingSelectorStatusText: true };
export default render;