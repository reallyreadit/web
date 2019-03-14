import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import CommentThread from '../../../../common/models/CommentThread';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import CommentList from '../controls/comments/CommentList';
import CommentBox from '../controls/comments/CommentBox';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { clientTypeQueryStringKey } from '../../../../common/routing/queryString';
import RatingSelector from '../../../../common/components/RatingSelector';
import Rating from '../../../../common/models/Rating';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';

export function findComment(id: string, threads: CommentThread[]): CommentThread | null {
	for (const thread of threads) {
		if (thread.id === id) {
			return thread;
		}
		const match = findComment(id, thread.children);
		if (match) {
			return match;
		}
	}
	return null;
}
export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(routes, location, [clientTypeQueryStringKey]).getPathParams(location.path);
	let result = {
		slug: params['sourceSlug'] + '_' + params['articleSlug']
	} as {
		commentId?: string,
		slug: string
	};
	if ('commentId' in params) {
		result.commentId = params['commentId'];
	}
	return result;
}
export function mergeComment(comment: CommentThread, comments: CommentThread[]) {
	if (comment.parentCommentId) {
		findComment(comment.parentCommentId, comments)
			.children
			.unshift(comment);
	} else {
		comments.unshift(comment);
	}
	return comments;
}
export interface Props {
	article: Fetchable<UserArticle>,
	comments: Fetchable<CommentThread[]>,
	highlightedCommentId: string | null,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	user: UserAccount | null
}
export default class CommentsScreen extends React.PureComponent<Props> {
	private readonly _noop = () => { };
	private readonly _selectRating = (score: number) => {
		return this.props.onRateArticle(
			this.props.article.value,
			score
		);
	};
	public render() {
		const
			isUserSignedIn = !!this.props.user,
			isAllowedToPost = this.props.article.value && isUserSignedIn && this.props.article.value.isRead;
		return (
			<div className="comments-screen_udh2l6">
				{this.props.article.isLoading || this.props.comments.isLoading ?
					<LoadingOverlay /> :
					<>
						<ArticleDetails
							article={this.props.article.value}
							isUserSignedIn={isUserSignedIn}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onRead={this.props.onReadArticle}
							onShare={this.props.onShare}
							onToggleStar={this.props.onToggleArticleStar}
							onViewComments={this._noop}
						/>
						{this.props.article.value.isRead ?
							<RatingSelector
								{
									...{
										...this.props.article.value,
										onSelectRating: this._selectRating
									}
								}
							/> :
							null}
						<h3>Comments</h3>
						<CommentBox
							articleId={this.props.article.value.id}
							isAllowedToPost={isAllowedToPost}
							onPostComment={this.props.onPostComment}
						/>
						{this.props.comments.value ?
							this.props.comments.value.length ?
								<CommentList
									comments={this.props.comments.value}
									highlightedCommentId={this.props.highlightedCommentId}
									isAllowedToPost={isAllowedToPost}
									mode="reply"
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onPostComment={this.props.onPostComment}
									onShare={this.props.onShare}
									user={this.props.user}
								/> :
								<span>No comments found! (Post one!)</span> :
							null}
					</>}
			</div>
		);
	}
}