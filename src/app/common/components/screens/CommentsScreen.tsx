import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import CommentThread from '../../../../common/models/CommentThread';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import CommentList from '../controls/comments/CommentList';
import CommentBox from '../controls/comments/CommentBox';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { clientTypeQueryStringKey } from '../../../../common/routing/queryString';
import RatingSelector from '../../../../common/components/RatingSelector';
import Rating from '../../../../common/models/Rating';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';

function findComment(id: string, comment: CommentThread) {
	if (comment.id === id) {
		return comment;
	}
	let match: CommentThread = null;
	for (let i = 0; match == null && i < comment.children.length; i++) {
		match = findComment(id, comment.children[i]);
	}
	return match;
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
interface Props {
	article: Fetchable<UserArticle>,
	location: RouteLocation,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	user: UserAccount | null
}
export default class extends React.Component<
	Props,
	{ comments: Fetchable<CommentThread[]> }
> {
	private readonly _addComment = (text: string, articleId: number) => {
		return this.props
			.onPostComment(text, articleId)
			.then(comment => {
				this.setState({ comments: { ...this.state.comments, value: [comment, ...this.state.comments.value] } });
			});
	};
	private readonly _addReply = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(comment => {
				const comments = this.state.comments.value.slice();
				let parent: CommentThread = null;
				for (let i = 0; parent == null && i < comments.length; i++) {
					if (comments[i].id === comment.parentCommentId) {
						parent = comments[i];
					} else {
						parent = findComment(comment.parentCommentId, comments[i]);
					}
				}
				parent.children.push(comment);
				this.setState({ comments: { ...this.state.comments, value: comments } });
			});
	};
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _loadComments = () => {
		return this.props.onGetComments(
			getPathParams(this.props.location),
			this._asyncTracker.addCallback(comments => { this.setState({ comments }); })
		);
	};
	private readonly _noop = () => { };
	private readonly _selectRating = (score: number) => {
		return this.props.onRateArticle(
			this.props.article.value,
			score
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			comments: this._loadComments()
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const
			isUserSignedIn = !!this.props.user,
			isAllowedToPost = this.props.article.value && isUserSignedIn && this.props.article.value.isRead,
			pathParams = getPathParams(this.props.location);
		return (
			<div className="comments-screen_udh2l6">
				{this.props.article.isLoading || this.state.comments.isLoading ?
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
							onPostComment={this._addComment}
						/>
						{this.state.comments.value ?
							this.state.comments.value.length ?
								<CommentList
									comments={this.state.comments.value}
									highlightedCommentId={'commentId' in pathParams ? pathParams['commentId'] : null}
									isAllowedToPost={isAllowedToPost}
									mode="reply"
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onPostComment={this._addReply}
									onShare={this.props.onShare}
								/> :
								<span>No comments found! (Post one!)</span> :
							null}
					</>}
			</div>
		);
	}
}