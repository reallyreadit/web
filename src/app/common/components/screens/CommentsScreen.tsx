import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import CommentThread from '../../../../common/models/CommentThread';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import Rating from '../../../../common/models/Rating';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ScreenContainer from '../ScreenContainer';
import CommentsSection from '../../../../common/components/comments/CommentsSection';

export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(routes, location, unroutableQueryStringKeys).getPathParams(location.path);
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
export interface Props {
	article: Fetchable<UserArticle>,
	comments: Fetchable<CommentThread[]>,
	highlightedCommentId: string | null,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}
export default class CommentsScreen extends React.PureComponent<Props> {
	private readonly _noop = () => { };
	public render() {
		return (
			<ScreenContainer>
				<div className="comments-screen_udh2l6">
					{this.props.article.isLoading || this.props.comments.isLoading ?
						<LoadingOverlay /> :
						<>
							<ArticleDetails
								article={this.props.article.value}
								isUserSignedIn={!!this.props.user}
								onCopyTextToClipboard={this.props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onPost={this.props.onPostArticle}
								onRead={this.props.onReadArticle}
								onShare={this.props.onShare}
								onToggleStar={this.props.onToggleArticleStar}
								onViewComments={this._noop}
							/>
							<CommentsSection
								article={this.props.article.value}
								comments={this.props.comments.value}
								highlightedCommentId={this.props.highlightedCommentId}
								imagePath="/images"
								noCommentsMessage="Be the first to post a comment on this article."
								onCopyTextToClipboard={this.props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onPostComment={this.props.onPostComment}
								onShare={this.props.onShare}
								onViewProfile={this.props.onViewProfile}
								user={this.props.user}
							/>
						</>}
				</div>
			</ScreenContainer>
		);
	}
}