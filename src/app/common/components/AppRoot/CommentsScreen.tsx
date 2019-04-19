import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CommentsScreen, { getPathParams, Props as CommentScreenProps } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import { mergeComment } from '../../../../common/comments';

interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'comments' | 'onPostComment'>> {
	articleSlug: string,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
}
class AppCommentsScreen extends React.Component<
	Props,
	{
		comments: Fetchable<CommentThread[]>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _postComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(comment => {
				this.setState({
					comments: {
						...this.state.comments,
						value: mergeComment(comment, this.state.comments.value.slice())
					}
				});
			});
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				if (this.props.article.value && this.props.article.value.id === updatedArticle.id) {
					this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState.value = updatedArticle;
					}));
				}
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
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'onSetScreenState' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => {
		deps.onSetScreenState(key, getNextState);
	};
	return {
		create: (location: RouteLocation) => {
			const
				pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					setScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState = article;
						currentState.title = article.value.title;
					}));
				});
			return {
				key,
				location,
				componentState: article,
				title: article.value ? article.value.title : 'Loading...'
			};
		},
		render: (state: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<AppCommentsScreen
					{
						...{
							...deps,
							article: state.componentState,
							articleSlug: pathParams.slug,
							highlightedCommentId: pathParams.commentId,
							onSetScreenState: setScreenState,
							user: sharedState.user
						}
					}
				/>
			);
		}
	};
}