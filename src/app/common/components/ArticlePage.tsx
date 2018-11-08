import * as React from 'react';
import Fetchable from '../serverApi/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import Comment from '../../../common/models/Comment';
import ArticleList from './controls/articles/ArticleList';
import ArticleDetails from '../../../common/components/ArticleDetails';
import CommentList from './controls/comments/CommentList';
import CommentBox from './controls/comments/CommentBox';
import UserAccount from '../../../common/models/UserAccount';
import { Screen } from './Root';
import Location from '../../../common/routing/Location';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';
import CallbackStore from '../CallbackStore';
import LoadingOverlay from './controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../serverApi/ServerApi';

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
function getPathParams(path: string) {
	const [, sourceSlug, articleSlug, commentId] = path.match(findRouteByKey(routes, ScreenKey.Comments).pathRegExp);
	return {
		commentId,
		slug: sourceSlug + '_' + articleSlug
	}
}
interface Props {
	article: Fetchable<UserArticle>
	articleSlug: string,
	highlightedCommentId: number | null,
	isUserSignedIn: boolean,
	onGetComments: FetchFunctionWithParams<{ slug: string }, Comment[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>
}
class ArticlePage extends React.Component<
	Props,
	{ comments: Fetchable<Comment[]> }
> {
	private readonly _callbacks = new CallbackStore();
	private readonly _noop = () => {};
	private _loadComments = () => {
		return this.props.onGetComments(
			{ slug: this.props.articleSlug },
			this._callbacks.add(comments => { this.setState({ comments }); })
		);
	};
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
	constructor(props: Props) {
		super(props);
		this.state = {
			comments: this._loadComments()
		};
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
	}
	public render() {
		const isAllowedToPost = this.props.article.value && this.props.isUserSignedIn && this.props.article.value.isRead;
		return (
			<div className="article-page">
				{this.props.article.isLoading || this.state.comments.isLoading ?
					<LoadingOverlay /> :
					<>
						<ArticleList>
							{this.props.article.value ?
								<li>
									<ArticleDetails
										article={this.props.article.value}
										isUserSignedIn={this.props.isUserSignedIn}
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
									highlightedCommentId={this.props.highlightedCommentId}
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
export default function <TScreenKey>(key: TScreenKey, deps: {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onGetComments: FetchFunctionWithParams<{ slug: string }, Comment[]>,
	onGetUser: () => UserAccount | null,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onSetScreenState: (key: TScreenKey, state: Partial<Screen<Fetchable<UserArticle>>>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>
}) {
	return {
		create: (location: Location) => {
			const article = deps.onGetArticle({ slug: getPathParams(location.path).slug }, article => {
				deps.onSetScreenState(key, {
					componentState: article,
					title: article.value.title
				});
			});
			return {
				key,
				location,
				componentState: article,
				title: article.value ? article.value.title : 'Loading...'
			};
		},
		render: (state: Screen<Fetchable<UserArticle>>) => {
			const pathParams = getPathParams(state.location.path);
			return (
				<ArticlePage
					article={state.componentState}
					articleSlug={pathParams.slug}
					highlightedCommentId={parseInt(pathParams.commentId)}
					isUserSignedIn={!!deps.onGetUser()}
					onGetComments={deps.onGetComments}
					onPostComment={deps.onPostComment}
					onReadArticle={deps.onReadArticle}
					onShareArticle={deps.onShareArticle}
					onToggleArticleStar={deps.onToggleArticleStar}
				/>
			);
		}
	};
}