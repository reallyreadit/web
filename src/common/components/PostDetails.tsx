import * as React from 'react';
import Post, { createCommentThread } from '../models/social/Post';
import ArticleDetails from './ArticleDetails';
import UserArticle from '../models/UserArticle';
import { ShareEvent } from '../sharing/ShareEvent';
import ShareResponse from '../sharing/ShareResponse';
import CommentDetails from './comments/CommentDetails';
import UserAccount from '../models/UserAccount';
import ContentBox from './ContentBox';
import PostHeader from './PostHeader';
import CommentThread from '../models/CommentThread';
import classNames from 'classnames';
import Rating from '../models/Rating';
import AotdMetadata from './AotdMetadata';
import {DeviceType} from '../DeviceType';
import { ShareChannelData } from '../sharing/ShareData';

interface Props {
	deviceType: DeviceType,
	highlightedCommentId?: string,
	highlightedPostId?: string,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPost: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	post: Post,
	user: UserAccount | null
}
export default class PostDetails extends React.Component<Props> {
	public render() {
		return (
			<div className="post-details_8qx033">
				<AotdMetadata
					article={this.props.post.article}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onViewProfile={this.props.onViewProfile}
				/>
				<ContentBox
					className={classNames('content', { 'alert': this.props.post.hasAlert })}
					highlight={
						(
							this.props.post.silentPostId && this.props.post.silentPostId === this.props.highlightedPostId
						) ||
						(
							this.props.post.comment && this.props.post.comment.id === this.props.highlightedCommentId
						)
					}
				>
					<ArticleDetails
						article={this.props.post.article}
						deviceType={this.props.deviceType}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onNavTo={this.props.onNavTo}
						onRateArticle={this.props.onRateArticle}
						onPost={this.props.onPost}
						onRead={this.props.onRead}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
						showAotdMetadata={false}
						onToggleStar={this.props.onToggleStar}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						user={this.props.user}
					/>
					{this.props.post.comment ?
						<CommentDetails
							comment={createCommentThread(this.props.post)}
							onCloseDialog={this.props.onCloseDialog}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onNavTo={this.props.onNavTo}
							onOpenDialog={this.props.onOpenDialog}
							onShare={this.props.onShare}
							onShareViaChannel={this.props.onShareViaChannel}
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
			</div>
		);
	}
}