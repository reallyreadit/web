import * as React from 'react';
import Post, { createCommentThread } from '../models/social/Post';
import ArticleDetails from './ArticleDetails';
import UserArticle from '../models/UserArticle';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import CommentDetails from './comments/CommentDetails';
import UserAccount from '../models/UserAccount';
import ContentBox from './ContentBox';
import PostHeader from './PostHeader';
import CommentThread from '../models/CommentThread';
import classNames from 'classnames';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPost: (article: UserArticle) => void,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile?: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	post: Post,
	user: UserAccount | null
}
export default class PostDetails extends React.Component<Props> {
	public render() {
		return (
			<ContentBox className={classNames('post-details_8qx033', { 'alert': this.props.post.hasAlert })}>
				<ArticleDetails
					article={this.props.post.article}
					isUserSignedIn={!!this.props.user}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onPost={this.props.onPost}
					onRead={this.props.onRead}
					onShare={this.props.onShare}
					onToggleStar={this.props.onToggleStar}
					onViewComments={this.props.onViewComments}
				/>
				{this.props.post.comment ?
					<CommentDetails
						comment={createCommentThread(this.props.post)}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onShare={this.props.onShare}
						onViewProfile={this.props.onViewProfile}
						onViewThread={this.props.onViewThread}
						user={this.props.user}
					/> :
					<PostHeader
						userName={this.props.post.userName}
						leaderboardBadge={this.props.post.badge}
						date={this.props.post.date}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
					/>}
			</ContentBox>
		);
	}
}