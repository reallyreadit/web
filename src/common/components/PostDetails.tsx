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
import {DeviceType} from '../DeviceType';
import { ShareChannelData } from '../sharing/ShareData';
import AbstractCommentShareable from './AbstractCommentShareable';

interface Props {
	deviceType: DeviceType,
	highlightedCommentId?: string,
	highlightedPostId?: string,
	// Whether this PostDetails is a reply to a comment of the current user. Used for verbose copy in the PostHeader.
	isReply?: boolean,
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
export default class PostDetails extends AbstractCommentShareable<Props> {

	public render() {
		const commentThread = this._getCommentThread();
		return (
			<div className="post-details_8qx033">
				{this._hasComment() ?
					<PostHeader
						article={this.props.post.article}
						userName={commentThread.userAccount}
						leaderboardBadge={commentThread.badge}
						isAuthor={commentThread.isAuthor}
						isReply={this.props.isReply}
						isComment={true}
						date={commentThread.dateCreated}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onGetShareData={this._getShareData}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
						onViewProfile={this.props.onViewProfile}
						verbose={true}
					/> :
					<PostHeader
						article={this.props.post.article}
						userName={this.props.post.userName}
						leaderboardBadge={this.props.post.badge}
						isComment={false}
						date={this.props.post.date}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
						verbose={true}
				/>}
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
						onPost={this.props.onPost}
						onRateArticle={this.props.onRateArticle}
						onRead={this.props.onRead}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
						onToggleStar={this.props.onToggleStar}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						showAotdMetadata={false}
						showMetaActions={false}
						user={this.props.user}
					/>
					{ this._hasComment() ?
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
							showPostHeader={false}
						/> : null
					}
				</ContentBox>
			</div>
		);
	}
}