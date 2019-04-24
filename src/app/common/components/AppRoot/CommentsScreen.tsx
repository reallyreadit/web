import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CommentsScreen, { getPathParams, Props as CommentScreenProps } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import { mergeComment } from '../../../../common/comments';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';

interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'article' | 'comments' | 'onPostComment'>> {
	articleSlug: string,
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterCommentPostedHandler: (handler: (comment: CommentThread) => void) => Function
}
class AppCommentsScreen extends React.Component<
	Props,
	{
		article: Fetchable<UserArticle>,
		comments: Fetchable<CommentThread[]>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _postComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(() => { });
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (this.state.article.value && this.state.article.value.id === event.article.id) {
					this.setState({
						article: {
							...this.state.article,
							value: event.article
						}
					});
				}
			}),
			props.onRegisterCommentPostedHandler(comment => {
				if (this.state.article.value && this.state.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: mergeComment(comment, this.state.comments.value.slice())
						}
					});
				}
			})
		);
		this.state = {
			article: this.props.onGetArticle(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback(article => {
					this.setState({ article });
				})
			),
			comments: this.props.onGetComments(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback(comments => {
					this.setState({ comments });
				})
			)
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<CommentsScreen
				{
					...{
						...this.props,
						...this.state,
						onPostComment: this._postComment
					}
				}
			/>
		);
	}
}
type Dependencies = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'user'>>;
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies) {
	return {
		create: (location: RouteLocation) => ({
			key,
			location,
			title: 'Comments'
		}),
		render: (state: Screen, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<AppCommentsScreen
					{
						...{
							...deps,
							articleSlug: pathParams.slug,
							highlightedCommentId: pathParams.commentId,
							user: sharedState.user
						}
					}
				/>
			);
		}
	};
}