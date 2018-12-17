import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import Comment from '../../../../common/models/Comment';
import ArticleList from '../controls/articles/ArticleList';
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
import VerificationTokenData from '../../../../common/models/VerificationTokenData';
import { clientTypeQueryStringKey } from '../../../../common/routing/queryString';

function findComment(id: number, comment: Comment) {
	if (comment.id === id) {
		return comment;
	}
	let match: Comment = null;
	for (let i = 0; match == null && i < comment.children.length; i++) {
		match = findComment(id, comment.children[i]);
	}
	return match;
}
export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(routes, location, [clientTypeQueryStringKey]).getPathParams(location.path);
	if ('token' in params) {
		return {
			proofToken: params['token']
		};
	} else {
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
}
interface Props {
	location: RouteLocation,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetComments: FetchFunctionWithParams<{ proofToken?: string, slug?: string }, Comment[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	tokenData: Fetchable<VerificationTokenData>,
	user: UserAccount | null
}
export default class extends React.Component<
	Props,
	{ comments: Fetchable<Comment[]> }
> {
	private readonly _addComment = (text: string, articleId: number) => {
		return this.props
			.onPostComment(text, articleId)
			.then(comment => {
				this.setState({ comments: { ...this.state.comments, value: [comment, ...this.state.comments.value] } });
			});
	};
	private readonly _addReply = (text: string, articleId: number, parentCommentId?: number) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(comment => {
				const comments = this.state.comments.value.slice();
				let parent: Comment = null;
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
			isAllowedToPost = this.props.tokenData.value && isUserSignedIn && this.props.tokenData.value.article.isRead,
			pathParams = getPathParams(this.props.location);
		return (
			<div className="comments-screen_udh2l6">
				{this.props.tokenData.isLoading || this.state.comments.isLoading ?
					<LoadingOverlay /> :
					<>
						{this.props.tokenData.value.readerName ?
							<div className="proof">
								<div className="reader">
									<div className="text">
										<strong>{this.props.tokenData.value.readerName} read</strong> {this.props.tokenData.value.article.title}.
									</div>
								</div>
								<div className="stamp">
									<img src="/images/proof-stamp.svg" alt="Proof Stamp" />
								</div>
							</div> :
							null}
						<ArticleList>
							<li>
								<ArticleDetails
									article={this.props.tokenData.value.article}
									isUserSignedIn={isUserSignedIn}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShareArticle}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this._noop}
								/>
							</li>
						</ArticleList>
						<h3>Comments</h3>
						<CommentBox
							articleId={this.props.tokenData.value.article.id}
							isAllowedToPost={isAllowedToPost}
							onPostComment={this._addComment}
						/>
						{this.state.comments.value ?
							this.state.comments.value.length ?
								<CommentList
									comments={this.state.comments.value}
									highlightedCommentId={'commentId' in pathParams ? parseInt(pathParams.commentId) : null}
									isAllowedToPost={isAllowedToPost}
									mode="reply"
									onPostComment={this._addReply}
								/> :
								<span>No comments found! (Post one!)</span> :
							null}
					</>}
			</div>
		);
	}
}