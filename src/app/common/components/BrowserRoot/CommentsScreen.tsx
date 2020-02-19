import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams, Props as CommentScreenProps } from '../screens/CommentsScreen';
import { Screen } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import { SharedState } from '../BrowserRoot';
import { formatFetchable } from '../../../../common/format';
import { mergeComment, updateComment } from '../../../../common/comments';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import CommentForm from '../../../../common/models/social/CommentForm';

function createTitle(articleTitle: string) {
	return `Comments on “${articleTitle}” • Readup`;
}
interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'comments' | 'onPostComment'>> {
	articleSlug: string,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (form: CommentForm) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterCommentPostedHandler: (handler: (comment: CommentThread) => void) => Function,
	onRegisterCommentUpdatedHandler: (handler: (comment: CommentThread) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onReloadArticle: (screenId: number, slug: string) => void,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void,
	screenId: number
}
class BrowserCommentsScreen extends React.Component<
	Props,
	{
		comments: Fetchable<CommentThread[]>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _postComment = (form: CommentForm) => {
		return this.props
			.onPostComment(form)
			.then(() => { });
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (this.props.article.value && this.props.article.value.id === event.article.id) {
					this.props.onSetScreenState(this.props.screenId, produce((currentState: Screen<Fetchable<UserArticle>>) => {
						currentState.componentState.value = event.article;
					}));
				}
			}),
			props.onRegisterCommentPostedHandler(comment => {
				if (this.props.article.value && this.props.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: mergeComment(comment, this.state.comments.value.slice())
						}
					});
				}
			}),
			props.onRegisterCommentUpdatedHandler(comment => {
				if (this.props.article.value && this.props.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: updateComment(comment, this.state.comments.value.slice())
						}
					});
				}
			}),
			props.onRegisterUserChangeHandler(user => {
				this.props.onReloadArticle(this.props.screenId, this.props.articleSlug);
			})
		);
		this.state = {
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
					comments: this.state.comments,
					onPostComment: this._postComment
				}
				}
			/>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'onReloadArticle' | 'screenId' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const reloadArticle = (screenId: number, slug: string) => {
		deps.onGetArticle({ slug }, article => {
			deps.onSetScreenState(screenId, produce((currentState: Screen<Fetchable<UserArticle>>) => {
				currentState.componentState = article;
			}));
		});
	};
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const
				pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					deps.onSetScreenState(
						id,
						produce((currentState: Screen<Fetchable<UserArticle>>) => {
							currentState.componentState = article;
							if (article.value) {
								currentState.title = createTitle(article.value.title);
							} else {
								currentState.title = 'Article not found';
							}
						})
					);
				});
			return {
				id,
				componentState: article,
				key,
				location,
				title: formatFetchable(
					article,
					article => createTitle(article.title),
					'Loading...',
					'Article not found'
				)
			};
		},
		render: (state: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<BrowserCommentsScreen
					{
						...{
							...deps,
							...sharedState,
							article: state.componentState,
							articleSlug: pathParams.slug,
							highlightedCommentId: pathParams.commentId,
							onReloadArticle: reloadArticle,
							screenId: state.id
						}
					}
				/>
			);
		}
	};
}