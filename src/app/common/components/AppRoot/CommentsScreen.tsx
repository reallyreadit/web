import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Comment from '../../../../common/models/Comment';
import AsyncTracker from '../../AsyncTracker';

interface Props {
	article: Fetchable<UserArticle>
	onGetComments: FetchFunctionWithParams<{ slug: string }, Comment[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onReloadArticle: (slug: string) => void,
	onSetScreenState: (state: Partial<Screen<Fetchable<UserArticle>>>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	path: string,
	user: UserAccount | null
}
class AppCommentsScreen extends React.Component<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				if (this.props.article.value && this.props.article.value.id === updatedArticle.id) {
					this.props.onSetScreenState({
						componentState: {
							isLoading: false,
							value: updatedArticle
						}
					});
				}
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<CommentsScreen
				article={this.props.article}
				onGetComments={this.props.onGetComments}
				onPostComment={this.props.onPostComment}
				onReadArticle={this.props.onReadArticle}
				onShareArticle={this.props.onShareArticle}
				onToggleArticleStar={this.props.onToggleArticleStar}
				path={this.props.path}
				user={this.props.user}
			/>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'onReloadArticle' | 'onSetScreenState' | 'path' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onSetScreenState: (key: TScreenKey, state: Partial<Screen<Fetchable<UserArticle>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (state: Partial<Screen<Fetchable<UserArticle>>>) => {
		deps.onSetScreenState(key, state);
	};
	const reloadArticle = (slug: string) => {
		setScreenState({
			componentState: deps.onGetArticle({ slug }, article => {
				setScreenState({ componentState: article });
			})
		});
	};
	return {
		create: (location: RouteLocation) => {
			const article = deps.onGetArticle({ slug: getPathParams(location.path).slug }, article => {
				setScreenState({
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
		render: (state: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => (
			<AppCommentsScreen
				article={state.componentState}
				onGetComments={deps.onGetComments}
				onPostComment={deps.onPostComment}
				onReadArticle={deps.onReadArticle}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onReloadArticle={reloadArticle}
				onSetScreenState={setScreenState}
				onShareArticle={deps.onShareArticle}
				onToggleArticleStar={deps.onToggleArticleStar}
				path={state.location.path}
				user={sharedState.user}
			/>
		)
	};
}