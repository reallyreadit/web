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
import AsyncTracker from '../../AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import Location from '../../../../common/routing/Location';

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
export function getPathParams(location: Location) {
	const matches = location.path.match(findRouteByLocation(routes, location).pathRegExp);
	if (location.path.startsWith('/articles')) {
		return {
			commentId: matches[3],
			slug: matches[1] + '_' + matches[2]
		};
	}
	if (location.path.startsWith('/proof')) {
		return {
			slug: matches[2] + '_' + matches[3],
			userName: matches[1]
		}
	}
	throw new Error('Unexpected path');
}
interface Props {
	article: Fetchable<UserArticle>,
	location: Location,
	onGetComments: FetchFunctionWithParams<{ slug: string }, Comment[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
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
			{ slug: getPathParams(this.props.location).slug },
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
			isAllowedToPost = this.props.article.value && isUserSignedIn && this.props.article.value.isRead,
			pathParams = getPathParams(this.props.location);
		return (
			<div className="comments-screen_udh2l6">
				{this.props.article.isLoading || this.state.comments.isLoading ?
					<LoadingOverlay /> :
					<>
						{pathParams.userName ?
							<div>{pathParams.userName} really read this article!</div> :
							null}
						<ArticleList>
							{this.props.article.value ?
								<li>
									<ArticleDetails
										article={this.props.article.value}
										isUserSignedIn={isUserSignedIn}
										onRead={this.props.onReadArticle}
										onShare={this.props.onShareArticle}
										onToggleStar={this.props.onToggleArticleStar}
										onViewComments={this._noop}
									/>
								</li> :
								null}
						</ArticleList>
						<h3>Comments</h3>
						<CommentBox
							articleId={(this.props.article.value && this.props.article.value.id) || null}
							isAllowedToPost={isAllowedToPost}
							onPostComment={this._addComment}
						/>
						{this.state.comments.value ?
							this.state.comments.value.length ?
								<CommentList
									comments={this.state.comments.value}
									highlightedCommentId={parseInt(pathParams.commentId)}
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