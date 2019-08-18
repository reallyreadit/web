import * as React from 'react';
import Post from '../models/social/Post';
import ArticleDetails from './ArticleDetails';
import UserArticle from '../models/UserArticle';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import CommentDetails from './comments/CommentDetails';
import UserAccount from '../models/UserAccount';
import ContentBox from './ContentBox';
import PostHeader from './PostHeader';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	post: Post,
	user: UserAccount | null
}
export default class PostDetails extends React.Component<Props> {
	public render() {
		return (
			<ContentBox className="post-details_8qx033">
				<ArticleDetails
					article={this.props.post.article}
					isUserSignedIn={!!this.props.user}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onRead={this.props.onRead}
					onShare={this.props.onShare}
					onToggleStar={this.props.onToggleStar}
					onViewComments={this.props.onViewComments}
				/>
				{this.props.post.comment ?
					<CommentDetails
						comment={this.props.post.comment}
						isAllowedToPost={this.props.user && this.props.post.article.isRead}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onShare={this.props.onShare}
						user={this.props.user}
					/> :
					<PostHeader
						userName={this.props.post.userName}
						leaderboardBadge={this.props.post.badge}
						date={this.props.post.date}
					/>}
			</ContentBox>
		);
	}
}